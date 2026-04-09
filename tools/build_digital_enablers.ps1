Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$definitionsWorkbookPath = Join-Path $root 'digitalenablers\listado de habilitadores.xlsx'
$recordsWorkbookPath = Join-Path $root 'digitalenablers\habilitadores completos.xlsx'
$countriesSourcePath = Join-Path $root 'src\server\data\countries.js'
$generatedOutputPath = Join-Path $root 'data\generated\digital_enablers.json'
$publicOutputPath = Join-Path $root 'public\data\digital-enablers.json'

function ConvertTo-FlagEmoji {
  param([string]$Iso2)

  if ([string]::IsNullOrWhiteSpace($Iso2) -or $Iso2.Length -ne 2) {
    return ''
  }

  return ($Iso2.ToUpperInvariant().ToCharArray() | ForEach-Object {
    [char]::ConvertFromUtf32(([int][char]$_ + 127397))
  }) -join ''
}

function Read-ZippedXmlFile {
  param(
    [System.IO.Compression.ZipArchive]$ZipArchive,
    [string]$EntryName
  )

  $entry = $ZipArchive.GetEntry($EntryName)
  if (-not $entry) {
    return $null
  }

  $reader = [System.IO.StreamReader]::new($entry.Open())
  try {
    return $reader.ReadToEnd()
  } finally {
    $reader.Dispose()
  }
}

function Get-XlsxCellValue {
  param(
    [xml]$SharedStringsXml,
    $CellNode
  )

  if ($null -eq $CellNode) {
    return ''
  }

  $cellType = if ($CellNode.PSObject.Properties.Match('t').Count -gt 0) { [string]$CellNode.t } else { '' }
  $valueNode = if ($CellNode.PSObject.Properties.Match('v').Count -gt 0) { $CellNode.v } else { $null }
  $inlineNode = if ($CellNode.PSObject.Properties.Match('is').Count -gt 0) { $CellNode.is } else { $null }

  if ($cellType -eq 's' -and $null -ne $valueNode) {
    $sharedIndex = [int]$valueNode
    return [string]$SharedStringsXml.sst.si[$sharedIndex].InnerText
  }

  if ($cellType -eq 'inlineStr' -and $null -ne $inlineNode) {
    return [string]$inlineNode.InnerText
  }

  if ($null -ne $valueNode) {
    return [string]$valueNode
  }

  return ''
}

function Read-XlsxRows {
  param([string]$Path)

  $fileStream = [System.IO.File]::Open($Path, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)

  try {
    $zipArchive = [System.IO.Compression.ZipArchive]::new($fileStream, [System.IO.Compression.ZipArchiveMode]::Read, $false)

    try {
      $sharedStringsContent = Read-ZippedXmlFile -ZipArchive $zipArchive -EntryName 'xl/sharedStrings.xml'
      [xml]$sharedStringsXml = if ($sharedStringsContent) { $sharedStringsContent } else { '<sst />' }

      $sheetContent = Read-ZippedXmlFile -ZipArchive $zipArchive -EntryName 'xl/worksheets/sheet1.xml'
      if (-not $sheetContent) {
        throw "No se pudo leer la hoja principal de $Path"
      }

      [xml]$sheetXml = $sheetContent
      $rowNodes = @($sheetXml.worksheet.sheetData.row)
      if ($rowNodes.Count -eq 0) {
        return @()
      }

      $headerRow = $rowNodes[0]
      $headerByColumn = [ordered]@{}

      foreach ($cell in @($headerRow.c)) {
        $columnKey = ([string]$cell.r) -replace '\d', ''
        $headerByColumn[$columnKey] = (Get-XlsxCellValue -SharedStringsXml $sharedStringsXml -CellNode $cell).Trim()
      }

      $rows = [System.Collections.Generic.List[object]]::new()

      foreach ($rowNode in $rowNodes | Select-Object -Skip 1) {
        $cellValues = @{}

        foreach ($cell in @($rowNode.c)) {
          $columnKey = ([string]$cell.r) -replace '\d', ''
          $cellValues[$columnKey] = Get-XlsxCellValue -SharedStringsXml $sharedStringsXml -CellNode $cell
        }

        $rowObject = [ordered]@{}
        foreach ($columnKey in $headerByColumn.Keys) {
          $header = $headerByColumn[$columnKey]
          if ([string]::IsNullOrWhiteSpace($header)) {
            continue
          }
          $rowObject[$header] = [string]($cellValues[$columnKey] ?? '')
        }

        $rows.Add([pscustomobject]$rowObject)
      }

      return $rows.ToArray()
    } finally {
      $zipArchive.Dispose()
    }
  } finally {
    $fileStream.Dispose()
  }
}

function Normalize-Text {
  param([string]$Value)

  if ([string]::IsNullOrWhiteSpace($Value)) {
    return ''
  }

  $trimmed = $Value.Trim().ToLowerInvariant().Normalize([Text.NormalizationForm]::FormD)
  $builder = [System.Text.StringBuilder]::new()

  foreach ($character in $trimmed.ToCharArray()) {
    if ([Globalization.CharUnicodeInfo]::GetUnicodeCategory($character) -ne [Globalization.UnicodeCategory]::NonSpacingMark) {
      [void]$builder.Append($character)
    }
  }

  return (($builder.ToString() -replace '[^a-z0-9]+', ' ') -replace '\s+', ' ').Trim()
}

function New-Slug {
  param([string]$Value)

  $normalized = Normalize-Text $Value
  if (-not $normalized) {
    return ''
  }

  return $normalized -replace '\s+', '-'
}

function Get-LevenshteinDistance {
  param(
    [string]$Left,
    [string]$Right
  )

  $leftLength = $Left.Length
  $rightLength = $Right.Length

  if ($leftLength -eq 0) {
    return $rightLength
  }

  if ($rightLength -eq 0) {
    return $leftLength
  }

  $distances = New-Object 'int[,]' ($leftLength + 1), ($rightLength + 1)

  for ($leftIndex = 0; $leftIndex -le $leftLength; $leftIndex += 1) {
    $distances[$leftIndex, 0] = $leftIndex
  }

  for ($rightIndex = 0; $rightIndex -le $rightLength; $rightIndex += 1) {
    $distances[0, $rightIndex] = $rightIndex
  }

  for ($leftIndex = 1; $leftIndex -le $leftLength; $leftIndex += 1) {
    for ($rightIndex = 1; $rightIndex -le $rightLength; $rightIndex += 1) {
      $cost = if ($Left[$leftIndex - 1] -eq $Right[$rightIndex - 1]) { 0 } else { 1 }
      $deletion = $distances[($leftIndex - 1), $rightIndex] + 1
      $insertion = $distances[$leftIndex, ($rightIndex - 1)] + 1
      $substitution = $distances[($leftIndex - 1), ($rightIndex - 1)] + $cost

      $distances[$leftIndex, $rightIndex] = [Math]::Min([Math]::Min($deletion, $insertion), $substitution)
    }
  }

  return $distances[$leftLength, $rightLength]
}

function Get-SimilarityScore {
  param(
    [string]$Left,
    [string]$Right
  )

  if (-not $Left -or -not $Right) {
    return 0
  }

  $distance = Get-LevenshteinDistance -Left $Left -Right $Right
  $maxLength = [Math]::Max($Left.Length, $Right.Length)
  if ($maxLength -eq 0) {
    return 1
  }

  return 1 - ($distance / $maxLength)
}

function Resolve-BestMatch {
  param(
    [string]$Value,
    [string[]]$Candidates
  )

  $normalizedValue = Normalize-Text $Value
  if (-not $normalizedValue) {
    return $null
  }

  $exactMatch = $Candidates | Where-Object { (Normalize-Text $_) -eq $normalizedValue } | Select-Object -First 1
  if ($exactMatch) {
    return [pscustomobject]@{
      Name = $exactMatch
      Score = 1
      Strategy = 'exact'
    }
  }

  $bestCandidate = $null
  $bestScore = -1
  foreach ($candidate in $Candidates) {
    $candidateScore = Get-SimilarityScore -Left $normalizedValue -Right (Normalize-Text $candidate)
    if ($candidateScore -gt $bestScore) {
      $bestScore = $candidateScore
      $bestCandidate = $candidate
    }
  }

  if (-not $bestCandidate -or $bestScore -lt 0.72) {
    return $null
  }

  return [pscustomobject]@{
    Name = $bestCandidate
    Score = [Math]::Round($bestScore, 4)
    Strategy = 'similar'
  }
}

function Parse-JsMap {
  param(
    [string]$Source,
    [string]$VariableName
  )

  $pattern = "const\s+$VariableName\s*=\s*\{(?<body>.*?)\};"
  $match = [regex]::Match($Source, $pattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)
  if (-not $match.Success) {
    throw "No se pudo encontrar el mapa $VariableName en countries.js"
  }

  $result = @{}
  foreach ($entry in [regex]::Matches($match.Groups['body'].Value, "([A-Z]{3})\s*:\s*'([^']*)'")) {
    $result[$entry.Groups[1].Value] = $entry.Groups[2].Value
  }

  return $result
}

function Get-CountryCatalog {
  param([string]$Path)

  $source = Get-Content $Path -Raw -Encoding UTF8
  $regionsByIso = Parse-JsMap -Source $source -VariableName 'BID_REGION_BY_ISO'
  $iso2ByIso3 = Parse-JsMap -Source $source -VariableName 'ISO2_BY_ISO3'
  $countries = [System.Collections.Generic.List[object]]::new()

  foreach ($match in [regex]::Matches($source, "\{\s*iso3:\s*'([A-Z]{3})',\s*name:\s*'([^']+)'")) {
    $iso3 = $match.Groups[1].Value
    $name = $match.Groups[2].Value
    $iso2 = $iso2ByIso3[$iso3]

    $countries.Add([pscustomobject]@{
      iso3 = $iso3
      iso2 = $iso2
      name = $name
      bidRegion = if ($regionsByIso.ContainsKey($iso3)) { $regionsByIso[$iso3] } else { $null }
      flag = ConvertTo-FlagEmoji $iso2
      flagUrl = if ($iso2) { "https://flagcdn.com/w40/$($iso2.ToLowerInvariant()).png" } else { '' }
    })
  }

  return $countries.ToArray()
}

function Convert-StatusValue {
  param([string]$Value)

  switch (Normalize-Text $Value) {
    'si' {
      return [pscustomobject]@{
        key = 'yes'
        label = 'SI'
      }
    }
    'no' {
      return [pscustomobject]@{
        key = 'no'
        label = 'NO'
      }
    }
    'en desarrollo' {
      return [pscustomobject]@{
        key = 'in_development'
        label = 'EN DESARROLLO'
      }
    }
    default {
      throw "Estado no soportado: $Value"
    }
  }
}

$countryCatalog = Get-CountryCatalog -Path $countriesSourcePath
$countriesByIso = @{}
foreach ($country in $countryCatalog) {
  $countriesByIso[$country.iso3] = $country
}

$definitionRows = @(Read-XlsxRows -Path $definitionsWorkbookPath)
$recordRows = @(Read-XlsxRows -Path $recordsWorkbookPath)

$dataNames = [System.Collections.Generic.List[string]]::new()
foreach ($row in $recordRows) {
  $name = [string]$row.digitalEnablerName
  if (-not [string]::IsNullOrWhiteSpace($name) -and -not $dataNames.Contains($name.Trim())) {
    [void]$dataNames.Add($name.Trim())
  }
}

$dimensionOrder = [System.Collections.Generic.List[string]]::new()
$metadataByDataName = @{}
$dimensionNameBuffer = @{}
$mappingLog = [System.Collections.Generic.List[object]]::new()

foreach ($definition in $definitionRows) {
  $dimensionName = ([string]$definition.'Dimensión').Trim()
  $definitionName = [string]$definition.Habilitador
  $description = ([string]$definition.'Descripción').Trim()
  $tagList = @(
    ([string]$definition.Tags).Split(',') |
      ForEach-Object { $_.Trim() } |
      Where-Object { $_ }
  )

  if ($dimensionName -and -not $dimensionOrder.Contains($dimensionName)) {
    [void]$dimensionOrder.Add($dimensionName)
  }

  $resolved = Resolve-BestMatch -Value $definitionName -Candidates $dataNames.ToArray()
  if (-not $resolved) {
    throw "No se pudo reconciliar el habilitador '$definitionName' con la hoja de datos."
  }

  $resolvedName = $resolved.Name
  if (-not $metadataByDataName.ContainsKey($resolvedName)) {
    $metadataByDataName[$resolvedName] = [ordered]@{
      name = $resolvedName
      key = New-Slug $resolvedName
      dimension = $dimensionName
      description = $description
      tags = $tagList
      sourceDefinitionName = $definitionName.Trim()
    }
  }

  if (-not $dimensionNameBuffer.ContainsKey($dimensionName)) {
    $dimensionNameBuffer[$dimensionName] = [System.Collections.Generic.List[string]]::new()
  }

  if (-not $dimensionNameBuffer[$dimensionName].Contains($resolvedName)) {
    [void]$dimensionNameBuffer[$dimensionName].Add($resolvedName)
  }

  $mappingLog.Add([pscustomobject]@{
    definitionName = $definitionName.Trim()
    canonicalName = $resolvedName
    strategy = $resolved.Strategy
    score = $resolved.Score
  })
}

$unassignedDimensionName = 'Sin categoría'
foreach ($dataName in $dataNames) {
  if ($metadataByDataName.ContainsKey($dataName)) {
    continue
  }

  if (-not $dimensionOrder.Contains($unassignedDimensionName)) {
    [void]$dimensionOrder.Add($unassignedDimensionName)
  }

  if (-not $dimensionNameBuffer.ContainsKey($unassignedDimensionName)) {
    $dimensionNameBuffer[$unassignedDimensionName] = [System.Collections.Generic.List[string]]::new()
  }

  [void]$dimensionNameBuffer[$unassignedDimensionName].Add($dataName)
  $metadataByDataName[$dataName] = [ordered]@{
    name = $dataName
    key = New-Slug $dataName
    dimension = $unassignedDimensionName
    description = ''
    tags = @()
    sourceDefinitionName = $null
  }
}

$dimensionEntries = [System.Collections.Generic.List[object]]::new()
$enablerEntries = [System.Collections.Generic.List[object]]::new()

for ($dimensionIndex = 0; $dimensionIndex -lt $dimensionOrder.Count; $dimensionIndex += 1) {
  $dimensionTitle = $dimensionOrder[$dimensionIndex]
  $dimensionKey = New-Slug $dimensionTitle
  $orderedNames = if ($dimensionNameBuffer.ContainsKey($dimensionTitle)) { $dimensionNameBuffer[$dimensionTitle].ToArray() } else { @() }

  $dimensionEntries.Add([pscustomobject]@{
    key = $dimensionKey
    title = $dimensionTitle
    order = $dimensionIndex + 1
  })

  foreach ($name in $orderedNames) {
    $metadata = $metadataByDataName[$name]
    $enablerEntries.Add([pscustomobject]@{
      key = $metadata.key
      name = $metadata.name
      dimensionKey = $dimensionKey
      description = $metadata.description
      tags = @($metadata.tags)
    })
  }
}

$statusCounts = @{
  SI = 0
  NO = 0
  'EN DESARROLLO' = 0
}
$records = [System.Collections.Generic.List[object]]::new()

foreach ($record in $recordRows) {
  $iso3 = ([string]$record.codigoPaisIso3).Trim().ToUpperInvariant()
  $canonicalName = ([string]$record.digitalEnablerName).Trim()
  $metadata = $metadataByDataName[$canonicalName]
  if (-not $metadata) {
    throw "No se encontró metadata para el habilitador '$canonicalName'."
  }

  $country = $countriesByIso[$iso3]
  if (-not $country) {
    throw "País no soportado en la hoja de datos: $iso3"
  }

  $status = Convert-StatusValue -Value ([string]$record.digitalEnablerOptionDescription)
  $statusCounts[$status.label] += 1

  $records.Add([pscustomobject]@{
    categoria = $metadata.dimension
    habilitador = $canonicalName
    habilitador_key = $metadata.key
    pais_iso3 = $iso3
    pais = $country.name
    estado = $status.label
    statusKey = $status.key
    url_evidencia = ([string]$record.link).Trim()
  })
}

$output = [ordered]@{
  meta = [ordered]@{
    generatedAt = [DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ')
    sourceFiles = @(
      'digitalenablers/listado de habilitadores.xlsx',
      'digitalenablers/habilitadores completos.xlsx'
    )
    counts = [ordered]@{
      countries = $countryCatalog.Count
      dimensions = $dimensionEntries.Count
      enablers = $enablerEntries.Count
      records = $records.Count
    }
    statusCounts = [ordered]@{
      SI = $statusCounts['SI']
      NO = $statusCounts['NO']
      EN_DESARROLLO = $statusCounts['EN DESARROLLO']
    }
    mappings = $mappingLog.ToArray()
  }
  countries = $countryCatalog
  dimensions = $dimensionEntries
  enablers = $enablerEntries
  records = $records
}

if ($countryCatalog.Count -ne 26) {
  throw "Validación fallida: se esperaban 26 países y se obtuvieron $($countryCatalog.Count)."
}

if ($enablerEntries.Count -ne 44) {
  throw "Validación fallida: se esperaban 44 habilitadores y se obtuvieron $($enablerEntries.Count)."
}

if ($records.Count -ne 1144) {
  throw "Validación fallida: se esperaban 1144 cruces país-habilitador y se obtuvieron $($records.Count)."
}

New-Item -ItemType Directory -Force -Path (Split-Path $generatedOutputPath -Parent) | Out-Null
New-Item -ItemType Directory -Force -Path (Split-Path $publicOutputPath -Parent) | Out-Null

$json = $output | ConvertTo-Json -Depth 8
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
[System.IO.File]::WriteAllText($generatedOutputPath, $json, $utf8NoBom)
[System.IO.File]::WriteAllText($publicOutputPath, $json, $utf8NoBom)

Write-Host "Digital enablers dataset generated:"
Write-Host " - $generatedOutputPath"
Write-Host " - $publicOutputPath"
Write-Host "Countries: $($countryCatalog.Count) | Enablers: $($enablerEntries.Count) | Records: $($records.Count)"
