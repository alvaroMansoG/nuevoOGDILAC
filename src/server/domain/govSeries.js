const {
  GOV_INDEX_ORDER,
  GOV_INDEX_SOURCES,
  GOV_SERIES_BY_ISO,
  REGION_GOV_SERIES,
  GOV_YEAR_STATS_BY_INDEX,
  REGION_ISO_CODES,
  sortYearStrings,
} = require('../data/govDataset');

function enrichGovCountryIndexSeries(iso, indexKey, isRegionAggregate = false) {
  const indexStats = GOV_YEAR_STATS_BY_INDEX[indexKey];
  const availableYears = isRegionAggregate
    ? sortYearStrings(Object.keys(REGION_GOV_SERIES[indexKey] || {}))
    : sortYearStrings(Object.keys(GOV_SERIES_BY_ISO[iso]?.[indexKey] || {}));

  const baseSeries = isRegionAggregate
    ? REGION_GOV_SERIES[indexKey] || {}
    : GOV_SERIES_BY_ISO[iso]?.[indexKey] || {};

  const series = {};

  availableYears.forEach((year) => {
    const entry = baseSeries[year];
    const yearStats = indexStats?.yearStats?.[year];
    if (!entry || !yearStats) return;

    const score = Number.isFinite(entry.score) ? entry.score : null;
    const regionEntry = REGION_GOV_SERIES[indexKey]?.[year] || null;
    const alcAvg = Number.isFinite(regionEntry?.score) ? regionEntry.score : yearStats.avg;
    const subindices = {};

    Object.entries(entry.subindices || {}).forEach(([subKey, value]) => {
      const subStats = yearStats.subindices[subKey] || { avg: null, rankMap: {}, scoresByIso: {} };
      subindices[subKey] = {
        score: Number.isFinite(value) ? value : null,
        alcAvg: Number.isFinite(regionEntry?.subindices?.[subKey]) ? regionEntry.subindices[subKey] : subStats.avg,
        rankALC: isRegionAggregate ? null : subStats.rankMap[iso] ?? null,
        allAlc: subStats.scoresByIso,
      };
    });

    series[year] = {
      score,
      rankWorld: isRegionAggregate ? null : entry.rankWorld ?? null,
      rankALC: isRegionAggregate ? null : yearStats.rankMap[iso] ?? null,
      alcAvg,
      diffVsAlc: isRegionAggregate
        ? 0
        : (score != null && alcAvg != null ? +(score - alcAvg).toFixed(indexKey === 'gci' || indexKey === 'ai' || indexKey === 'nri' ? 2 : 4) : null),
      group: entry.group ?? null,
      tier: null,
      tierLabel: null,
      subindices,
      year,
      allAlc: yearStats.scoresByIso,
      source: GOV_INDEX_SOURCES[indexKey] || null,
    };
  });

  return {
    isRegionAggregate,
    latestYear: availableYears[0] ?? null,
    availableYears,
    source: GOV_INDEX_SOURCES[indexKey] || null,
    series,
  };
}

function buildCountryGovData(iso) {
  const govData = {};

  GOV_INDEX_ORDER.forEach((indexKey) => {
    govData[indexKey] = enrichGovCountryIndexSeries(iso, indexKey, false);
  });

  return govData;
}

function buildRegionalGovData() {
  const govData = { isRegionAggregate: true };

  GOV_INDEX_ORDER.forEach((indexKey) => {
    govData[indexKey] = enrichGovCountryIndexSeries(REGION_ISO_CODES[0], indexKey, true);
  });

  return govData;
}

module.exports = {
  GOV_SERIES_BY_ISO,
  GOV_YEAR_STATS_BY_INDEX,
  buildCountryGovData,
  buildRegionalGovData,
  sortYearStrings,
};

