function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildResponseSnippet(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);
}

function isRetryableStatus(status) {
  return [429, 500, 502, 503, 504].includes(Number(status));
}

function isRetryableError(err) {
  if (!err) return false;
  if (typeof err.status === 'number') {
    return isRetryableStatus(err.status);
  }
  return true;
}

async function fetchJsonWithRetry(url, options = {}, config = {}) {
  const {
    attempts = 5,
    baseDelayMs = 300,
    label = 'HTTP request',
  } = config;

  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const res = await fetch(url, options);
      const contentType = String(res.headers.get('content-type') || '').toLowerCase();

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        const err = new Error(
          `${label} failed with HTTP ${res.status}${body ? `: ${buildResponseSnippet(body)}` : ''}`
        );
        err.status = res.status;
        throw err;
      }

      if (!contentType.includes('application/json')) {
        const body = await res.text().catch(() => '');
        const err = new Error(
          `${label} returned non-JSON content-type ${contentType || 'unknown'}${body ? `: ${buildResponseSnippet(body)}` : ''}`
        );
        err.status = res.status;
        throw err;
      }

      return await res.json();
    } catch (err) {
      lastError = err;

      if (attempt >= attempts || !isRetryableError(err)) {
        throw err;
      }

      const delayMs = baseDelayMs * (2 ** (attempt - 1));
      await wait(delayMs);
    }
  }

  throw lastError;
}

module.exports = {
  fetchJsonWithRetry,
};
