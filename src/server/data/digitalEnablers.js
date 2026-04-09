const fs = require('fs');

const config = require('../config');

let datasetCache = null;
let datasetCacheRaw = null;

function readDatasetFile() {
  if (!fs.existsSync(config.paths.digitalEnablers)) {
    return null;
  }

  const raw = fs.readFileSync(config.paths.digitalEnablers, 'utf8').replace(/^\uFEFF/, '');
  if (raw === datasetCacheRaw && datasetCache) {
    return datasetCache;
  }

  datasetCacheRaw = raw;
  datasetCache = JSON.parse(raw);
  return datasetCache;
}

function getDigitalEnablersDataset() {
  const dataset = readDatasetFile();
  if (!dataset) {
    return {
      countries: [],
      dimensions: [],
      enablers: [],
      records: [],
    };
  }

  return dataset;
}

function buildCountryDigitalEnablers(iso3) {
  const dataset = getDigitalEnablersDataset();
  const records = Array.isArray(dataset.records) ? dataset.records : [];
  const enablers = Array.isArray(dataset.enablers) ? dataset.enablers : [];
  const dimensions = Array.isArray(dataset.dimensions) ? dataset.dimensions : [];
  const recordsByKey = new Map();

  records.forEach((record) => {
    if (record.pais_iso3 === iso3) {
      recordsByKey.set(record.habilitador_key, record);
    }
  });

  return {
    dimensions: dimensions.map((dimension) => {
      const dimensionEnablers = enablers
        .filter((enabler) => enabler.dimensionKey === dimension.key)
        .map((enabler) => {
          const record = recordsByKey.get(enabler.key);
          if (!record) {
            return null;
          }

          return {
            key: enabler.key,
            name: enabler.name,
            description: enabler.description || '',
            tags: Array.isArray(enabler.tags) ? enabler.tags : [],
            status: record.statusKey || 'no',
            evidenceUrl: record.url_evidencia || null,
          };
        })
        .filter(Boolean);

      return {
        key: dimension.key,
        title: dimension.title,
        count: dimensionEnablers.length,
        enablers: dimensionEnablers,
      };
    }).filter((dimension) => dimension.enablers.length > 0),
  };
}

module.exports = {
  buildCountryDigitalEnablers,
  getDigitalEnablersDataset,
};
