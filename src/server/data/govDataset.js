const rawRows = require('../../../public/data/indices_data.json');
const { REGION_AGGREGATE_ISO, REGION_ISO_CODES } = require('./countries');

const INDEX_CONFIG = {
  EGDI: {
    slug: 'egdi',
    generalAliases: new Set(['general', 'egdi']),
    componentMap: {
      OSI: 'osi',
      TII: 'tii',
      HCI: 'hci',
    },
  },
  GTMI: {
    slug: 'gtmi',
    generalAliases: new Set(['general', 'gtmi']),
    componentMap: {
      CGSI: 'cgsi',
      PSDI: 'psdi',
      CEI: 'dcei',
      DCEI: 'dcei',
      GTEI: 'gtei',
    },
  },
  GCI: {
    slug: 'gci',
    generalAliases: new Set(['general', 'gci']),
    componentMap: {
      Legal: 'legal',
      Technical: 'technical',
      Organizational: 'organizational',
      CapDev: 'capacity',
      Cooperation: 'cooperation',
    },
  },
  'OCDE/BID': {
    slug: 'ocde',
    generalAliases: new Set(['general', 'ocde/bid', 'dgi']),
    componentMap: {
      DpD: 'dd',
      Datos: 'id',
      Plataforma: 'gp',
      Abierto: 'ad',
      Usuario: 'iu',
      Proactivo: 'pr',
    },
  },
  'Government AI Readiness': {
    slug: 'ai',
    generalAliases: new Set(['general', 'government ai readiness', 'madurez ia']),
    componentMap: {
      PolicyCap: 'policyCapacity',
      AIInfra: 'aiInfrastructure',
      Governance: 'governance',
      PubAdopt: 'publicSectorAdoption',
      DevDiff: 'developmentDiffusion',
      Resilience: 'resilience',
    },
  },
  NRI: {
    slug: 'nri',
    generalAliases: new Set(['general', 'nri', 'madurez redes']),
    componentMap: {
      Technology: 'technology',
      People: 'people',
      Governance: 'governance',
      Impact: 'impact',
    },
  },
};

const GOV_INDEX_ORDER = Object.values(INDEX_CONFIG).map((config) => config.slug);
const GOV_INDEX_SOURCES = {
  egdi: 'Naciones Unidas / EGDI',
  gtmi: 'Banco Mundial / GTMI',
  gci: 'UIT / GCI',
  ocde: 'OCDE/BID / DGI',
  ai: 'Oxford Insights / Government AI Readiness Index',
  nri: 'Portulans / Network Readiness Index',
};

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function sortYearStrings(years = []) {
  return [...new Set(years.map(String))].sort((a, b) => Number(b) - Number(a));
}

function buildSequentialRankMap(valuesByIso = {}) {
  const sorted = Object.entries(valuesByIso)
    .filter(([, value]) => Number.isFinite(value))
    .sort((a, b) => b[1] - a[1]);
  return Object.fromEntries(sorted.map(([iso], index) => [iso, index + 1]));
}

function averageEntries(valuesByIso = {}) {
  const values = Object.values(valuesByIso).filter((value) => Number.isFinite(value));
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function isGeneralComponent(config, component, componentShort) {
  return config.generalAliases.has(normalizeText(component))
    || config.generalAliases.has(normalizeText(componentShort));
}

function createEmptyIndexSeries() {
  return Object.fromEntries(GOV_INDEX_ORDER.map((slug) => [slug, {}]));
}

function buildGovSeriesFromDataset() {
  const countrySeries = {};
  const aggregateSeries = createEmptyIndexSeries();

  REGION_ISO_CODES.forEach((iso) => {
    countrySeries[iso] = createEmptyIndexSeries();
  });

  rawRows.forEach((row) => {
    const config = INDEX_CONFIG[row['Índice']];
    if (!config) return;

    const iso = String(row.ISO3 || '').trim().toUpperCase();
    const year = String(row['Edición'] || '').trim();
    if (!iso || !year) return;

    const score = Number(row['Puntuación']);

    const targetBucket = iso === REGION_AGGREGATE_ISO
      ? aggregateSeries
      : countrySeries[iso];

    if (!targetBucket) return;

    const entry = targetBucket[config.slug][year] || {
      score: null,
      rankWorld: null,
      group: null,
      subindices: {},
    };

    if (isGeneralComponent(config, row.Componente, row['Componente corto'])) {
      entry.score = Number.isFinite(score) ? score : null;
      entry.rankWorld = Number.isFinite(Number(row['Ranking Mundial'])) ? Number(row['Ranking Mundial']) : null;
      entry.group = row.Grupo || null;
    } else {
      const componentKey = config.componentMap[row['Componente corto']];
      if (!componentKey) return;
      entry.subindices[componentKey] = Number.isFinite(score) ? score : null;
    }

    targetBucket[config.slug][year] = entry;
  });

  return { countrySeries, aggregateSeries };
}

const { countrySeries: GOV_SERIES_BY_ISO, aggregateSeries: REGION_GOV_SERIES } = buildGovSeriesFromDataset();

function buildGovYearStatsByIndex() {
  const byIndex = {};

  GOV_INDEX_ORDER.forEach((indexKey) => {
    const years = sortYearStrings(
      REGION_ISO_CODES.flatMap((iso) => Object.keys(GOV_SERIES_BY_ISO[iso]?.[indexKey] || {})),
    );

    const yearStats = {};
    years.forEach((year) => {
      const scoresByIso = {};
      const rankWorldByIso = {};
      const groupsByIso = {};
      const subKeySet = new Set();

      REGION_ISO_CODES.forEach((iso) => {
        const entry = GOV_SERIES_BY_ISO[iso]?.[indexKey]?.[year];
        if (!entry) return;
        if (Number.isFinite(entry.score)) {
          scoresByIso[iso] = entry.score;
        }
        if (entry.rankWorld != null) {
          rankWorldByIso[iso] = entry.rankWorld;
        }
        if (entry.group != null) {
          groupsByIso[iso] = entry.group;
        }
        Object.keys(entry.subindices || {}).forEach((subKey) => subKeySet.add(subKey));
      });

      const subindices = {};
      subKeySet.forEach((subKey) => {
        const subScoresByIso = {};
        REGION_ISO_CODES.forEach((iso) => {
          const value = GOV_SERIES_BY_ISO[iso]?.[indexKey]?.[year]?.subindices?.[subKey];
          if (Number.isFinite(value)) {
            subScoresByIso[iso] = value;
          }
        });

        subindices[subKey] = {
          avg: averageEntries(subScoresByIso),
          rankMap: buildSequentialRankMap(subScoresByIso),
          scoresByIso: subScoresByIso,
        };
      });

      yearStats[year] = {
        avg: averageEntries(scoresByIso),
        rankMap: buildSequentialRankMap(scoresByIso),
        scoresByIso,
        rankWorldByIso,
        groupsByIso,
        subindices,
      };
    });

    byIndex[indexKey] = {
      years,
      yearStats,
      source: GOV_INDEX_SOURCES[indexKey] || null,
    };
  });

  return byIndex;
}

const GOV_YEAR_STATS_BY_INDEX = buildGovYearStatsByIndex();

module.exports = {
  GOV_INDEX_ORDER,
  GOV_INDEX_SOURCES,
  GOV_SERIES_BY_ISO,
  REGION_GOV_SERIES,
  GOV_YEAR_STATS_BY_INDEX,
  REGION_ISO_CODES,
  REGION_AGGREGATE_ISO,
  sortYearStrings,
};
