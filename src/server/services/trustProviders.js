const {
  COUNTRIES,
  ISO2_BY_ISO3,
} = require('../data/countries');
const { createMemoryCache } = require('../utils/cache');

const TRUST_SOURCE_URL = 'https://test.ogdilac.org/gobierno-digital/sign';
const TRUST_PORTAL_BASE_URL = 'https://test.ogdilac.org';
const TRUST_API_BASE_URL = 'https://test-back.ogdilac.org/kancha-lotl/lotl';
const COUNTRY_CACHE = createMemoryCache(60 * 60 * 1000);
const REGION_CACHE = createMemoryCache(60 * 60 * 1000);

function normalizeText(value) {
  if (typeof value !== 'string') return null;
  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized || null;
}

function getLotlCodeFromIso3(iso3) {
  const iso2 = ISO2_BY_ISO3[iso3];
  return iso2 ? iso2.toLowerCase() : null;
}

function buildListUrl(lotlCode) {
  return lotlCode
    ? `${TRUST_PORTAL_BASE_URL}/gobierno-digital/sign/provider/${lotlCode}`
    : TRUST_SOURCE_URL;
}

function buildDetailUrl(lotlCode, providerIndex) {
  if (!lotlCode || providerIndex == null) return null;
  return `${TRUST_PORTAL_BASE_URL}/gobierno-digital/providerDetail/${lotlCode}/${providerIndex}`;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

function buildEmptyCountryTrustProviders(country, lotlCode) {
  return {
    countryIso3: country?.iso3 || null,
    countryName: country?.name || null,
    countryFlag: country?.flag || '',
    lotlCode,
    count: 0,
    providers: [],
    sourceUrl: TRUST_SOURCE_URL,
    listUrl: buildListUrl(lotlCode),
  };
}

function normalizeCountryProvider(provider, country, lotlCode) {
  const services = Array.isArray(provider?.tipoServicios)
    ? provider.tipoServicios
      .map((service) => ({
        name: normalizeText(service?.nombre),
      }))
      .filter((service) => service.name)
    : [];

  return {
    name: normalizeText(provider?.nombre),
    providerIndex: provider?.index ?? null,
    services,
    countryIso3: country.iso3,
    countryName: country.name,
    countryFlag: country.flag,
    lotlCode,
    detailUrl: buildDetailUrl(lotlCode, provider?.index ?? null),
  };
}

async function fetchCountryTrustProviders(iso3) {
  const cacheKey = String(iso3 || '').toUpperCase();
  const cached = COUNTRY_CACHE.get(cacheKey);
  if (cached) return cached;

  const country = COUNTRIES.find((entry) => entry.iso3 === cacheKey);
  const lotlCode = getLotlCodeFromIso3(cacheKey);
  const empty = buildEmptyCountryTrustProviders(country, lotlCode);

  if (!country || !lotlCode) {
    COUNTRY_CACHE.set(cacheKey, empty);
    return empty;
  }

  try {
    const rawProviders = await fetchJson(`${TRUST_API_BASE_URL}/activos/${lotlCode}`);
    const providers = Array.isArray(rawProviders)
      ? rawProviders
        .map((provider) => normalizeCountryProvider(provider, country, lotlCode))
        .filter((provider) => provider.name)
      : [];

    const result = {
      ...empty,
      count: providers.length,
      providers,
    };

    COUNTRY_CACHE.set(cacheKey, result);
    return result;
  } catch (_error) {
    COUNTRY_CACHE.set(cacheKey, empty);
    return empty;
  }
}

async function fetchRegionalTrustProviders() {
  const cached = REGION_CACHE.get('ALC');
  if (cached) return cached;

  const results = await Promise.all(COUNTRIES.map((country) => fetchCountryTrustProviders(country.iso3)));
  const providers = results
    .flatMap((result) => result.providers)
    .sort((left, right) => {
      const countrySort = (left.countryName || '').localeCompare(right.countryName || '', 'es');
      if (countrySort !== 0) return countrySort;
      return (left.name || '').localeCompare(right.name || '', 'es');
    });

  const aggregate = {
    count: providers.length,
    countriesWithProviders: results.filter((result) => result.count > 0).length,
    providers,
    sourceUrl: TRUST_SOURCE_URL,
    listUrl: TRUST_SOURCE_URL,
  };

  REGION_CACHE.set('ALC', aggregate);
  return aggregate;
}

module.exports = {
  TRUST_SOURCE_URL,
  fetchCountryTrustProviders,
  fetchRegionalTrustProviders,
  getLotlCodeFromIso3,
};
