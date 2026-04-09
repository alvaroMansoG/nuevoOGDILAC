const DATASET_URL = '/data/digital-enablers.json';

const STATUS_META = {
  yes: {
    label: 'SI',
    matrixLabel: 'SI',
    exportLabel: 'SI',
    className: 'matrix-cell--yes',
  },
  no: {
    label: 'NO',
    matrixLabel: 'NO',
    exportLabel: 'NO',
    className: 'matrix-cell--no',
  },
  in_development: {
    label: 'EN DESARROLLO',
    matrixLabel: 'ED',
    exportLabel: 'EN DESARROLLO',
    className: 'matrix-cell--dev',
  },
};

const FILTER_GROUPS = [
  { key: 'countries', title: 'País' },
  { key: 'dimensions', title: 'Dimensión' },
  { key: 'enablers', title: 'Habilitador' },
  { key: 'tags', title: 'Tag' },
];

const state = {
  dataset: null,
  view: null,
  searches: {
    countries: '',
    dimensions: '',
    enablers: '',
    tags: '',
  },
  selected: {
    countries: new Set(),
    dimensions: new Set(),
    enablers: new Set(),
    tags: new Set(),
  },
  filtersOpen: false,
  exportOpen: false,
  collapsedDimensions: new Set(),
  pendingUrl: null,
};

/* ── DOM refs ──────────────────────────────────── */
const datasetUpdatedPillEl = document.getElementById('dataset-updated-pill');
const filtersToggleEl = document.getElementById('filters-toggle');
const filtersCloseEl = document.getElementById('filters-close');
const filtersPanelEl = document.getElementById('filters-panel');
const filtersStatusEl = document.getElementById('filters-status');
const activeFiltersEl = document.getElementById('active-filters');
const matrixShellEl = document.getElementById('matrix-shell');
const resetFiltersTopEl = document.getElementById('reset-filters-top');
const exportDropdownEl = document.getElementById('export-dropdown');
const exportFilteredSectionEl = document.getElementById('export-filtered-section');

const extModalEl = document.getElementById('external-link-modal');
const modalUrlTextEl = document.getElementById('modal-url-text');
const modalAcceptBtnEl = document.getElementById('modal-accept-btn');
const modalCancelBtnEl = document.getElementById('modal-cancel-btn');
const modalDontShowCheckboxEl = document.getElementById('modal-dont-show-again');

const backToTopBtnEl = document.getElementById('back-to-top');

const infoTooltipEl = document.createElement('div');
infoTooltipEl.className = 'matrix-floating-tooltip hidden';
document.body.appendChild(infoTooltipEl);

/* ── Helpers ───────────────────────────────────── */
function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatNumber(value) {
  return new Intl.NumberFormat('es-ES').format(Number(value || 0));
}

function formatDateTime(isoValue, includeTime = false) {
  if (!isoValue) return 'Sin fecha';
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) return isoValue;

  const options = { dateStyle: 'medium' };
  if (includeTime) {
    options.timeStyle = 'medium';
  }

  return new Intl.DateTimeFormat('es-ES', options).format(date);
}

function getCountryIso2(country) {
  return String(country?.iso2 || country?.iso3 || '')
    .slice(0, 2)
    .toUpperCase();
}

function getCountryFlagUrl(country, size = 'w40') {
  if (country?.iso2) {
    return `https://flagcdn.com/${size}/${String(country.iso2).toLowerCase()}.png`;
  }

  if (country?.flagUrl) {
    return country.flagUrl.replace('/w40/', `/${size}/`);
  }

  return '';
}

function normalizeTagCase(tag) {
  if (!tag) return '';
  const str = String(tag).trim();
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function hasActiveFilters() {
  return Object.values(state.selected).some((set) => set.size > 0);
}

/* ── Dataset ───────────────────────────────────── */
function buildDataset(rawDataset) {
  const countries = Array.isArray(rawDataset.countries) ? rawDataset.countries : [];
  const dimensions = Array.isArray(rawDataset.dimensions) ? rawDataset.dimensions : [];
  const enablers = Array.isArray(rawDataset.enablers) ? rawDataset.enablers : [];
  const records = Array.isArray(rawDataset.records) ? rawDataset.records : [];
  const countriesByIso = new Map(countries.map((country) => [country.iso3, country]));
  const dimensionsByKey = new Map(dimensions.map((dimension) => [dimension.key, dimension]));
  const enablersByKey = new Map(enablers.map((enabler) => [enabler.key, enabler]));
  const enablersByDimension = new Map();
  const recordsByCell = new Map();
  const tags = new Map();

  enablers.forEach((enabler) => {
    const currentList = enablersByDimension.get(enabler.dimensionKey) || [];
    currentList.push(enabler);
    enablersByDimension.set(enabler.dimensionKey, currentList);

    if (Array.isArray(enabler.tags)) {
      enabler.tags = enabler.tags.map(normalizeTagCase);
      enabler.tags.forEach((tag) => {
        tags.set(tag, tag);
      });
    }
  });

  records.forEach((record) => {
    recordsByCell.set(`${record.habilitador_key}::${record.pais_iso3}`, record);
  });

  return {
    meta: rawDataset.meta || {},
    countries,
    dimensions,
    enablers,
    records,
    countriesByIso,
    dimensionsByKey,
    enablersByKey,
    enablersByDimension,
    recordsByCell,
    tags: Array.from(tags.keys()).sort((left, right) => left.localeCompare(right, 'es')),
  };
}

/* ── Filter options ────────────────────────────── */
function getFilterOptions(groupKey) {
  if (!state.dataset) return [];

  switch (groupKey) {
    case 'countries':
      return state.dataset.countries
        .slice()
        .sort((left, right) => left.name.localeCompare(right.name, 'es'))
        .map((country) => ({
        value: country.iso3,
        label: country.name,
        meta: country.bidRegion || 'América Latina y el Caribe',
        badge: getCountryIso2(country),
        flagUrl: getCountryFlagUrl(country),
      }));
    case 'dimensions':
      return state.dataset.dimensions.map((dimension) => ({
        value: dimension.key,
        label: dimension.title,
        meta: `${(state.dataset.enablersByDimension.get(dimension.key) || []).length} habilitadores`,
      }));
    case 'enablers':
      return state.dataset.enablers.map((enabler) => ({
        value: enabler.key,
        label: enabler.name,
        meta: state.dataset.dimensionsByKey.get(enabler.dimensionKey)?.title || '',
        badge: (enabler.tags || []).slice(0, 2).join(' · '),
      }));
    case 'tags':
      return state.dataset.tags.map((tag) => ({
        value: tag,
        label: tag,
        meta: `${state.dataset.enablers.filter((entry) => (entry.tags || []).includes(tag)).length} habilitadores`,
      }));
    default:
      return [];
  }
}

function getLabelForSelection(groupKey, value) {
  const option = getFilterOptions(groupKey).find((entry) => entry.value === value);
  return option ? option.label : value;
}

/* ── View builder ──────────────────────────────── */
function buildView() {
  if (!state.dataset) return null;

  const activeCountries = (state.selected.countries.size
    ? state.dataset.countries.filter((country) => state.selected.countries.has(country.iso3))
    : state.dataset.countries)
    .slice()
    .sort((left, right) => left.name.localeCompare(right.name, 'es'));

  const visibleEnablers = state.dataset.enablers.filter((enabler) => {
    const matchesDimension = state.selected.dimensions.size === 0 || state.selected.dimensions.has(enabler.dimensionKey);
    const matchesEnabler = state.selected.enablers.size === 0 || state.selected.enablers.has(enabler.key);
    const matchesTag = state.selected.tags.size === 0 || (enabler.tags || []).some((tag) => state.selected.tags.has(tag));
    return matchesDimension && matchesEnabler && matchesTag;
  });

  const visibleEnablerKeys = new Set(visibleEnablers.map((enabler) => enabler.key));
  const visibleCountryKeys = new Set(activeCountries.map((country) => country.iso3));
  const visibleDimensions = state.dataset.dimensions
    .map((dimension) => ({
      ...dimension,
      enablers: (state.dataset.enablersByDimension.get(dimension.key) || []).filter((enabler) => visibleEnablerKeys.has(enabler.key)),
    }))
    .filter((dimension) => dimension.enablers.length > 0);
  const visibleRecords = state.dataset.records.filter((record) => (
    visibleCountryKeys.has(record.pais_iso3) && visibleEnablerKeys.has(record.habilitador_key)
  ));
  const statusCounts = {
    yes: 0,
    no: 0,
    in_development: 0,
  };

  visibleRecords.forEach((record) => {
    if (statusCounts[record.statusKey] != null) {
      statusCounts[record.statusKey] += 1;
    }
  });

  return {
    countries: activeCountries,
    dimensions: visibleDimensions,
    enablers: visibleEnablers,
    records: visibleRecords,
    statusCounts,
  };
}

/* ── Render: toolbar status ────────────────────── */
function renderToolbarStatus(view) {
  const active = hasActiveFilters();
  const filterCount = Object.values(state.selected).reduce((sum, set) => sum + set.size, 0);

  // Toggle filter button label
  const labelEl = filtersToggleEl.querySelector('.toolbar-icon-label');
  if (labelEl) {
    labelEl.textContent = active ? `Filtros (${filterCount})` : 'Filtros';
  }
  filtersToggleEl.setAttribute('aria-expanded', state.filtersOpen ? 'true' : 'false');
  filtersPanelEl.classList.toggle('hidden', !state.filtersOpen);

  // Status pill
  if (active) {
    filtersStatusEl.textContent = `${formatNumber(view.countries.length)} países · ${formatNumber(view.enablers.length)} hab. · ${formatNumber(view.records.length)} cruces`;
  } else {
    filtersStatusEl.textContent = 'Sin filtros';
  }

  // Show/hide reset button
  resetFiltersTopEl.classList.toggle('hidden', !active);

  // Show/hide filtered export section
  exportFilteredSectionEl.classList.toggle('hidden', !active);
}

/* ── Render: active chips ──────────────────────── */
function renderActiveFilters() {
  const chips = [];

  FILTER_GROUPS.forEach((group) => {
    state.selected[group.key].forEach((value) => {
      chips.push({
        groupKey: group.key,
        label: `${group.title}: ${getLabelForSelection(group.key, value)}`,
        value,
      });
    });
  });

  if (chips.length === 0) {
    activeFiltersEl.innerHTML = '';
    return;
  }

  activeFiltersEl.innerHTML = chips.map((chip) => `
    <span class="active-filter-chip">
      <span>${escapeHtml(chip.label)}</span>
      <button type="button" aria-label="Quitar filtro ${escapeHtml(chip.label)}" data-remove-filter-group="${chip.groupKey}" data-remove-filter-value="${escapeHtml(chip.value)}">×</button>
    </span>
  `).join('');
}

/* ── Render: filter options ────────────────────── */
function renderFilterOptions() {
  FILTER_GROUPS.forEach((group) => {
    const container = document.getElementById(`options-${group.key}`);
    const countEl = document.getElementById(`count-${group.key}`);
    if (!container || !countEl) return;

    const searchValue = normalizeText(state.searches[group.key]);
    const options = getFilterOptions(group.key).filter((option) => {
      if (!searchValue) return true;
      return [option.label, option.meta, option.badge].some((entry) => normalizeText(entry).includes(searchValue));
    });

    countEl.textContent = String(state.selected[group.key].size);

    if (options.length === 0) {
      container.innerHTML = '<div class="filter-options-empty">No hay coincidencias con esa búsqueda.</div>';
      return;
    }

    container.innerHTML = options.map((option) => `
      <label class="filter-option">
        <input type="checkbox" data-filter-group="${group.key}" data-filter-value="${escapeHtml(option.value)}" ${state.selected[group.key].has(option.value) ? 'checked' : ''} />
        ${option.flagUrl ? `<img src="${escapeHtml(option.flagUrl)}" class="filter-option-flag" alt="" loading="lazy" />` : ''}
        <span class="filter-option-copy">
          <span class="filter-option-label">${escapeHtml(option.label)}</span>
          <span class="filter-option-meta">${escapeHtml(option.meta || 'Sin detalle adicional')}</span>
        </span>
        ${option.badge ? `<span class="filter-option-badge">${escapeHtml(option.badge)}</span>` : ''}
      </label>
    `).join('');
  });
}

/* ── Render: matrix ────────────────────────────── */
function buildCell(record) {
  const meta = STATUS_META[record.statusKey] || STATUS_META.no;
  const hasLink = Boolean(record.url_evidencia) && (record.statusKey === 'yes' || record.statusKey === 'in_development');
  const title = `${record.pais} · ${record.habilitador} · ${meta.exportLabel}`;
  const updatedAt = record.updated_at || state.dataset?.meta?.generatedAt || new Date().toISOString();

  const commonAttrs = `
    data-cell-tooltip="true"
    data-url="${escapeHtml(record.url_evidencia || '')}"
    data-updated="${escapeHtml(updatedAt)}"
    data-title="${escapeHtml(title)}"
  `;

  if (hasLink) {
    return `
      <a
        class="matrix-cell matrix-cell--link"
        href="${escapeHtml(record.url_evidencia)}"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="${escapeHtml(`${title}. Abrir evidencia oficial.`)}"
        ${commonAttrs}
      >
        <span class="matrix-dot ${meta.className}" aria-hidden="true"></span>
        <span class="matrix-visually-hidden">${escapeHtml(meta.matrixLabel)}</span>
      </a>
    `;
  }

  return `
    <span class="matrix-cell" ${commonAttrs}>
      <span class="matrix-dot ${meta.className}" aria-hidden="true"></span>
      <span class="matrix-visually-hidden">${escapeHtml(meta.matrixLabel)}</span>
    </span>
  `;
}

// renderDimensionJumps was removed

function renderMatrix(view) {
  if (view.countries.length === 0 || view.dimensions.length === 0) {
    matrixShellEl.innerHTML = `
      <div class="matrix-empty">
        <h3>No hay resultados con esta combinación de filtros.</h3>
        <p>Prueba con menos países, menos filtros o vuelve a la vista regional completa.</p>
        <button type="button" class="toolbar-icon-btn" id="matrix-reset-filters">Limpiar filtros</button>
      </div>
    `;
    return;
  }

  const headHtml = `
    <thead>
      <tr>
        <th scope="col" data-col-index="0">Habilitador</th>
        ${view.countries.map((country, idx) => `
          <th scope="col" title="${escapeHtml(country.name)}" aria-label="${escapeHtml(country.name)}" data-col-index="${idx + 1}">
            <div class="matrix-country-head" title="${escapeHtml(country.name)}" aria-label="${escapeHtml(country.name)}">
              <img class="matrix-country-flag" src="${escapeHtml(getCountryFlagUrl(country, 'w40'))}" alt="" loading="lazy" title="${escapeHtml(country.name)}" />
              <span class="matrix-country-code">${escapeHtml(getCountryIso2(country))}</span>
            </div>
          </th>
        `).join('')}
      </tr>
    </thead>
  `;

  const bodyHtml = view.dimensions.map((dimension) => {
    const isCollapsed = state.collapsedDimensions.has(dimension.key);

    return `
    <tr class="matrix-dimension-row" data-dimension-toggle="${escapeHtml(dimension.key)}">
      <th scope="colgroup" colspan="${view.countries.length + 1}" class="matrix-dimension-title">
        <div class="matrix-dimension-title-inner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="matrix-dimension-icon ${isCollapsed ? 'matrix-dimension-icon--collapsed' : ''}">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
          <span>${escapeHtml(dimension.title)}${isCollapsed ? ` (${dimension.enablers.length})` : ''}</span>
        </div>
      </th>
    </tr>
    ${isCollapsed ? '' : dimension.enablers.map((enabler) => `
      <tr>
        <th scope="row" class="matrix-row-header">
          <div class="matrix-row-header-copy">
            <div class="matrix-row-title-line">
              <span class="matrix-row-title">${escapeHtml(enabler.name)}</span>
              <button type="button" class="matrix-info-trigger" data-tooltip="${escapeHtml(enabler.description || 'Sin descripción disponible')}" aria-label="Ver descripción de ${escapeHtml(enabler.name)}">i</button>
            </div>
          </div>
        </th>
        ${view.countries.map((country, idx) => {
          const record = state.dataset.recordsByCell.get(`${enabler.key}::${country.iso3}`);
          return `<td class="matrix-cell-wrap" data-col-index="${idx + 1}">${record ? buildCell(record) : '<span class="matrix-cell"><span class="matrix-dot matrix-cell--no" aria-hidden="true"></span><span class="matrix-visually-hidden">NO</span></span>'}</td>`;
        }).join('')}
      </tr>
    `).join('')}
  `}).join('');

  matrixShellEl.innerHTML = `
    <table class="matrix-table" style="--matrix-country-count:${Math.max(view.countries.length, 1)}">
      <colgroup>
        <col class="matrix-first-col" />
        ${view.countries.map(() => '<col class="matrix-country-col" />').join('')}
      </colgroup>
      ${headHtml}
      <tbody>
        ${bodyHtml}
      </tbody>
    </table>
  `;
}

/* ── Render: export button state ───────────────── */
function setExportButtonsState(view) {
  document.querySelectorAll('[data-export-scope="filtered"]').forEach((button) => {
    button.disabled = view.records.length === 0;
  });
}

/* ── Main render ───────────────────────────────── */
function render() {
  state.view = buildView();
  if (!state.view) return;

  renderToolbarStatus(state.view);
  renderFilterOptions();
  renderActiveFilters();
  renderMatrix(state.view);
  setExportButtonsState(state.view);
}

/* ── Enhanced Interactions ─────────────────────── */
function updateCrosshair(trigger, active) {
  const cellWrap = trigger.closest('.matrix-cell-wrap');
  if (!cellWrap) return;
  
  const row = cellWrap.closest('tr');
  const colIndex = cellWrap.dataset.colIndex;
  
  if (active) {
    row.classList.add('matrix-row-highlight');
    if (colIndex) {
      document.querySelectorAll(`.matrix-cell-wrap[data-col-index="${colIndex}"]`).forEach(el => {
        el.classList.add('matrix-col-highlight');
      });
      document.querySelectorAll(`th[data-col-index="${colIndex}"]`).forEach(el => {
        el.classList.add('matrix-col-header-highlight');
      });
    }
  } else {
    document.querySelectorAll('.matrix-row-highlight').forEach(el => el.classList.remove('matrix-row-highlight'));
    document.querySelectorAll('.matrix-col-highlight').forEach(el => el.classList.remove('matrix-col-highlight'));
    document.querySelectorAll('.matrix-col-header-highlight').forEach(el => el.classList.remove('matrix-col-header-highlight'));
  }
}

/* ── Tooltip ───────────────────────────────────── */
function hideInfoTooltip() {
  infoTooltipEl.classList.add('hidden');
  infoTooltipEl.textContent = '';
}

function showInfoTooltip(trigger) {
  const isCell = trigger?.dataset?.cellTooltip === 'true';
  const text = trigger?.dataset?.tooltip;
  
  if (!isCell && !text) {
    hideInfoTooltip();
    return;
  }

  if (isCell) {
    const url = trigger.dataset.url;
    const updatedAt = trigger.dataset.updated;
    const title = trigger.dataset.title;
    
    infoTooltipEl.innerHTML = `
      <div class="matrix-cell-tooltip-content">
        ${url ? `
          <div class="matrix-tooltip-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="matrix-tooltip-icon"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            <span class="matrix-tooltip-url">${escapeHtml(url)}</span>
          </div>
        ` : `<div class="matrix-tooltip-no-link">No hay enlace disponible</div>`}
        <div class="matrix-tooltip-divider"></div>
        <div class="matrix-tooltip-footer">
          <strong>Última modificación:</strong> ${formatDateTime(updatedAt, true)}
        </div>
      </div>
    `;
    infoTooltipEl.classList.add('matrix-floating-tooltip--cell');
  } else {
    infoTooltipEl.textContent = text;
    infoTooltipEl.classList.remove('matrix-floating-tooltip--cell');
  }

  infoTooltipEl.classList.remove('hidden');

  const triggerRect = trigger.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const maxWidth = Math.min(360, Math.max(220, viewportWidth - 24));

  infoTooltipEl.style.maxWidth = `${maxWidth}px`;
  infoTooltipEl.style.left = '12px';
  infoTooltipEl.style.top = `${Math.round(triggerRect.bottom + 10)}px`;

  const tooltipRect = infoTooltipEl.getBoundingClientRect();
  const left = Math.min(
    viewportWidth - tooltipRect.width - 12,
    Math.max(12, triggerRect.left - 8),
  );

  let top = triggerRect.bottom + 10;
  if (top + tooltipRect.height > window.innerHeight - 12) {
    top = Math.max(12, triggerRect.top - tooltipRect.height - 10);
  }

  infoTooltipEl.style.left = `${Math.round(left)}px`;
  infoTooltipEl.style.top = `${Math.round(top)}px`;
}

/* ── State helpers ─────────────────────────────── */
function setFiltersOpen(nextState) {
  state.filtersOpen = nextState;
  renderToolbarStatus(state.view || buildView());
}

function setExportOpen(nextState) {
  state.exportOpen = nextState;
  exportDropdownEl.classList.toggle('hidden', !nextState);
}

function clearFilters() {
  Object.keys(state.selected).forEach((key) => {
    state.selected[key].clear();
  });
  Object.keys(state.searches).forEach((key) => {
    state.searches[key] = '';
  });
  document.querySelectorAll('[data-filter-search]').forEach((input) => {
    input.value = '';
  });
  render();
}

/* ── Warning Modal Logic ───────────────────────── */
function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    let date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
}

function getCookie(name) {
  let nameEQ = name + "=";
  let ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function showExternalLinkWarning(url) {
  state.pendingUrl = url;
  modalUrlTextEl.textContent = url;
  extModalEl.classList.remove('hidden');
  // Reset checkbox each time it's shown
  modalDontShowCheckboxEl.checked = false;
}

function handleModalAccept() {
  if (modalDontShowCheckboxEl.checked) {
    setCookie('enablers_skip_external_warning', 'true', 30);
  }
  if (state.pendingUrl) {
    window.open(state.pendingUrl, '_blank', 'noopener,noreferrer');
  }
  closeModal();
}

function closeModal() {
  extModalEl.classList.add('hidden');
  state.pendingUrl = null;
}

/* ── Export logic ──────────────────────────────── */
function buildExportRows(scope) {
  const sourceRows = scope === 'all' ? state.dataset.records : state.view.records;
  return sourceRows.map((record) => ({
    categoria: record.categoria,
    habilitador: record.habilitador,
    pais: record.pais,
    pais_iso3: record.pais_iso3,
    estado: record.estado,
    url_evidencia: record.url_evidencia || '',
  }));
}

function buildExportFileName(scope, extension) {
  const datePart = new Date().toISOString().slice(0, 10);
  const parts = ['habilitadores-digitales', scope === 'all' ? 'completo' : 'filtrado'];

  if (scope === 'filtered' && state.selected.countries.size) {
    const countries = Array.from(state.selected.countries);
    parts.push(countries.length <= 4 ? countries.join('-').toLowerCase() : 'multi-pais');
  }

  return `${parts.join('_')}_${datePart}.${extension}`;
}

function downloadBlob(filename, mimeType, content) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportAsCsv(rows, scope) {
  const headers = ['categoria', 'habilitador', 'pais', 'pais_iso3', 'estado', 'url_evidencia'];
  const csv = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => `"${String(row[header] || '').replace(/"/g, '""')}"`).join(',')),
  ].join('\r\n');

  downloadBlob(buildExportFileName(scope, 'csv'), 'text/csv;charset=utf-8', csv);
}

function exportAsJson(rows, scope) {
  downloadBlob(buildExportFileName(scope, 'json'), 'application/json;charset=utf-8', JSON.stringify(rows, null, 2));
}

function exportAsXlsx(rows, scope) {
  if (!window.XLSX) {
    window.alert('La librería para exportar a Excel no está disponible en este momento.');
    return;
  }

  const worksheet = window.XLSX.utils.json_to_sheet(rows, {
    header: ['categoria', 'habilitador', 'pais', 'pais_iso3', 'estado', 'url_evidencia'],
  });

  worksheet['!cols'] = [
    { wch: 32 },
    { wch: 42 },
    { wch: 24 },
    { wch: 12 },
    { wch: 18 },
    { wch: 60 },
  ];

  const workbook = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Habilitadores');
  window.XLSX.writeFile(workbook, buildExportFileName(scope, 'xlsx'));
}

function handleExport(scope, format) {
  const rows = buildExportRows(scope);
  if (rows.length === 0) {
    window.alert('No hay datos visibles para exportar con la selección actual.');
    return;
  }

  if (format === 'csv') {
    exportAsCsv(rows, scope);
    return;
  }

  if (format === 'json') {
    exportAsJson(rows, scope);
    return;
  }

  exportAsXlsx(rows, scope);
}

/* ── Events ────────────────────────────────────── */
function bindEvents() {
  filtersToggleEl.addEventListener('click', () => {
    setFiltersOpen(!state.filtersOpen);
  });

  filtersCloseEl.addEventListener('click', () => {
    setFiltersOpen(false);
  });

  resetFiltersTopEl.addEventListener('click', () => {
    clearFilters();
  });

  // Export trigger
  document.querySelector('[data-export-trigger]').addEventListener('click', (event) => {
    event.stopPropagation();
    setExportOpen(!state.exportOpen);
  });

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    if (target.closest('[data-remove-filter-group]')) {
      const button = target.closest('[data-remove-filter-group]');
      const groupKey = button.dataset.removeFilterGroup;
      const value = button.dataset.removeFilterValue;
      if (groupKey && value) {
        state.selected[groupKey].delete(value);
        render();
      }
      return;
    }

    if (target.closest('[data-dimension-toggle]')) {
      const row = target.closest('[data-dimension-toggle]');
      const key = row.dataset.dimensionToggle;
      if (key) {
        if (state.collapsedDimensions.has(key)) {
          state.collapsedDimensions.delete(key);
        } else {
          state.collapsedDimensions.add(key);
        }
        renderMatrix(state.view);
      }
      return;
    }

    if (target.closest('[data-export-scope]')) {
      const button = target.closest('[data-export-scope]');
      handleExport(button.dataset.exportScope, button.dataset.exportFormat);
      setExportOpen(false);
      return;
    }

    if (target.id === 'matrix-reset-filters') {
      clearFilters();
      return;
    }

    if (!target.closest('.matrix-info-trigger')) {
      hideInfoTooltip();
    }

    // Close export dropdown on outside click
    if (!target.closest('.toolbar-right') && state.exportOpen) {
      setExportOpen(false);
    }

    // Close filters on outside click
    const clickedInsidePanel = target.closest('#filters-panel');
    const clickedToggle = target.closest('#filters-toggle');
    if (!clickedInsidePanel && !clickedToggle && state.filtersOpen) {
      setFiltersOpen(false);
    }
  });

  filtersPanelEl.addEventListener('change', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    const groupKey = target.dataset.filterGroup;
    const value = target.dataset.filterValue;
    if (!groupKey || !value) return;

    if (target.checked) {
      state.selected[groupKey].add(value);
    } else {
      state.selected[groupKey].delete(value);
    }

    render();
  });

  filtersPanelEl.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) return;
    const action = target.dataset.action;
    const groupKey = target.dataset.group;
    if (!action || !groupKey) return;

    if (action === 'select-all') {
      const searchValue = normalizeText(state.searches[groupKey]);
      const options = getFilterOptions(groupKey).filter((option) => {
        if (!searchValue) return true;
        return [option.label, option.meta, option.badge].some((entry) => 
          normalizeText(entry).includes(searchValue)
        );
      });
      options.forEach((opt) => state.selected[groupKey].add(opt.value));
    } else if (action === 'unselect-all') {
      state.selected[groupKey].clear();
    }

    render();
  });

  document.querySelectorAll('[data-filter-search]').forEach((input) => {
    input.addEventListener('input', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      const groupKey = target.dataset.filterSearch;
      if (!groupKey) return;

      state.searches[groupKey] = target.value;
      renderFilterOptions();
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && state.filtersOpen) {
      setFiltersOpen(false);
    }

    if (event.key === 'Escape' && state.exportOpen) {
      setExportOpen(false);
    }

    if (event.key === 'Escape') {
      hideInfoTooltip();
    }
  });

  document.addEventListener('mouseover', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const trigger = target.closest('.matrix-info-trigger') || target.closest('.matrix-cell');
    if (!trigger) return;

    showInfoTooltip(trigger);

    if (trigger.closest('.matrix-cell')) {
      updateCrosshair(trigger, true);
    }
  });

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      backToTopBtnEl.classList.remove('hidden');
    } else {
      backToTopBtnEl.classList.add('hidden');
    }
  }, { passive: true });

  backToTopBtnEl.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.addEventListener('click', (event) => {
    const link = event.target.closest('.matrix-cell--link');
    if (!link) return;

    // Shift/Ctrl/Cmd behavior preservation
    if (event.shiftKey || event.ctrlKey || event.metaKey) return;

    if (getCookie('enablers_skip_external_warning') === 'true') {
      return; 
    }

    event.preventDefault();
    const url = link.getAttribute('href');
    if (url) {
      showExternalLinkWarning(url);
    }
  });

  modalAcceptBtnEl.addEventListener('click', handleModalAccept);
  modalCancelBtnEl.addEventListener('click', closeModal);
  extModalEl.addEventListener('click', (e) => {
    if (e.target === extModalEl) closeModal();
  });

  document.addEventListener('mouseout', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const trigger = target.closest('.matrix-info-trigger') || target.closest('.matrix-cell');
    if (!trigger) return;

    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof HTMLElement && (nextTarget.closest('.matrix-info-trigger') || nextTarget.closest('.matrix-cell'))) {
      return;
    }

    hideInfoTooltip();
    updateCrosshair(trigger, false);
  });

  document.addEventListener('focusin', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const trigger = target.closest('.matrix-info-trigger');
    if (!trigger) return;

    showInfoTooltip(trigger);
  });

  document.addEventListener('focusout', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const trigger = target.closest('.matrix-info-trigger');
    if (!trigger) return;

    hideInfoTooltip();
  });

  matrixShellEl.addEventListener('scroll', hideInfoTooltip, { passive: true });
  window.addEventListener('resize', hideInfoTooltip);
}

/* ── Load ──────────────────────────────────────── */
async function load() {
  try {
    const response = await fetch(DATASET_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const rawDataset = await response.json();
    state.dataset = buildDataset(rawDataset);

    datasetUpdatedPillEl.textContent = `Actualizado ${formatDateTime(state.dataset.meta.generatedAt)}`;

    render();
  } catch (error) {
    console.error('Error loading digital enablers dataset:', error);
    datasetUpdatedPillEl.textContent = 'Error de carga';
    matrixShellEl.innerHTML = `
      <div class="matrix-empty">
        <h3>No se pudo cargar la matriz comparativa.</h3>
        <p>Revisa que el archivo <code>${escapeHtml(DATASET_URL)}</code> esté disponible.</p>
      </div>
    `;
  }
}

bindEvents();
load();
