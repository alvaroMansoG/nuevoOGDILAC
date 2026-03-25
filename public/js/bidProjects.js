const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT = { key: 'apprvl_dt', direction: 'desc' };
const QUICK_RANGE_DAYS = {
  last7: 7,
  last30: 30,
  last365: 365,
};
const REGION_FLAG_ICON = '\uD83C\uDF0E';

const STATUS_CLASS_BY_NAME = {
  preparacion: 'status-preparacion',
  implementacion: 'status-implementacion',
  cancelado: 'status-cancelado',
  cerrado: 'status-cerrado',
};
const ISO2_BY_COUNTRY_NAME = {
  'Argentina': 'AR',
  'Bahamas': 'BS',
  'Barbados': 'BB',
  'Belice': 'BZ',
  'Bolivia': 'BO',
  'Brasil': 'BR',
  'Chile': 'CL',
  'Colombia': 'CO',
  'Costa Rica': 'CR',
  'Ecuador': 'EC',
  'El Salvador': 'SV',
  'Guatemala': 'GT',
  'Guyana': 'GY',
  'Haití': 'HT',
  'Honduras': 'HN',
  'Jamaica': 'JM',
  'México': 'MX',
  'Nicaragua': 'NI',
  'Panamá': 'PA',
  'Perú': 'PE',
  'Regional': 'RG',
  'República Dominicana': 'DO',
  'Surinam': 'SR',
  'Trinidad y Tobago': 'TT',
  'Uruguay': 'UY',
  'Venezuela': 'VE',
};

function fixText(value) {
  if (typeof value !== 'string') return value;

  return value
    .replace(/\u00C3\u00A1/g, '\u00E1')
    .replace(/\u00C3\u00A9/g, '\u00E9')
    .replace(/\u00C3\u00AD/g, '\u00ED')
    .replace(/\u00C3\u00B3/g, '\u00F3')
    .replace(/\u00C3\u00BA/g, '\u00FA')
    .replace(/\u00C3\u00B1/g, '\u00F1')
    .replace(/\u00C3\u0081/g, '\u00C1')
    .replace(/\u00C3\u0089/g, '\u00C9')
    .replace(/\u00C3\u008D/g, '\u00CD')
    .replace(/\u00C3\u0093/g, '\u00D3')
    .replace(/\u00C3\u009A/g, '\u00DA')
    .replace(/\u00C3\u0091/g, '\u00D1')
    .replace(/\u00C2\u00B7/g, '\u00B7')
    .replace(/\u00E2\u20AC\u201D/g, '\u2014')
    .replace(/\u00E2\u20AC\u00A6/g, '\u2026');
}

function escapeHtmlAttr(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtml(value) {
  return escapeHtmlAttr(value).replace(/'/g, '&#39;');
}

function formatLocaleNumber(value, decimals = 0) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '0';
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number(value));
}

function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return 'No disponible';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatDate(value) {
  if (!value) return 'No disponible';
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return 'No disponible';
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function normalizeText(value) {
  return fixText(String(value ?? '')).trim();
}

function normalizeForSearch(value) {
  return normalizeText(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function getCountryIso2(countryName, fallbackCode = '') {
  const normalizedName = normalizeText(countryName);
  const normalizedFallback = normalizeText(fallbackCode).toUpperCase();
  const overrides = {
    'Argentina': 'AR',
    'Bahamas': 'BS',
    'Barbados': 'BB',
    'Belice': 'BZ',
    'Bolivia': 'BO',
    'Brasil': 'BR',
    'Chile': 'CL',
    'Colombia': 'CO',
    'Costa Rica': 'CR',
    'Ecuador': 'EC',
    'El Salvador': 'SV',
    'Guatemala': 'GT',
    'Guyana': 'GY',
    'Haití': 'HT',
    'Honduras': 'HN',
    'Jamaica': 'JM',
    'México': 'MX',
    'Nicaragua': 'NI',
    'Panamá': 'PA',
    'Paraguay': 'PY',
    'Perú': 'PE',
    'Regional': 'RG',
    'República Dominicana': 'DO',
    'Suriname': 'SR',
    'Trinidad y Tobago': 'TT',
    'Uruguay': 'UY',
    'Venezuela': 'VE',
  };
  return overrides[normalizedName] || normalizedFallback;
}

function getFlagEmojiFromIso2(iso2) {
  const normalized = normalizeText(iso2).toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized)) return '';
  return normalized
    .split('')
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('');
}

function getFlagUrlFromIso2(iso2) {
  const normalized = normalizeText(iso2).toLowerCase();
  if (!/^[a-z]{2}$/.test(normalized)) return '';
  return `https://flagcdn.com/w40/${normalized}.png`;
}

function isActiveProject(row) {
  return normalizeText(row?.sts_cd).toUpperCase() === 'ACTIVE'
    || normalizeForSearch(row?.publc_sts_nm) === 'activo';
}

function sortRows(rows, sort) {
  const direction = sort.direction === 'asc' ? 1 : -1;
  const collator = new Intl.Collator('es', { sensitivity: 'base', numeric: true });

  return rows.slice().sort((left, right) => {
    let result = 0;

    switch (sort.key) {
      case 'totl_cost_orig': {
        const a = Number(left.totl_cost_orig) || 0;
        const b = Number(right.totl_cost_orig) || 0;
        result = a - b;
        break;
      }
      case 'apprvl_dt': {
        const a = left.apprvl_dt || '';
        const b = right.apprvl_dt || '';
        result = a.localeCompare(b);
        break;
      }
      default: {
        result = collator.compare(
          normalizeText(left[sort.key]),
          normalizeText(right[sort.key])
        );
      }
    }

    if (result !== 0) return result * direction;
    return collator.compare(normalizeText(left.oper_num), normalizeText(right.oper_num));
  });
}

function buildInitialFilters() {
  return {
    projectNumbers: [],
    projectNumberQuery: '',
    projectName: '',
    countries: null,
    subsector: '',
    status: '',
    quickRange: '',
    dateFrom: '',
    dateTo: '',
    activeOnly: false,
  };
}

export function createBidProjectsController({ section, filtersEl, summaryEl, tableShellEl, linksEl, navLink }) {
  const subtitleEl = section?.querySelector('.section-subtitle') || null;
  const state = {
    status: 'idle',
    country: null,
    rows: [],
    links: {
      sourceUrl: '',
      searchUrl: '',
    },
    filters: buildInitialFilters(),
    sort: { ...DEFAULT_SORT },
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    errorMessage: '',
  };

  function resetInteractiveState({ resetPageSize = false } = {}) {
    state.filters = buildInitialFilters();
    state.sort = { ...DEFAULT_SORT };
    state.page = 1;
    if (resetPageSize) {
      state.pageSize = DEFAULT_PAGE_SIZE;
    }
  }

  function setSectionVisible(visible = true) {
    if (section) section.style.display = visible ? 'block' : 'none';
    if (navLink) navLink.classList.toggle('hidden', !visible);
  }

  function setLoading(country) {
    state.status = 'loading';
    state.country = country || null;
    state.rows = [];
    state.links = { sourceUrl: '', searchUrl: '' };
    state.errorMessage = '';
    resetInteractiveState({ resetPageSize: true });
    setSectionVisible(true);
    render();
  }

  function setError(message, country) {
    state.status = 'error';
    state.country = country || null;
    state.rows = [];
    state.errorMessage = message || 'No se pudieron cargar los proyectos BID.';
    state.pageSize = DEFAULT_PAGE_SIZE;
    setSectionVisible(true);
    render();
  }

  function setData(payload, country) {
    state.status = 'ready';
    state.country = country || null;
    state.rows = Array.isArray(payload?.rows) ? payload.rows : [];
    state.links = {
      sourceUrl: payload?.sourceUrl || '',
      searchUrl: payload?.searchUrl || '',
    };
    state.errorMessage = '';
    resetInteractiveState({ resetPageSize: true });
    setSectionVisible(true);
    render();
  }

  function getProjectMatches() {
    const rows = state.rows;
    const selected = new Set(state.filters.projectNumbers);

    return rows
      .filter((row) => !selected.has(row.oper_num))
      .sort((left, right) => left.oper_num.localeCompare(right.oper_num, 'es', { sensitivity: 'base' }));
  }

  function getCountryOptions() {
    const countryMap = new Map();
    state.rows.forEach((row) => {
      const countryName = normalizeText(row.cntry_nm);
      const countryCode = normalizeText(row.cntry_cd).toUpperCase();
      if (!countryName || countryCode === 'RG' || countryName === 'Regional') return;
      const iso2 = getCountryIso2(countryName, countryCode);
      countryMap.set(countryName, {
        value: countryName,
        label: countryName,
        code: iso2,
        flag: getFlagEmojiFromIso2(iso2),
        flagUrl: getFlagUrlFromIso2(iso2),
      });
    });

    return [
      { value: '__REGIONAL__', label: 'Regional', code: 'ALC', flag: REGION_FLAG_ICON, flagUrl: '' },
      ...Array.from(countryMap.values())
        .sort((left, right) => left.label.localeCompare(right.label, 'es', { sensitivity: 'base' })),
    ];
  }

  function getCountryOptionByValue(value) {
    return getCountryOptions().find((option) => option.value === value) || null;
  }

  function isCountryFilterAllActive() {
    return state.filters.countries === null;
  }

  function isCountryActive(value) {
    if (isCountryFilterAllActive()) return true;
    return Array.isArray(state.filters.countries) && state.filters.countries.includes(value);
  }

  function getDateRange() {
    let dateFrom = state.filters.dateFrom;
    let dateTo = state.filters.dateTo;

    if (state.filters.quickRange && QUICK_RANGE_DAYS[state.filters.quickRange]) {
      const today = new Date();
      const from = new Date(today);
      from.setDate(today.getDate() - QUICK_RANGE_DAYS[state.filters.quickRange]);
      dateFrom = from.toISOString().slice(0, 10);
      dateTo = today.toISOString().slice(0, 10);
    }

    return { dateFrom, dateTo };
  }

  function applyFilters(rows, options = {}) {
    const {
      ignoreCountry = false,
      ignoreSubsector = false,
      ignoreStatus = false,
    } = options;

    const selectedProjects = state.filters.projectNumbers;
    if (selectedProjects.length) {
      const selectedSet = new Set(selectedProjects);
      return rows.filter((row) => selectedSet.has(row.oper_num));
    }

    const projectNameQuery = normalizeForSearch(state.filters.projectName);
    const selectedCountries = ignoreCountry ? null : state.filters.countries;
    const subsectorValue = ignoreSubsector ? '' : state.filters.subsector;
    const statusValue = ignoreStatus ? '' : state.filters.status;
    const { dateFrom, dateTo } = getDateRange();

    return rows.filter((row) => {
      if (projectNameQuery && !normalizeForSearch(row.oper_nm).includes(projectNameQuery)) {
        return false;
      }
      if (Array.isArray(selectedCountries)) {
        if (!selectedCountries.length) {
          return false;
        }
        const includeRegional = selectedCountries.includes('__REGIONAL__') && normalizeText(row.cntry_cd).toUpperCase() === 'RG';
        const includeCountry = selectedCountries.includes(row.cntry_nm);
        if (!includeRegional && !includeCountry) {
          return false;
        }
      }
      if (subsectorValue && row.subsector_nm !== subsectorValue) {
        return false;
      }
      if (statusValue && row.publc_sts_nm !== statusValue) {
        return false;
      }
      if (state.filters.activeOnly && normalizeText(row.sts_cd).toUpperCase() !== 'ACTIVE') {
        return false;
      }
      if (dateFrom && row.apprvl_dt && row.apprvl_dt < dateFrom) {
        return false;
      }
      if (dateFrom && !row.apprvl_dt) {
        return false;
      }
      if (dateTo && row.apprvl_dt && row.apprvl_dt > dateTo) {
        return false;
      }
      if (dateTo && !row.apprvl_dt) {
        return false;
      }
      return true;
    });
  }

  function getFacetCounts(rows, key) {
    const counts = new Map();
    rows.forEach((row) => {
      const value = normalizeText(row[key]);
      if (!value) return;
      counts.set(value, (counts.get(value) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => a[0].localeCompare(b[0], 'es', { sensitivity: 'base' }))
      .map(([value, count]) => ({ value, count }));
  }

  function getDerivedState() {
    const filteredRows = applyFilters(state.rows);
    const sortedRows = sortRows(filteredRows, state.sort);
    const totalPages = Math.max(1, Math.ceil(sortedRows.length / state.pageSize));
    const page = Math.min(state.page, totalPages);
    const start = (page - 1) * state.pageSize;
    const paginatedRows = sortedRows.slice(start, start + state.pageSize);
    const facetCountryRows = applyFilters(state.rows, { ignoreCountry: true });
    const facetSubsectorRows = applyFilters(state.rows, { ignoreSubsector: true });
    const facetStatusRows = applyFilters(state.rows, { ignoreStatus: true });

    return {
      filteredRows,
      sortedRows,
      paginatedRows,
      totalPages,
      page,
      pageSize: state.pageSize,
      countryOptions: getFacetCounts(facetCountryRows, 'cntry_nm'),
      subsectorOptions: getFacetCounts(facetSubsectorRows, 'subsector_nm'),
      statusOptions: getFacetCounts(facetStatusRows, 'publc_sts_nm'),
    };
  }

  function getSummaryMarkup(filteredRows) {
    const totalProjects = filteredRows.length;
    const activeProjects = filteredRows.filter((row) => isActiveProject(row)).length;
    const totalCost = filteredRows.reduce((sum, row) => sum + (Number(row.totl_cost_orig) || 0), 0);

    return `
      <article class="bid-projects-kpi">
        <span class="bid-projects-kpi-label">Proyectos totales</span>
        <strong class="bid-projects-kpi-value">${escapeHtml(formatLocaleNumber(totalProjects, 0))}</strong>
      </article>
      <article class="bid-projects-kpi">
        <span class="bid-projects-kpi-label">Proyectos en curso</span>
        <strong class="bid-projects-kpi-value">${escapeHtml(formatLocaleNumber(activeProjects, 0))}</strong>
      </article>
      <article class="bid-projects-kpi">
        <span class="bid-projects-kpi-label">Coste total</span>
        <strong class="bid-projects-kpi-value">${escapeHtml(formatCurrency(totalCost))}</strong>
      </article>
    `;
  }

  function getStatusClass(status) {
    return STATUS_CLASS_BY_NAME[normalizeForSearch(status)] || 'status-generico';
  }

  function getSortArrow(key) {
    if (state.sort.key !== key) return '';
    return state.sort.direction === 'asc' ? ' ▲' : ' ▼';
  }

  function getFiltersMarkup(derived) {
    const isRegionAggregate = Boolean(state.country?.isRegionAggregate);
    const lockOtherFilters = state.filters.projectNumbers.length > 0;
    const projectMatches = getProjectMatches();
    const selectedProjectsMarkup = state.filters.projectNumbers.length
      ? state.filters.projectNumbers.map((projectNumber) => `
          <button type="button" class="bid-project-chip" data-remove-project="${escapeHtmlAttr(projectNumber)}">
            <span>${escapeHtml(projectNumber)}</span>
            <span aria-hidden="true">&times;</span>
          </button>
        `).join('')
      : '<span class="bid-project-chip-placeholder">Sin proyectos seleccionados</span>';
    const countryTagsMarkup = getCountryOptions().map((option) => `
      <button
        type="button"
        class="bid-country-option ${isCountryActive(option.value) ? 'is-active' : ''}"
        data-country-toggle="${escapeHtmlAttr(option.value)}"
        ${lockOtherFilters ? 'disabled' : ''}
      >
        ${option.flagUrl
          ? `<img class="bid-country-option-flag-img" src="${escapeHtmlAttr(option.flagUrl)}" alt="" loading="lazy" aria-hidden="true" />`
          : `<span class="bid-country-option-flag" aria-hidden="true">${escapeHtml(option.flag)}</span>`
        }
        <span class="bid-country-option-label">${escapeHtml(option.label)}</span>
      </button>
    `).join('');

    return `
      <div class="bid-projects-filter-layout">
        ${isRegionAggregate ? `
          <div class="bid-projects-filter-row bid-projects-filter-row-countries">
            <div class="bid-filter-group bid-filter-group-country">
              <div class="bid-filter-label-row">
                <label class="bid-filter-label">Pa&iacute;ses</label>
                <button type="button" class="bid-filter-button bid-filter-button-secondary bid-filter-button-small" id="bid-country-select-all" ${lockOtherFilters ? 'disabled' : ''}>Todos</button>
                <button type="button" class="bid-filter-button bid-filter-button-secondary bid-filter-button-small" id="bid-country-select-none" ${lockOtherFilters ? 'disabled' : ''}>Ninguno</button>
              </div>
              <div class="bid-country-selector-options" role="group" aria-label="Selecci&oacute;n de pa&iacute;ses">
                ${countryTagsMarkup}
              </div>
            </div>
          </div>
        ` : ''}

        <div class="bid-projects-filter-row bid-projects-filter-row-primary">
          <div class="bid-filter-group">
            <label class="bid-filter-label" for="bid-project-name">Nombre del proyecto</label>
            <input
              id="bid-project-name"
              class="bid-filter-input"
              type="text"
              value="${escapeHtmlAttr(state.filters.projectName)}"
              placeholder="Buscar por texto libre"
              ${lockOtherFilters ? 'disabled' : ''}
            />
          </div>
        </div>

        <div class="bid-projects-filter-row bid-projects-filter-row-number">
          <div class="bid-filter-group bid-filter-group-number">
            <label class="bid-filter-label" for="bid-project-number-input">N&uacute;mero de proyecto</label>
            <div class="bid-project-number-entry">
              <input
                id="bid-project-number-input"
                class="bid-filter-input"
                type="text"
                list="bid-project-number-options"
                value="${escapeHtmlAttr(state.filters.projectNumberQuery)}"
                placeholder="Escribe un c&oacute;digo de operaci&oacute;n"
              />
              <datalist id="bid-project-number-options">
                ${projectMatches.map((row) => `
                  <option value="${escapeHtmlAttr(row.oper_num)}">${escapeHtml(fixText(row.oper_nm))}</option>
                `).join('')}
              </datalist>
              <button type="button" class="bid-filter-button" id="bid-project-number-add">A&ntilde;adir</button>
            </div>
            <div class="bid-project-number-box">
              <div class="bid-project-chip-list">${selectedProjectsMarkup}</div>
              <p class="bid-filter-help">Si seleccionas uno o varios proyectos, el resto de filtros se desactiva.</p>
            </div>
          </div>
        </div>

        <div class="bid-projects-filter-row bid-projects-filter-row-secondary">
          <div class="bid-filter-group">
            <label class="bid-filter-label" for="bid-project-subsector">Subsector</label>
            <select id="bid-project-subsector" class="bid-filter-select" ${lockOtherFilters ? 'disabled' : ''}>
              <option value="">Todos</option>
              ${derived.subsectorOptions.map((option) => `
                <option value="${escapeHtmlAttr(option.value)}" ${option.value === state.filters.subsector ? 'selected' : ''}>
                  ${escapeHtml(option.value)} (${escapeHtml(formatLocaleNumber(option.count, 0))})
                </option>
              `).join('')}
            </select>
          </div>

          <div class="bid-filter-group">
            <label class="bid-filter-label" for="bid-project-status">Estado</label>
            <select id="bid-project-status" class="bid-filter-select" ${lockOtherFilters ? 'disabled' : ''}>
              <option value="">Todos</option>
              ${derived.statusOptions.map((option) => `
                <option value="${escapeHtmlAttr(option.value)}" ${option.value === state.filters.status ? 'selected' : ''}>
                  ${escapeHtml(option.value)} (${escapeHtml(formatLocaleNumber(option.count, 0))})
                </option>
              `).join('')}
            </select>
          </div>

          <div class="bid-filter-group bid-filter-group-toggle">
            <span class="bid-filter-label">Actividad</span>
            <label class="bid-projects-toggle bid-projects-toggle-inline">
              <input id="bid-project-active-only" type="checkbox" ${state.filters.activeOnly ? 'checked' : ''} ${lockOtherFilters ? 'disabled' : ''} />
              <span>Solo proyectos activos</span>
            </label>
          </div>
        </div>

        <div class="bid-projects-filter-row bid-projects-filter-row-dates">
          <div class="bid-filter-group">
            <label class="bid-filter-label">Fecha de aprobaci&oacute;n</label>
            <select id="bid-project-quick-range" class="bid-filter-select" ${lockOtherFilters ? 'disabled' : ''}>
              <option value="">Cualquiera</option>
              <option value="last7" ${state.filters.quickRange === 'last7' ? 'selected' : ''}>&Uacute;ltimos 7 d&iacute;as</option>
              <option value="last30" ${state.filters.quickRange === 'last30' ? 'selected' : ''}>&Uacute;ltimos 30 d&iacute;as</option>
              <option value="last365" ${state.filters.quickRange === 'last365' ? 'selected' : ''}>&Uacute;ltimo a&ntilde;o</option>
            </select>
          </div>
          <div class="bid-filter-group">
            <label class="bid-filter-inline-label" for="bid-project-date-from">Desde</label>
            <input id="bid-project-date-from" class="bid-filter-input" type="date" value="${escapeHtmlAttr(state.filters.dateFrom)}" ${lockOtherFilters ? 'disabled' : ''} />
          </div>
          <div class="bid-filter-group">
            <label class="bid-filter-inline-label" for="bid-project-date-to">Hasta</label>
            <input id="bid-project-date-to" class="bid-filter-input" type="date" value="${escapeHtmlAttr(state.filters.dateTo)}" ${lockOtherFilters ? 'disabled' : ''} />
          </div>
        </div>
      </div>

      <div class="bid-projects-filter-actions">
        <button type="button" class="bid-filter-button bid-filter-button-secondary" id="bid-project-clear">Limpiar filtros</button>
      </div>
    `;
  }

  function getTableMarkup(derived) {
    const isRegionAggregate = Boolean(state.country?.isRegionAggregate);

    if (!derived.filteredRows.length) {
      return `
        <div class="bid-projects-empty-state">
          <p>No hay resultados para los filtros seleccionados.</p>
        </div>
      `;
    }

    const rowsMarkup = derived.paginatedRows.map((row) => `
      <tr>
        <td>${escapeHtml(row.oper_num)}</td>
        ${isRegionAggregate ? `<td>${escapeHtml(fixText(row.cntry_nm || 'No disponible'))}</td>` : ''}
        <td>
          <a href="${escapeHtmlAttr(row.project_url)}" target="_blank" rel="noopener noreferrer">
            ${escapeHtml(fixText(row.oper_nm || 'Proyecto sin nombre'))}
          </a>
        </td>
        <td>${escapeHtml(fixText(row.subsector_nm || 'No disponible'))}</td>
        <td>${escapeHtml(formatCurrency(row.totl_cost_orig))}</td>
        <td>${escapeHtml(formatDate(row.apprvl_dt))}</td>
        <td>
          <span class="bid-project-status-badge ${getStatusClass(row.publc_sts_nm)}">${escapeHtml(fixText(row.publc_sts_nm || 'No disponible'))}</span>
        </td>
      </tr>
    `).join('');

    return `
      <div class="bid-projects-table-meta">
        <span>${escapeHtml(formatLocaleNumber(derived.filteredRows.length, 0))} resultados</span>
        <label class="bid-projects-page-size">
          <span>Mostrar</span>
          <select id="bid-project-page-size" class="bid-filter-select">
            ${[10, 25, 50, 100].map((size) => `
              <option value="${size}" ${size === derived.pageSize ? 'selected' : ''}>${size}</option>
            `).join('')}
          </select>
          <span>por p&aacute;gina</span>
        </label>
        <span>P&aacute;gina ${escapeHtml(formatLocaleNumber(derived.page, 0))} de ${escapeHtml(formatLocaleNumber(derived.totalPages, 0))}</span>
      </div>
      <div class="bid-projects-table-wrap">
        <table class="bid-projects-table">
          <thead>
            <tr>
              <th><button type="button" class="bid-sort-button" data-sort-key="oper_num">N&uacute;mero de proyecto${escapeHtml(getSortArrow('oper_num'))}</button></th>
              ${isRegionAggregate ? `<th><button type="button" class="bid-sort-button" data-sort-key="cntry_nm">Pa&iacute;s${escapeHtml(getSortArrow('cntry_nm'))}</button></th>` : ''}
              <th><button type="button" class="bid-sort-button" data-sort-key="oper_nm">Nombre del proyecto${escapeHtml(getSortArrow('oper_nm'))}</button></th>
              <th><button type="button" class="bid-sort-button" data-sort-key="subsector_nm">Subsector${escapeHtml(getSortArrow('subsector_nm'))}</button></th>
              <th><button type="button" class="bid-sort-button" data-sort-key="totl_cost_orig">Coste total${escapeHtml(getSortArrow('totl_cost_orig'))}</button></th>
              <th><button type="button" class="bid-sort-button" data-sort-key="apprvl_dt">Fecha de aprobaci&oacute;n${escapeHtml(getSortArrow('apprvl_dt'))}</button></th>
              <th><button type="button" class="bid-sort-button" data-sort-key="publc_sts_nm">Estado${escapeHtml(getSortArrow('publc_sts_nm'))}</button></th>
            </tr>
          </thead>
          <tbody>${rowsMarkup}</tbody>
        </table>
      </div>
      <div class="bid-projects-pagination">
        <button type="button" class="bid-filter-button bid-filter-button-secondary" id="bid-project-prev" ${derived.page <= 1 ? 'disabled' : ''}>Anterior</button>
        <span class="bid-projects-pagination-label">P&aacute;gina ${escapeHtml(formatLocaleNumber(derived.page, 0))} de ${escapeHtml(formatLocaleNumber(derived.totalPages, 0))}</span>
        <button type="button" class="bid-filter-button bid-filter-button-secondary" id="bid-project-next" ${derived.page >= derived.totalPages ? 'disabled' : ''}>Siguiente</button>
      </div>
    `;
  }

  function renderLinks() {
    if (!linksEl) return;
    const links = [];
    if (state.links.sourceUrl) {
      links.push(`<span>Fuente:</span> <a href="${escapeHtmlAttr(state.links.sourceUrl)}" target="_blank" rel="noopener noreferrer">API Open Data BID</a>`);
    }
    if (state.links.searchUrl) {
      links.push(`<a href="${escapeHtmlAttr(state.links.searchUrl)}" target="_blank" rel="noopener noreferrer">Buscador oficial del BID</a>`);
    }
    linksEl.innerHTML = links.join('<span>&middot;</span>');
  }

  function bindEvents(derived) {
    const projectNumberInput = filtersEl?.querySelector('#bid-project-number-input');
    const addProjectButton = filtersEl?.querySelector('#bid-project-number-add');
    const projectNameInput = filtersEl?.querySelector('#bid-project-name');
    const countryToggleButtons = filtersEl?.querySelectorAll('[data-country-toggle]') || [];
    const countrySelectAllButton = filtersEl?.querySelector('#bid-country-select-all');
    const countrySelectNoneButton = filtersEl?.querySelector('#bid-country-select-none');
    const subsectorSelect = filtersEl?.querySelector('#bid-project-subsector');
    const statusSelect = filtersEl?.querySelector('#bid-project-status');
    const quickRangeSelect = filtersEl?.querySelector('#bid-project-quick-range');
    const dateFromInput = filtersEl?.querySelector('#bid-project-date-from');
    const dateToInput = filtersEl?.querySelector('#bid-project-date-to');
    const activeOnlyInput = filtersEl?.querySelector('#bid-project-active-only');
    const clearButton = filtersEl?.querySelector('#bid-project-clear');
    const pageSizeSelect = tableShellEl?.querySelector('#bid-project-page-size');

    function addProjectFromInput() {
      const value = normalizeText(projectNumberInput?.value);
      if (!value) return;
      const match = state.rows.find((row) => normalizeText(row.oper_num) === value);
      if (!match) return;
      if (!state.filters.projectNumbers.includes(match.oper_num)) {
        state.filters.projectNumbers = [...state.filters.projectNumbers, match.oper_num];
      }
      state.filters.projectNumberQuery = '';
      state.page = 1;
      render();
    }

    function toggleCountryValue(value) {
      const match = getCountryOptionByValue(value);
      if (!match) return;

      if (isCountryFilterAllActive()) {
        state.filters.countries = getCountryOptions()
          .map((option) => option.value)
          .filter((optionValue) => optionValue !== match.value);
      } else if (state.filters.countries.includes(match.value)) {
        state.filters.countries = state.filters.countries.filter((entry) => entry !== match.value);
      } else {
        state.filters.countries = [...state.filters.countries, match.value];
      }

      state.page = 1;
      render();
    }

    if (projectNumberInput) {
      projectNumberInput.addEventListener('input', (event) => {
        state.filters.projectNumberQuery = event.target.value;
      });
      projectNumberInput.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        addProjectFromInput();
      });
    }

    addProjectButton?.addEventListener('click', addProjectFromInput);

    filtersEl?.querySelectorAll('[data-remove-project]').forEach((button) => {
      button.addEventListener('click', () => {
        const value = button.getAttribute('data-remove-project');
        state.filters.projectNumbers = state.filters.projectNumbers.filter((projectNumber) => projectNumber !== value);
        state.page = 1;
        render();
      });
    });

    projectNameInput?.addEventListener('input', (event) => {
      state.filters.projectName = event.target.value;
      state.page = 1;
      render();
    });

    countryToggleButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const value = button.getAttribute('data-country-toggle');
        if (!value) return;
        toggleCountryValue(value);
      });
    });

    countrySelectAllButton?.addEventListener('click', () => {
      state.filters.countries = null;
      state.page = 1;
      render();
    });

    countrySelectNoneButton?.addEventListener('click', () => {
      state.filters.countries = [];
      state.page = 1;
      render();
    });

    subsectorSelect?.addEventListener('change', (event) => {
      state.filters.subsector = event.target.value;
      state.page = 1;
      render();
    });

    statusSelect?.addEventListener('change', (event) => {
      state.filters.status = event.target.value;
      state.page = 1;
      render();
    });

    quickRangeSelect?.addEventListener('change', (event) => {
      state.filters.quickRange = event.target.value;
      state.page = 1;
      render();
    });

    dateFromInput?.addEventListener('change', (event) => {
      state.filters.dateFrom = event.target.value;
      state.filters.quickRange = '';
      state.page = 1;
      render();
    });

    dateToInput?.addEventListener('change', (event) => {
      state.filters.dateTo = event.target.value;
      state.filters.quickRange = '';
      state.page = 1;
      render();
    });

    activeOnlyInput?.addEventListener('change', (event) => {
      state.filters.activeOnly = Boolean(event.target.checked);
      state.page = 1;
      render();
    });

    clearButton?.addEventListener('click', () => {
      resetInteractiveState();
      render();
    });

    pageSizeSelect?.addEventListener('change', (event) => {
      state.pageSize = Number(event.target.value) || DEFAULT_PAGE_SIZE;
      state.page = 1;
      render();
    });

    tableShellEl?.querySelectorAll('[data-sort-key]').forEach((button) => {
      button.addEventListener('click', () => {
        const key = button.getAttribute('data-sort-key');
        if (!key) return;
        if (state.sort.key === key) {
          state.sort.direction = state.sort.direction === 'asc' ? 'desc' : 'asc';
        } else {
          state.sort = { key, direction: key === 'apprvl_dt' ? 'desc' : 'asc' };
        }
        state.page = 1;
        render();
      });
    });

    tableShellEl?.querySelector('#bid-project-prev')?.addEventListener('click', () => {
      state.page = Math.max(1, derived.page - 1);
      render();
    });

    tableShellEl?.querySelector('#bid-project-next')?.addEventListener('click', () => {
      state.page = Math.min(derived.totalPages, derived.page + 1);
      render();
    });
  }

  function render() {
    if (subtitleEl) {
      let place = '';
      if (state.country?.name) {
        place = normalizeText(state.country.name);
      } else if (state.country?.isRegionAggregate) {
        place = 'América Latina y el Caribe';
      }
      subtitleEl.textContent = place
        ? `Operaciones de Modernización del Estado en ${place}`
        : 'Operaciones de Modernización del Estado';
    }

    renderLinks();

    if (!filtersEl || !summaryEl || !tableShellEl) return;

    if (state.status === 'loading') {
      filtersEl.innerHTML = '';
      summaryEl.innerHTML = '';
      tableShellEl.innerHTML = '<div class="bid-projects-loading">Cargando proyectos BID&hellip;</div>';
      return;
    }

    if (state.status === 'error') {
      filtersEl.innerHTML = '';
      summaryEl.innerHTML = '';
      tableShellEl.innerHTML = `<div class="bid-projects-error">${escapeHtml(state.errorMessage)}</div>`;
      return;
    }

    if (state.status !== 'ready') {
      filtersEl.innerHTML = '';
      summaryEl.innerHTML = '';
      tableShellEl.innerHTML = '<div class="bid-projects-loading">Selecciona un pa&iacute;s para consultar los proyectos BID.</div>';
      return;
    }

    const derived = getDerivedState();
    state.page = derived.page;
    filtersEl.innerHTML = getFiltersMarkup(derived);
    summaryEl.innerHTML = getSummaryMarkup(derived.filteredRows);
    tableShellEl.innerHTML = getTableMarkup(derived);
    bindEvents(derived);
  }

  return {
    setLoading,
    setError,
    setData,
  };
}
