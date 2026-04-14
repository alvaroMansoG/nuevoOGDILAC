const { createTimedStore, getTimedCache, setTimedCache } = require('../utils/cache');
const { fetchJsonWithRetry } = require('../utils/http');

const ratesStore = createTimedStore({ persistKey: 'exchange-rates' });
const RATES_KEY = 'rates';
const RATES_TTL = 12 * 60 * 60 * 1000;

async function getExchangeRates() {
  const cached = getTimedCache(ratesStore, RATES_KEY, RATES_TTL);
  if (cached) return cached;
  const staleCached = getTimedCache(ratesStore, RATES_KEY, RATES_TTL, { allowStale: true });

  try {
    const json = await fetchJsonWithRetry('https://open.er-api.com/v6/latest/USD', {}, { label: 'Exchange rates USD' });
    if (json.result === 'success') {
      setTimedCache(ratesStore, RATES_KEY, json.rates);
      return json.rates;
    }
  } catch (err) {
    console.error('Error fetching exchange rates:', err.message);
  }

  return staleCached || {};
}

module.exports = {
  getExchangeRates,
};
