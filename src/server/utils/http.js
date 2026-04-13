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
    timeoutMs = 15000,
  } = config;

  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
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
      if (err?.name === 'AbortError') {
        lastError = new Error(`${label} timed out after ${timeoutMs}ms`);
      }

      if (attempt >= attempts || !isRetryableError(err)) {
        throw lastError;
      }

      const delayMs = baseDelayMs * (2 ** (attempt - 1));
      await wait(delayMs);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError;
}

module.exports = {
  fetchJsonWithRetry,
};
