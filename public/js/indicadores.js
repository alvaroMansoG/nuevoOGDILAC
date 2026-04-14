import {
  COMPONENT_META,
  INDEX_META,
  INDEX_ORDER,
  getCanonicalComponentKey,
  getCanonicalComponentLabel,
} from './gov/catalog.js?v=20260414-ai-fix';

/* OGDILAC - Indices Internacionales */

const ISO2_MAP = {
  ARG: 'ar', BOL: 'bo', BRA: 'br', CHL: 'cl', COL: 'co', CRI: 'cr', DOM: 'do',
  ECU: 'ec', SLV: 'sv', GTM: 'gt', HTI: 'ht', HND: 'hn', JAM: 'jm', MEX: 'mx',
  NIC: 'ni', PAN: 'pa', PRY: 'py', PER: 'pe', TTO: 'tt', URY: 'uy', VEN: 've',
  GUY: 'gy', SUR: 'sr', BLZ: 'bz', BHS: 'bs', BRB: 'bb'
};

const BID_COUNTRIES = [
  { iso3: 'ARG', name: 'Argentina', subregion: 'Cono Sur' },
  { iso3: 'BHS', name: 'Bahamas', subregion: 'Caribe' },
  { iso3: 'BRB', name: 'Barbados', subregion: 'Caribe' },
  { iso3: 'BLZ', name: 'Belice', subregion: 'Centroamérica y México' },
  { iso3: 'BOL', name: 'Bolivia', subregion: 'Grupo Andino' },
  { iso3: 'BRA', name: 'Brasil', subregion: 'Cono Sur' },
  { iso3: 'CHL', name: 'Chile', subregion: 'Cono Sur' },
  { iso3: 'COL', name: 'Colombia', subregion: 'Grupo Andino' },
  { iso3: 'CRI', name: 'Costa Rica', subregion: 'Centroamérica y México' },
  { iso3: 'DOM', name: 'República Dominicana', subregion: 'Caribe' },
  { iso3: 'ECU', name: 'Ecuador', subregion: 'Grupo Andino' },
  { iso3: 'SLV', name: 'El Salvador', subregion: 'Centroamérica y México' },
  { iso3: 'GTM', name: 'Guatemala', subregion: 'Centroamérica y México' },
  { iso3: 'GUY', name: 'Guyana', subregion: 'Caribe' },
  { iso3: 'HTI', name: 'Haití', subregion: 'Caribe' },
  { iso3: 'HND', name: 'Honduras', subregion: 'Centroamérica y México' },
  { iso3: 'JAM', name: 'Jamaica', subregion: 'Caribe' },
  { iso3: 'MEX', name: 'México', subregion: 'Centroamérica y México' },
  { iso3: 'NIC', name: 'Nicaragua', subregion: 'Centroamérica y México' },
  { iso3: 'PAN', name: 'Panamá', subregion: 'Centroamérica y México' },
  { iso3: 'PRY', name: 'Paraguay', subregion: 'Cono Sur' },
  { iso3: 'PER', name: 'Perú', subregion: 'Grupo Andino' },
  { iso3: 'SUR', name: 'Suriname', subregion: 'Caribe' },
  { iso3: 'TTO', name: 'Trinidad y Tobago', subregion: 'Caribe' },
  { iso3: 'URY', name: 'Uruguay', subregion: 'Cono Sur' },
  { iso3: 'VEN', name: 'Venezuela', subregion: 'Grupo Andino' }
];

const SUBREGIONS = [
  { key: 'conosur',  label: 'Cono Sur',               icon: '🔷' },
  { key: 'andino',   label: 'Grupo Andino',            icon: '🏔️' },
  { key: 'cam',      label: 'Centroamérica y México',  icon: '🌮' },
  { key: 'caribe',   label: 'Caribe',                  icon: '🌴' }
];

const SUBREGION_MAP = {
  conosur: 'Cono Sur',
  andino: 'Grupo Andino',
  cam: 'Centroamérica y México',
  caribe: 'Caribe'
};

const MAX_COMPARE = 15;

const COUNTRY_COLORS = ['#2c67c7', '#d44d67', '#19896b', '#dc8a25', '#7657dd', '#1d9db6', '#cb5f9b', '#6e8d24'];
const TERM_HELP = {
  indice: 'Metodología que resume varias dimensiones en una sola medida comparable entre países.',
  puntuacion: 'Valor numérico obtenido por el país en la escala de este índice para la edición seleccionada.',
  rankingMundial: 'Posición del país frente al conjunto global evaluado por la fuente original o calculado según la metodología integrada.',
  posicionRegional: 'Lugar que ocupa dentro de los países prestatarios del BID mostrados en esta pantalla.',
  grupo: 'Categoría cualitativa o tier cuando la metodología oficial clasifica países por niveles.'
};

const KEY_ALIASES = {
  index: ['Índice', 'Indice', 'Ã\x8dndice'],
  country: ['País', 'Pais', 'PaÃ\xads'],
  edition: ['Edición', 'Edicion', 'EdiciÃ³n'],
  score: ['Puntuación', 'Puntuacion', 'PuntuaciÃ³n'],
  component: ['Componente'],
  componentShort: ['Componente corto'],
  rankWorld: ['Ranking Mundial'],
  group: ['Grupo'],
  detail: ['Detalle'],
  aspect: ['Aspecto'],
  source: ['Fuente'],
  url: ['URL'],
  iso3: ['ISO3'],
  isCountry: ['isCountry']
};

const AGGREGATE_META = {
  WRL: { label: 'Media Mundial', icon: '🌍', color: '#5d6f88' },
  ALC: { label: 'Media ALC', icon: '🌎', color: '#dc8a25' },
  OCD: { label: 'Media OCDE', icon: '🏛️', color: '#1d9db6' }
};
const AGGREGATE_KEYS = Object.keys(AGGREGATE_META);

const state = {
  view: 'ranking',
  index: 'EGDI',
  edition: null,
  rankingMode: 'global',
  selectedComponent: 'General',
  showRankingComponents: false,
  rankingSortKey: 'regionalRank',
  rankingSortDir: 'asc',
  compareIndex: 'EGDI',
  compareEdition: null,
  compareCountries: [],
  compareYear: new Date().getFullYear(),
  compareShowComponents: true,
  compareShowTrend: true,
  compareCountrySearch: '',
  drawerIso: null,
  tableSearch: '',
  drawerEditions: {}
};

let store = null;
let worldAtlas = null;
let compareTrendChart = null;
let compareRadarChart = null;
let compareBarsChart = null;
const numericToIso = {
  32: 'ARG', 44: 'BHS', 52: 'BRB', 68: 'BOL', 76: 'BRA', 84: 'BLZ', 152: 'CHL', 170: 'COL',
  188: 'CRI', 214: 'DOM', 218: 'ECU', 222: 'SLV', 320: 'GTM', 328: 'GUY', 332: 'HTI', 340: 'HND',
  388: 'JAM', 484: 'MEX', 558: 'NIC', 591: 'PAN', 600: 'PRY', 604: 'PER', 740: 'SUR', 780: 'TTO',
  858: 'URY', 862: 'VEN'
};

function $(selector, root = document) {
  return root.querySelector(selector);
}

function $$(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function pick(record, aliases) {
  for (const key of aliases) {
    if (Object.prototype.hasOwnProperty.call(record, key)) return record[key];
  }
  return undefined;
}

function toNumber(value) {
  if (value == null || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function flagUrl(iso3, size = 'w40') {
  const iso2 = ISO2_MAP[iso3];
  return iso2 ? `https://flagcdn.com/${size}/${iso2}.png` : '';
}

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function fmt(value, scaleMax) {
  if (value == null || Number.isNaN(value)) return '—';
  if (scaleMax <= 1) return value.toFixed(3);
  if (scaleMax <= 10) return value.toFixed(2);
  return value.toFixed(1);
}

function fmtDiff(value, scaleMax) {
  if (value == null || Number.isNaN(value)) return '—';
  const rendered = fmt(Math.abs(value), scaleMax);
  return `${value >= 0 ? '+' : '−'}${rendered}`;
}

function hexToRgba(hex, alpha) {
  const safe = String(hex || '').replace('#', '');
  const full = safe.length === 3
    ? safe.split('').map((chunk) => chunk + chunk).join('')
    : safe;
  const int = parseInt(full, 16);
  if (!Number.isFinite(int)) return `rgba(0,0,0,${alpha})`;
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

function getGroupBadge(group) {
  if (!group) return '<span class="ind-group-badge ind-group-badge--empty">Sin grupo</span>';
  const normalized = String(group).toLowerCase();
  let cls = 'ind-group-badge--neutral';
  if (normalized.includes('muy alto') || normalized.includes('t1') || normalized.includes('grupo a')) cls = 'ind-group-badge--strong';
  else if (normalized.includes('alto') || normalized.includes('t2') || normalized.includes('grupo b')) cls = 'ind-group-badge--good';
  else if (normalized.includes('medio') || normalized.includes('t3') || normalized.includes('grupo c')) cls = 'ind-group-badge--mid';
  else if (normalized.includes('t4') || normalized.includes('evol')) cls = 'ind-group-badge--warn';
  else if (normalized.includes('bajo') || normalized.includes('t5') || normalized.includes('grupo d')) cls = 'ind-group-badge--risk';
  return `<span class="ind-group-badge ${cls}">${esc(group)}</span>`;
}

function getDeltaTone(value) {
  if (value == null || Number.isNaN(value)) return 'zero';
  if (value > 0) return 'pos';
  if (value < 0) return 'neg';
  return 'zero';
}

function renderTableCell(label, content, className = '') {
  const safeClass = className ? ` class="${className}"` : '';
  return `<td data-label="${esc(label)}"${safeClass}>${content}</td>`;
}

function renderDeltaCell(label, value, scaleMax) {
  const tone = getDeltaTone(value);
  const text = value == null ? 'Sin referencia' : value > 0 ? 'Por encima' : value < 0 ? 'Por debajo' : 'Sin brecha';
  return renderTableCell(label, `
    <div class="ind-delta-chip ind-delta-chip--${tone}">
      <span class="ind-delta-chip-sign" aria-hidden="true">${value == null ? '•' : value > 0 ? '↗' : value < 0 ? '↘' : '•'}</span>
      <span class="ind-delta-chip-copy">
        <strong>${value == null ? '—' : fmtDiff(value, scaleMax)}</strong>
        <span>${text}</span>
      </span>
    </div>
  `, `col-delta col-delta-${tone}`);
}

function getRankCircleClass(rank, baseClass) {
  if (rank === 1) return `${baseClass} ${baseClass}--gold`;
  if (rank === 2) return `${baseClass} ${baseClass}--silver`;
  if (rank === 3) return `${baseClass} ${baseClass}--copper`;
  return baseClass;
}

function getDrawerIndexSnapshot(iso3, index, edition) {
  const ranking = store.getRanking(index, edition);
  return {
    edition,
    entry: ranking.find((item) => item.iso3 === iso3) || null,
    benchmarks: store.getBenchmarks(index, edition),
    ranking
  };
}

function infoTerm(label, key) {
  const description = TERM_HELP[key];
  return `<span class="ind-info-term" title="${esc(description)}">${esc(label)}</span>`;
}

function getComponentLabel(index, componentShort = 'General') {
  return getCanonicalComponentLabel(index, componentShort);
}

function sortComponents(index, components) {
  const labels = COMPONENT_META[index] || {};
  const orderedKeys = Object.keys(labels).filter((key) => key !== 'General');
  const orderMap = new Map(orderedKeys.map((key, idx) => [key, idx]));
  return [...components].sort((a, b) => {
    const posA = orderMap.has(a) ? orderMap.get(a) : Number.MAX_SAFE_INTEGER;
    const posB = orderMap.has(b) ? orderMap.get(b) : Number.MAX_SAFE_INTEGER;
    if (posA !== posB) return posA - posB;
    return String(a).localeCompare(String(b), 'es');
  });
}

function normalizeMainRow(record) {
  const index = pick(record, KEY_ALIASES.index);
  const rawComponent = pick(record, KEY_ALIASES.component);
  const rawComponentShort = pick(record, KEY_ALIASES.componentShort);
  const canonicalComponentShort = getCanonicalComponentKey(index, rawComponentShort || rawComponent);
  return {
    index,
    country: pick(record, KEY_ALIASES.country),
    iso3: pick(record, KEY_ALIASES.iso3),
    component: getCanonicalComponentLabel(index, rawComponentShort || rawComponent),
    componentShort: canonicalComponentShort,
    edition: toNumber(pick(record, KEY_ALIASES.edition)),
    score: toNumber(pick(record, KEY_ALIASES.score)),
    rankWorld: toNumber(pick(record, KEY_ALIASES.rankWorld)),
    group: pick(record, KEY_ALIASES.group) || '',
    isCountry: String(pick(record, KEY_ALIASES.isCountry) || '').toUpperCase() === 'SI'
  };
}

function normalizeMethodRow(record) {
  return {
    index: pick(record, KEY_ALIASES.index),
    aspect: pick(record, KEY_ALIASES.aspect),
    detail: pick(record, KEY_ALIASES.detail)
  };
}

function normalizeSourceRow(record) {
  return {
    index: pick(record, KEY_ALIASES.index),
    edition: pick(record, KEY_ALIASES.edition),
    source: pick(record, KEY_ALIASES.source),
    url: pick(record, KEY_ALIASES.url)
  };
}

class DataStore {
  constructor(raw, methodology, sources) {
    this.rows = (raw || []).map(normalizeMainRow).filter((row) => row.index && row.edition != null);
    this.methodology = (methodology || []).map(normalizeMethodRow).filter((row) => row.index);
    this.sources = (sources || []).map(normalizeSourceRow).filter((row) => row.index);
    this.buildLookups();
  }

  buildLookups() {
    const countries = this.rows.filter((row) => row.isCountry);
    this.countryISO = {};
    this.isoToName = {};
    countries.forEach((row) => {
      this.countryISO[row.country] = row.iso3;
      this.isoToName[row.iso3] = row.country;
    });
    
    BID_COUNTRIES.forEach((bc) => {
      this.countryISO[bc.name] = bc.iso3;
      this.isoToName[bc.iso3] = bc.name;
    });
    
    this.countries = Object.keys(this.countryISO).sort((a, b) => a.localeCompare(b, 'es'));
    this.indicesSorted = INDEX_ORDER.filter((index) => this.rows.some((row) => row.index === index));
  }

  isGeneral(index, componentValue) {
    if (!componentValue) return false;
    const meta = INDEX_META[index] || {};
    const normalized = String(componentValue).toLowerCase();
    return normalized === 'general'
      || normalized === String(index).toLowerCase()
      || normalized === String(meta.shortName || '').toLowerCase()
      || normalized === String(meta.key || '').toLowerCase();
  }

  getEditions(index) {
    return [...new Set(this.rows.filter((row) => row.index === index).map((row) => row.edition))]
      .sort((a, b) => b - a);
  }

  getLatestEdition(index) {
    const editions = this.getEditions(index);
    return editions.length ? editions[0] : null;
  }

  getComponents(index, edition) {
    return sortComponents(index, [...new Set(
      this.rows
        .filter((row) => row.index === index && row.edition === edition && !this.isGeneral(index, row.componentShort) && !this.isGeneral(index, row.component))
        .map((row) => row.componentShort)
        .filter(Boolean)
    )]);
  }

  getRanking(index, edition, componentShort = 'General') {
    const rawRanking = this.rows
      .filter((row) => row.index === index && row.edition === edition && row.isCountry)
      .filter((row) => {
        if (componentShort === 'General') return this.isGeneral(index, row.componentShort) || this.isGeneral(index, row.component);
        return row.componentShort === componentShort;
      })
      .sort((a, b) => {
        const aValue = a.score == null ? -Infinity : a.score;
        const bValue = b.score == null ? -Infinity : b.score;
        return bValue - aValue;
      })
      .map((row, position) => {
        const hasData = row.score != null;
        return {
          country: row.country,
          iso3: row.iso3,
          score: row.score,
          rankWorld: row.rankWorld,
          group: row.group,
          regionalRank: hasData ? position + 1 : null,
          isMissing: !hasData
        };
      });

    const existingIsos = new Set(rawRanking.map((r) => r.iso3));
    const pureMissings = BID_COUNTRIES.filter((bc) => !existingIsos.has(bc.iso3)).map((mc) => ({
      country: mc.name,
      iso3: mc.iso3,
      score: null,
      rankWorld: null,
      group: null,
      regionalRank: null,
      isMissing: true
    }));

    return [...rawRanking, ...pureMissings];
  }

  getBenchmarks(index, edition, componentShort = 'General') {
    const rows = this.rows
      .filter((row) => row.index === index && row.edition === edition && !row.isCountry)
      .filter((row) => {
        if (componentShort === 'General') return this.isGeneral(index, row.componentShort) || this.isGeneral(index, row.component);
        return row.componentShort === componentShort;
      });

    const benchmarks = { alc: null, ocde: null, world: null };
    rows.forEach((row) => {
      if (row.iso3 === 'ALC') benchmarks.alc = row.score;
      if (row.iso3 === 'OCD') benchmarks.ocde = row.score;
      if (row.iso3 === 'WRL') benchmarks.world = row.score;
    });
    return benchmarks;
  }

  getCountryIndexRow(iso3, index, edition, componentShort = 'General') {
    return this.getRanking(index, edition, componentShort).find((entry) => entry.iso3 === iso3) || null;
  }

  getTimeSeries(iso3, index, componentShort = 'General') {
    return this.rows
      .filter((row) => row.iso3 === iso3 && row.index === index)
      .filter((row) => {
        if (componentShort === 'General') return this.isGeneral(index, row.componentShort) || this.isGeneral(index, row.component);
        return row.componentShort === componentShort;
      })
      .map((row) => {
        const rankingEntry = this.getCountryIndexRow(iso3, index, row.edition, componentShort);
        return {
          year: row.edition,
          score: row.score,
          rankWorld: row.rankWorld,
          regionalRank: rankingEntry?.regionalRank ?? null,
          group: row.group || ''
        };
      })
      .filter((row) => row.score != null)
      .sort((a, b) => a.year - b.year);
  }

  getMethodology(index) {
    return this.methodology.filter((row) => row.index === index || row.index === 'Común');
  }

  getMethodologyAspect(index, aspect) {
    return this.getMethodology(index).find((row) => row.aspect === aspect)?.detail || '';
  }

  getSources(index) {
    return this.sources.filter((row) => row.index === index);
  }

  getCountryProfile(iso3) {
    const profile = {};
    this.indicesSorted.forEach((index) => {
      const edition = this.getLatestEdition(index);
      if (!edition) return;
      const ranking = this.getRanking(index, edition);
      const entry = ranking.find((item) => item.iso3 === iso3) || null;
      const components = this.getComponents(index, edition).map((component) => ({
        component,
        entry: this.getCountryIndexRow(iso3, index, edition, component)
      }));
      profile[index] = {
        edition,
        entry,
        ranking,
        benchmarks: this.getBenchmarks(index, edition),
        components
      };
    });
    return profile;
  }
}

function buildGlossaryItems() {
  return '';
}

function getEditionForYear(index, year) {
  const editions = store.getEditions(index);
  const filtered = editions.filter((ed) => ed <= year);
  return filtered.length ? filtered[0] : editions[0] || null;
}

function normalizeScore(score, scaleMax) {
  if (score == null || scaleMax == null || scaleMax === 0) return null;
  return score / scaleMax;
}

function isAggregate(key) {
  return AGGREGATE_KEYS.includes(key);
}

function getActiveIndex() {
  return state.view === 'compare' ? state.compareIndex : state.index;
}

function getActiveEdition() {
  return state.view === 'compare' ? state.compareEdition : state.edition;
}

function syncStateFromURL() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('vista') === 'comparativa') state.view = 'compare';

  const rankingIndex = params.get('indice');
  const compareIndex = params.get('compararIndice');
  if (rankingIndex && INDEX_META[rankingIndex]) state.index = rankingIndex;
  if (compareIndex && INDEX_META[compareIndex]) state.compareIndex = compareIndex;
  if (!compareIndex) state.compareIndex = state.index;

  const rankingEdition = Number(params.get('edicion'));
  const compareEdition = Number(params.get('compararEdicion'));
  if (Number.isFinite(rankingEdition)) state.edition = rankingEdition;
  if (Number.isFinite(compareEdition)) state.compareEdition = compareEdition;

  const countries = params.get('paises');
  if (countries) state.compareCountries = countries.split(',').filter(Boolean);
}

function syncURLFromState() {
  const params = new URLSearchParams();
  params.set('vista', state.view === 'compare' ? 'comparativa' : 'ranking');
  params.set('indice', state.index);
  if (state.edition) params.set('edicion', state.edition);
  params.set('compararIndice', state.compareIndex);
  if (state.compareEdition) params.set('compararEdicion', state.compareEdition);
  if (state.compareCountries.length) params.set('paises', state.compareCountries.join(','));
  const nextUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState(null, '', nextUrl);
}

function ensureStateDefaults() {
  if (!state.edition) state.edition = store.getLatestEdition(state.index);
  if (!store.getEditions(state.index).includes(state.edition)) state.edition = store.getLatestEdition(state.index);

  if (!state.compareIndex) state.compareIndex = state.index;
  if (!state.compareEdition) state.compareEdition = store.getLatestEdition(state.compareIndex);
  if (!store.getEditions(state.compareIndex).includes(state.compareEdition)) state.compareEdition = store.getLatestEdition(state.compareIndex);

  // Default compare selection: aggregates if nothing selected AND no explicit URL param
  if (state.compareCountries.length === 0 && !new URLSearchParams(location.search).has('paises')) {
    state.compareCountries = ['WRL', 'ALC', 'OCD'];
  }

  const components = store.getComponents(state.index, state.edition);
  if (state.rankingMode === 'component' && components.length && !components.includes(state.selectedComponent)) {
    state.selectedComponent = components[0];
  }
  if (!components.length) {
    state.rankingMode = 'global';
    state.selectedComponent = 'General';
  }
}

function renderViewTabs() {
  $$('.ind-view-tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.view === state.view);
  });
  // Sync sticky tabs
  $$('.ind-sticky-tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.view === state.view);
  });
}

function buildEditionSelector(index, edition, extraClass = '') {
  const editions = store.getEditions(index);
  if (!editions.length) return '';
  const options = editions.map((value) => `<option value="${value}" ${value === edition ? 'selected' : ''}>${value}</option>`).join('');
  const controlClass = ['ind-edition-control', extraClass].filter(Boolean).join(' ');
  return `
    <label class="${controlClass}">
      <span class="ind-edition-label">Edición</span>
      <select class="ind-edition-select" aria-label="Seleccionar edición del índice">${options}</select>
    </label>
  `;
}

function renderFilters() {
  const indexGroup = $('#filter-index-group');
  if (!indexGroup) return;
  const activeIndex = getActiveIndex();
  const activeEdition = getActiveEdition();
  const html = store.indicesSorted.map((index) => {
    const meta = INDEX_META[index];
    const isActive = activeIndex === index;
    return `<button type="button" class="ind-index-btn ${isActive ? 'active' : ''}" data-index="${esc(index)}" style="--index-color:${meta.color}" data-tooltip="${esc(meta.tooltip || meta.name)}">
        <span class="ind-index-btn-title">${esc(meta.shortName)}</span>
        <span class="ind-index-btn-org">${esc(meta.org)}</span>
        <span class="ind-index-btn-underline" aria-hidden="true"></span>
      </button>`;
  }).join('');
  indexGroup.innerHTML = html;

  // Update sticky bar index buttons too
  const stickyGroup = $('#sticky-index-group');
  if (stickyGroup) {
    stickyGroup.innerHTML = store.indicesSorted.map((index) => {
      const meta = INDEX_META[index];
      const edition = store.getLatestEdition(index);
      const isActive = activeIndex === index;
      return `<button type="button" class="ind-sticky-index-btn ${isActive ? 'active' : ''}" data-index="${esc(index)}" style="--index-color:${meta.color}" title="${esc(meta.tooltip || meta.name)}">
          <span class="ind-sticky-index-name">${esc(meta.shortName)}</span>
          <span class="ind-sticky-index-org">${esc(meta.org)}${edition ? ` ${edition}` : ''}</span>
        </button>`;
    }).join('');
  }

  const filterEditionSlot = $('#filter-edition-slot');
  if (filterEditionSlot) {
    filterEditionSlot.innerHTML = buildEditionSelector(activeIndex, activeEdition);
  }

  const stickyEditionSlot = $('#sticky-edition-slot');
  if (stickyEditionSlot) {
    stickyEditionSlot.innerHTML = buildEditionSelector(activeIndex, activeEdition);
  }

  // Hide index selectors in compare mode (all indices shown at once via radar)
  const isCompare = state.view === 'compare';
  const filtersBar = indexGroup.closest('.ind-filters');
  const stickyLayout = stickyGroup?.closest('.ind-sticky-index-layout');
  if (filtersBar) filtersBar.style.display = isCompare ? 'none' : '';
  if (stickyLayout) stickyLayout.style.display = isCompare ? 'none' : '';
}

function renderApp() {
  if (!store) return;
  ensureStateDefaults();
  renderFilters();
  renderViewTabs();

  if (state.view !== 'compare') {
    if (compareTrendChart) { compareTrendChart.destroy(); compareTrendChart = null; }
    if (compareRadarChart) { compareRadarChart.destroy(); compareRadarChart = null; }
    if (compareBarsChart) { compareBarsChart.destroy(); compareBarsChart = null; }
  }

  const content = $('#ind-content');
  if (!content) return;

  if (state.view === 'ranking') {
    content.className = 'ind-view-panel';
    renderRankingView(content);
  } else {
    content.className = 'ind-view-panel';
    renderCompareView(content);
  }

  syncURLFromState();
}

function buildReadingPills(index, edition, componentShort) {
  const meta = INDEX_META[index];
  const methodology = store.getMethodology(index);
  const coverage = methodology.find((row) => row.aspect === 'Cobertura incluida')?.detail;
  const rankingRule = methodology.find((row) => row.aspect === 'Ranking')?.detail;
  const groupRule = methodology.find((row) => row.aspect === 'Grupo')?.detail;
  return `
    <div class="ind-reading-pills">
      <span class="ind-reading-pill"><strong>Índice:</strong> ${esc(meta.shortName)}</span>
      <span class="ind-reading-pill"><strong>Edición:</strong> ${esc(edition)}</span>
      <span class="ind-reading-pill"><strong>Vista:</strong> ${esc(getComponentLabel(index, componentShort))}</span>
      <span class="ind-reading-pill"><strong>Escala:</strong> 0-${esc(meta.scaleMax)}</span>
    </div>
    <div class="ind-reading-notes">
      ${coverage ? `<p><strong>Cobertura:</strong> ${esc(coverage)}</p>` : ''}
      ${rankingRule ? `<p><strong>Cómo se ordena:</strong> ${esc(rankingRule)}</p>` : ''}
      ${groupRule ? `<p><strong>Cómo leer el grupo:</strong> ${esc(groupRule)}</p>` : ''}
    </div>
  `;
}

function buildBenchmarkCard(label, value, detail, message, color) {
  return `
    <article class="ind-bench-card" style="--bench-color:${color}">
      <span class="ind-bench-label">${esc(label)}</span>
      <strong class="ind-bench-value">${value}</strong>
      <p class="ind-bench-detail">${esc(detail)}</p>
      <p class="ind-bench-message">${esc(message)}</p>
    </article>
  `;
}

function buildBenchmarkMessage(score, benchmark, scaleMax) {
  if (score == null || benchmark == null) return 'No hay base suficiente para interpretar la brecha.';
  const diff = score - benchmark;
  if (Math.abs(diff) < scaleMax * 0.03) return 'La selección se mueve muy cerca de esta referencia.';
  return diff > 0
    ? `Está por encima de esta referencia en ${fmt(Math.abs(diff), scaleMax)} puntos.`
    : `Está por debajo de esta referencia en ${fmt(Math.abs(diff), scaleMax)} puntos.`;
}

function buildBenchmarkStrip(meta, benchmarks, referenceScore) {
  const items = [
    {
      key: 'world',
      label: 'Mundial',
      value: benchmarks.world,
      color: '#5d6f88',
      help: 'Media de todos los países con dato disponible para esta edición.'
    },
    {
      key: 'ocde',
      label: 'OCDE',
      value: benchmarks.ocde,
      color: '#1d9db6',
      help: 'Media de referencia externa para países OCDE con dato disponible.'
    },
    {
      key: 'alc',
      label: 'ALC',
      value: benchmarks.alc,
      color: '#dc8a25',
      help: 'Media de los países prestatarios del BID mostrados en la región.'
    }
  ].filter((item) => item.value != null);

  if (!items.length) return '';

  return `
    <div class="ind-benchmark-strip">
      ${items.map((item) => {
        const delta = referenceScore != null ? item.value - referenceScore : null;
        const deltaClass = delta == null ? '' : delta >= 0 ? 'is-positive' : 'is-negative';
        return `
          <div class="ind-benchmark-inline" title="${esc(item.help)}">
            <span class="ind-benchmark-inline-label" style="--bench-inline-color:${item.color}">${esc(item.label)}</span>
            <strong class="ind-benchmark-inline-value">${fmt(item.value, meta.scaleMax)}</strong>
            ${delta != null ? `<span class="ind-benchmark-inline-delta ${deltaClass}">${fmtDiff(delta, meta.scaleMax)}</span>` : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function compareNullable(a, b, dir = 'asc') {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'string' || typeof b === 'string') {
    const result = String(a).localeCompare(String(b), 'es', { sensitivity: 'base' });
    return dir === 'asc' ? result : -result;
  }
  const result = a === b ? 0 : a > b ? 1 : -1;
  return dir === 'asc' ? result : -result;
}

function sortRankingRows(rows, components, componentMatrix) {
  const key = state.rankingSortKey;
  const dir = state.rankingSortDir;
  const sorted = [...rows];

  sorted.sort((a, b) => {
    let result = 0;

    if (key === 'regionalRank') result = compareNullable(a.regionalRank, b.regionalRank, dir);
    else if (key === 'country') result = compareNullable(a.country, b.country, dir);
    else if (key === 'score') result = compareNullable(a.score, b.score, dir);
    else if (key === 'rankWorld') result = compareNullable(a.rankWorld, b.rankWorld, dir);
    else if (key === 'group') result = compareNullable(a.group || '', b.group || '', dir);
    else if (components.includes(key)) {
      result = compareNullable(componentMatrix.get(a.iso3)?.[key], componentMatrix.get(b.iso3)?.[key], dir);
    }

    if (result !== 0) return result;
    return compareNullable(a.regionalRank, b.regionalRank, 'asc');
  });

  return sorted;
}

function buildRankingInsightBanner(ranking, meta, benchmarks) {
  if (!ranking.length) return '';
  const leader = ranking[0];
  const trailer = ranking[ranking.length - 1];
  const gap = leader.score != null && trailer.score != null ? leader.score - trailer.score : null;
  const alc = benchmarks.alc;
  const ocde = benchmarks.ocde;

  const narrativeParts = [];
  if (leader.score != null && trailer.score != null) {
    narrativeParts.push(`<strong>${esc(leader.country)}</strong> lidera el ranking con <strong>${fmt(leader.score, meta.scaleMax)}</strong> puntos, mientras <strong>${esc(trailer.country)}</strong> se sitúa en la última posición con <strong>${fmt(trailer.score, meta.scaleMax)}</strong>.`);
    if (gap != null) narrativeParts.push(`La brecha regional entre el primer y el último puesto es de <strong>${fmt(gap, meta.scaleMax)}</strong> puntos.`);
  }
  if (alc != null && ocde != null) {
    const diff = ocde - alc;
    narrativeParts.push(`La media ALC (<strong>${fmt(alc, meta.scaleMax)}</strong>) se sitúa ${fmt(Math.abs(diff), meta.scaleMax)} puntos ${diff > 0 ? 'por debajo' : 'por encima'} de la media OCDE (<strong>${fmt(ocde, meta.scaleMax)}</strong>).`);
  }

  const kpis = [];
  if (leader.score != null) kpis.push({ label: 'Líder', flagIso: leader.iso3, name: leader.country, value: fmt(leader.score, meta.scaleMax) });
  if (trailer.score != null) kpis.push({ label: 'Rezagado', flagIso: trailer.iso3, name: trailer.country, value: fmt(trailer.score, meta.scaleMax) });
  if (alc != null) kpis.push({ label: 'Promedio ALC', value: fmt(alc, meta.scaleMax) });
  if (ocde != null) kpis.push({ label: 'Referencia OCDE', value: fmt(ocde, meta.scaleMax) });
  if (gap != null) kpis.push({ label: 'Brecha', value: fmt(gap, meta.scaleMax) });

  return `<div class="ind-insight-banner">
    <p class="ind-insight-narrative">${narrativeParts.join(' ')}</p>
    <div class="ind-insight-kpis">
      ${kpis.map((k) => `<div class="ind-insight-kpi">
        <span class="ind-insight-kpi-label">${esc(k.label)}</span>
        ${k.flagIso ? `<img class="ind-insight-kpi-flag" src="${flagUrl(k.flagIso)}" alt="" loading="lazy" />` : ''}
        <span class="ind-insight-kpi-value">${esc(k.value)}</span>
      </div>`).join('')}
    </div>
  </div>`;
}

function buildIndexChips(meta, edition, filteredRanking) {
  const numComponents = Object.keys(COMPONENT_META[meta.key] || {}).filter((k) => k !== 'General').length;
  const numWithData = filteredRanking.filter((r) => r.score != null).length;
  
  return `
    <div class="ind-banner-chips" style="margin-top: 0.5rem; margin-bottom: 0.5rem;">
      <span class="ind-banner-chip ind-banner-chip--accent">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
        ${esc(String(edition))}
      </span>
      <span class="ind-banner-chip">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
        Escala 0–${esc(String(meta.scaleMax))}
      </span>
      ${numComponents ? `<span class="ind-banner-chip">${numComponents} componentes</span>` : ''}
      <span class="ind-banner-chip">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/></svg>
        ${numWithData} países con dato
      </span>
      <span class="ind-banner-chip">${esc(meta.org)}</span>
    </div>
  `;
}



function buildRefLegend(benchmarks) {
  const items = [];
  if (benchmarks.alc != null) items.push({ cls: 'alc', label: `ALC ${benchmarks.alc}` });
  if (benchmarks.ocde != null) items.push({ cls: 'ocde', label: `OCDE — ref.` });
  if (benchmarks.world != null) items.push({ cls: 'world', label: `Mundial` });
  if (!items.length) return '';
  return `<div class="ind-ref-legend">
    ${items.map((i) => `<span class="ind-ref-legend-item">
      <span class="ind-ref-legend-mark ind-ref-legend-mark--${i.cls}"></span>
      ${esc(i.label)}
    </span>`).join('')}
  </div>`;
}

function getPerformanceTier(score, scaleMax) {
  if (score == null) return 'low';
  const pct = score / scaleMax;
  if (pct >= 0.75) return 'very-high';
  if (pct >= 0.5) return 'high';
  if (pct >= 0.25) return 'medium';
  return 'low';
}

function renderSidebarExportCard(index, edition) {
  const meta = INDEX_META[index];
  return `
    <article class="ind-export-card">
      <div class="ind-export-card-head">
        <span class="ind-card-kicker">Datos abiertos</span>
        <h3 class="ind-card-title">Exportar datos</h3>
        <p class="ind-card-copy">Descarga el índice actual o el repositorio completo integrado en Excel, CSV o JSON.</p>
      </div>
      <div class="ind-export-section">
        <div class="ind-export-section-label">Exportar datos mostrados</div>
        <p class="ind-export-section-copy">${esc(meta.shortName)} ${esc(String(edition))} con indicador general, subíndices y medias OCDE, ALC y Mundial.</p>
        <div class="ind-export-actions">
          <button type="button" class="ind-export-btn" data-export-scope="shown" data-export-kind="xlsx"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>Excel</button>
          <button type="button" class="ind-export-btn" data-export-scope="shown" data-export-kind="csv"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>CSV</button>
          <button type="button" class="ind-export-btn" data-export-scope="shown" data-export-kind="json"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>JSON</button>
        </div>
      </div>
      <div class="ind-export-section">
        <div class="ind-export-section-label">Exportar todos los datos</div>
        <p class="ind-export-section-copy">Todas las ediciones, todos los índices, indicador general, componentes y medias integradas en la plataforma.</p>
        <div class="ind-export-actions">
          <button type="button" class="ind-export-btn" data-export-scope="all" data-export-kind="xlsx"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>Excel</button>
          <button type="button" class="ind-export-btn" data-export-scope="all" data-export-kind="csv"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>CSV</button>
          <button type="button" class="ind-export-btn" data-export-scope="all" data-export-kind="json"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>JSON</button>
        </div>
      </div>
    </article>
  `;
}

function renderRankingView(container) {
  const index = state.index;
  const edition = state.edition;
  const meta = INDEX_META[index];
  const components = store.getComponents(index, edition);
  const componentShort = state.rankingMode === 'component' ? state.selectedComponent : 'General';
  const ranking = store.getRanking(index, edition, componentShort);
  const filteredRanking = ranking;
  const benchmarks = store.getBenchmarks(index, edition, componentShort);

  const summaryScore = filteredRanking[0]?.score ?? null;
  const benchmarkStrip = buildBenchmarkStrip(meta, benchmarks, summaryScore);

  let rankingStatusText = 'Mostrando ranking general';
  if (state.rankingMode === 'component') {
    rankingStatusText = `Mostrando ranking del componente: ${esc(getComponentLabel(index, state.selectedComponent))}`;
  }

  const componentOptions = components.map((item) => `<option value="${esc(item)}" ${item === state.selectedComponent ? 'selected' : ''}>${esc(getComponentLabel(index, item))}</option>`).join('');
  const methodologyDescription = store.getMethodologyAspect(index, 'Descripción');
  const sourceRows = store.getSources(index);
  const numComponents = Object.keys(COMPONENT_META[index] || {}).filter((k) => k !== 'General').length;
  const hasScale = meta.scaleMax;

  const infoCard = meta.infoCard;
  const infoCardHtml = infoCard ? `
    <article class="ind-context-card" style="--bar-color:${meta.color}">
      <h3 class="ind-context-title">${esc(infoCard.title)}</h3>
      ${infoCard.descriptions.map(desc => `<p class="ind-context-desc">${esc(desc)}</p>`).join('')}
      <div class="ind-context-meta">
        <div><strong>Fuente:</strong> ${esc(infoCard.source)}</div>
        <div><strong>Ediciones:</strong> ${esc(infoCard.editions)}</div>
        <div><strong>Categorías:</strong> ${esc(infoCard.categories)}</div>
        <div style="margin-top: 0.5rem;"><a href="${esc(infoCard.link)}" target="_blank" rel="noopener noreferrer" class="ind-context-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          Enlace oficial
        </a></div>
      </div>
    </article>
  ` : '';

  container.innerHTML = `
    <section class="ind-ranking-shell">

      <div class="ind-ranking-grid">
        <aside class="ind-ranking-sidebar">
          <article class="ind-map-panel">
            <div class="ind-map-svg" id="ind-map-svg-container"></div>
            <div class="ind-map-legend">
              <div class="ind-map-legend-gradient" style="--map-scale-start:${hexToRgba(meta.color, 0.08)}; --map-scale-end:${meta.color}"></div>
              <div class="ind-map-legend-labels">
                <span>${fmt(0, meta.scaleMax)}</span>
                <span>${fmt(meta.scaleMax / 2, meta.scaleMax)}</span>
                <span>${fmt(meta.scaleMax, meta.scaleMax)}</span>
              </div>
            </div>
          </article>
          ${renderSidebarExportCard(index, edition)}
          ${infoCardHtml}
        </aside>

        <div class="ind-ranking-main">
          <article class="ind-chart-card">
            <div class="ind-card-head">
              <div>
                <span class="ind-card-kicker">Ranking regional</span>
                <h3 class="ind-card-title">${esc(meta.name)} ${esc(String(edition))}</h3>
              </div>
              <div class="ind-controls">
                <div class="ind-control-toggle">
                  <button type="button" class="ind-toggle-btn ${state.rankingMode === 'global' ? 'active' : ''}" data-mode="global">General</button>
                  <button type="button" class="ind-toggle-btn ${state.rankingMode === 'component' ? 'active' : ''}" data-mode="component">Componentes</button>
                </div>
                ${components.length && state.rankingMode === 'component' ? `
                  <label class="ind-control-group">
                    <span>Componente</span>
                    <select id="chart-component-select" class="ind-control-select">${componentOptions}</select>
                  </label>` : ''}
              </div>
            </div>
            <div class="ind-ranking-status-text" style="color:var(--text-light);font-size:0.95rem;font-weight:500;margin-bottom:0.75rem;padding:0 1.3rem">
              ${rankingStatusText}
            </div>
            <div style="padding: 0 1.3rem;">
              ${buildIndexChips(meta, edition, filteredRanking)}
            </div>
            <div class="ind-ranking-list" id="ranking-list">${renderRankingRows(filteredRanking, meta, benchmarks)}</div>
          </article>

          <article class="ind-table-card" id="ranking-table-card">
            ${renderRankingTable(filteredRanking, components, meta, edition, benchmarks)}
          </article>
        </div>
      </div>
    </section>
  `;

  renderRankingHeatmap(filteredRanking, meta, edition, componentShort);
}

function renderRankingRows(ranking, meta, benchmarks) {
  if (!ranking.length) {
    return '<div class="ind-empty-state"><h3>No hay datos disponibles</h3><p>Prueba con otra edición o vuelve a la vista general.</p></div>';
  }

  const benchmarkMarks = [
    { key: 'alc', label: 'ALC', value: benchmarks.alc },
    { key: 'ocde', label: 'OCDE', value: benchmarks.ocde },
    { key: 'world', label: 'Mundial', value: benchmarks.world }
  ].filter((item) => item.value != null);

  const benchmarkBars = [
    { key: 'world', label: 'Mundial', value: benchmarks.world, color: 'rgba(93, 111, 136, 0.75)' },
    { key: 'ocde', label: 'OCDE', value: benchmarks.ocde, color: 'rgba(29, 157, 182, 0.85)' },
    { key: 'alc', label: 'ALC', value: benchmarks.alc, color: 'rgba(220, 138, 37, 0.9)' }
  ].filter((item) => item.value != null).sort((a, b) => b.value - a.value);

  const withData = ranking.filter(r => !r.isMissing);
  const withoutData = ranking.filter(r => r.isMissing);

  let prevTier = null;
  const rowsHtml = [];
  const pendingBenchmarks = [...benchmarkBars];
  const renderBenchmarkRow = (item) => {
    const width = clamp((item.value / meta.scaleMax) * 100, 0, 100);
    return `
      <article class="ind-ranking-row ind-ranking-row--benchmark" aria-label="${esc(item.label)} · ${fmt(item.value, meta.scaleMax)} puntos">
        <div class="ind-ranking-country ind-ranking-country--benchmark">
          <span class="ind-ranking-pos ind-ranking-pos--reference" aria-hidden="true">—</span>
          <span class="ind-ranking-reference-swatch ind-ranking-reference-swatch--${item.key}" style="--reference-color:${item.color}"></span>
          <div>
            <h4>${esc(item.label)}</h4>
            <p>Media de referencia</p>
          </div>
        </div>
        <div class="ind-ranking-rail">
          <div class="ind-ranking-track-row">
            <div class="ind-ranking-track">
              <div class="ind-ranking-fill ind-ranking-fill--benchmark" style="width:${width}%; --fill-color:${item.color}"></div>
            </div>
            <div class="ind-ranking-score-wrap ind-ranking-score-wrap--benchmark">
              <span class="ind-ranking-score">${fmt(item.value, meta.scaleMax)}</span>
            </div>
          </div>
        </div>
      </article>
    `;
  };
  const flushBenchmarksAbove = (score) => {
    while (pendingBenchmarks.length && pendingBenchmarks[0].value > score) {
      rowsHtml.push(renderBenchmarkRow(pendingBenchmarks.shift()));
    }
  };

  withData.forEach((row) => {
    const width = row.score == null ? 0 : clamp((row.score / meta.scaleMax) * 100, 0, 100);
    const tier = getPerformanceTier(row.score, meta.scaleMax);
    const marks = benchmarkMarks.map((mark) => {
      const position = clamp((mark.value / meta.scaleMax) * 100, 0, 100);
      return `<span class="ind-ranking-mark ind-ranking-mark--${mark.key}" style="left:${position}%" title="${esc(mark.label)}: ${fmt(mark.value, meta.scaleMax)}"></span>`;
    }).join('');

    flushBenchmarksAbove(row.score);

    if (tier !== prevTier) {
      const tierLabels = { 'very-high': 'Desempeño muy alto', 'high': 'Desempeño alto', 'medium': 'Desempeño medio', 'low': 'Desempeño bajo' };
      if (tierLabels[tier]) {
        rowsHtml.push(`<div class="ind-tier-separator ind-tier-separator--${tier}">
          <span class="ind-tier-separator-line"></span>
          <span class="ind-tier-separator-label">${tierLabels[tier]}</span>
          <span class="ind-tier-separator-line"></span>
        </div>`);
      }
      prevTier = tier;
    }

    rowsHtml.push(`
      <article class="ind-ranking-row" data-open-drawer="${esc(row.iso3)}" data-tier="${tier}" tabindex="0" role="button" aria-label="${esc(row.country)} · ${fmt(row.score, meta.scaleMax)} puntos">
        <div class="ind-ranking-country">
          <span class="${getRankCircleClass(row.regionalRank, 'ind-ranking-pos')}">${row.regionalRank}</span>
          <img class="ind-ranking-flag" src="${flagUrl(row.iso3)}" alt="${esc(row.country)}" loading="lazy" />
          <div>
            <h4>${esc(row.country)}</h4>
            ${row.rankWorld ? `
              <div class="ind-ranking-world-meta">
                <span class="${getRankCircleClass(row.rankWorld, 'ind-ranking-pos ind-ranking-pos--world')}">${row.rankWorld}</span>
                <span class="ind-ranking-world-label">Mundial</span>
              </div>
            ` : ''}
          </div>
        </div>
        <div class="ind-ranking-rail">
          <div class="ind-ranking-track-row">
            <div class="ind-ranking-track">
              <div class="ind-ranking-fill" style="width:${width}%; --fill-color:${meta.color}"></div>
              <div class="ind-ranking-marks">${marks}</div>
            </div>
            <div class="ind-ranking-score-wrap">
              <span class="ind-ranking-score">${fmt(row.score, meta.scaleMax)}</span>
              ${row.group ? getGroupBadge(row.group) : ''}
            </div>
          </div>
        </div>
      </article>
    `);
  });

  while (pendingBenchmarks.length) {
    rowsHtml.push(renderBenchmarkRow(pendingBenchmarks.shift()));
  }

  if (withoutData.length > 0) {
    rowsHtml.push(`<div class="ind-tier-separator ind-tier-separator--missing">
      <span class="ind-tier-separator-line"></span>
      <span class="ind-tier-separator-label" style="color:var(--text-light)">Países sin datos en esta edición</span>
      <span class="ind-tier-separator-line"></span>
    </div>`);

    withoutData.sort((a,b) => a.country.localeCompare(b.country, 'es')).forEach((row) => {
      rowsHtml.push(`
        <article class="ind-ranking-row ind-ranking-row--missing" data-open-drawer="${esc(row.iso3)}" tabindex="0" role="button" aria-label="${esc(row.country)} · Sin datos">
          <div class="ind-ranking-country">
            <span class="ind-ranking-pos">—</span>
            <img class="ind-ranking-flag" src="${flagUrl(row.iso3)}" alt="${esc(row.country)}" loading="lazy" />
            <div>
              <h4 style="color:var(--text-light)">${esc(row.country)}</h4>
            </div>
          </div>
          <div class="ind-ranking-rail">
            <div class="ind-ranking-track-row" style="color:var(--text-light);font-size:0.875rem;font-style:italic">
            </div>
          </div>
        </article>
      `);
    });
  }

  return rowsHtml.join('');
}

function renderRankingTable(ranking, components, meta, edition, benchmarks) {
  const showComponents = state.showRankingComponents && components.length;
  const componentMatrix = new Map();

  if (showComponents) {
    components.forEach((component) => {
      store.getRanking(state.index, edition, component).forEach((entry) => {
        if (!componentMatrix.has(entry.iso3)) componentMatrix.set(entry.iso3, {});
        componentMatrix.get(entry.iso3)[component] = entry.score;
      });
    });
  }

  const sortedRanking = sortRankingRows(ranking, components, componentMatrix);
  const sortClass = (key) => state.rankingSortKey === key ? `sorted-${state.rankingSortDir}` : '';
  const hasWorldRank = sortedRanking.some((row) => !row.isMissing && row.rankWorld != null);
  const hasGroup = sortedRanking.some((row) => !row.isMissing && row.group);
  const sortableHeader = (label, key, tooltip) => `
    <th class="ind-sortable ${sortClass(key)}" scope="col" data-sort-key="${esc(key)}" title="${esc(tooltip || label)}" aria-label="${esc(tooltip || label)}">
      <span class="ind-table-head-main">${label}</span>
    </th>
  `;
  const headerCells = [
    sortableHeader('Pos. regional', 'regionalRank', TERM_HELP.posicionRegional),
    sortableHeader('País', 'country', 'País evaluado dentro de la muestra regional.'),
    sortableHeader('Puntuación', 'score', TERM_HELP.puntuacion)
  ];
  if (hasWorldRank) headerCells.push(sortableHeader('Ranking mundial', 'rankWorld', TERM_HELP.rankingMundial));
  if (showComponents) {
    components.forEach((component) => headerCells.push(sortableHeader(
      esc(component),
      component,
      `${getComponentLabel(state.index, component)}. Componente del índice ${meta.shortName}.`
    )));
  }
  if (benchmarks?.alc != null) headerCells.push(sortableHeader('Δ vs ALC', 'deltaAlc', 'Diferencia entre la puntuación del país y la media de ALC.'));
  if (benchmarks?.ocde != null) headerCells.push(sortableHeader('Δ vs OCDE', 'deltaOcde', 'Diferencia entre la puntuación del país y la media OCDE.'));
  if (hasGroup) headerCells.push(sortableHeader('Grupo', 'group', TERM_HELP.grupo));

  const withData = sortedRanking.filter(r => !r.isMissing);
  const withoutData = sortedRanking.filter(r => r.isMissing);

  const body = withData.map((row) => {
    const componentCells = showComponents
      ? components.map((component) => renderTableCell(
        getComponentLabel(state.index, component),
        `<span class="ind-component-cell-value">${fmt(componentMatrix.get(row.iso3)?.[component], meta.scaleMax)}</span>`,
        'ind-table-cell--component'
      )).join('')
      : '';
    let deltaAlcCell = '', deltaOcdeCell = '';
    if (benchmarks?.alc != null) {
      const d = row.score != null ? row.score - benchmarks.alc : null;
      deltaAlcCell = renderDeltaCell('Δ vs ALC', d, meta.scaleMax);
    }
    if (benchmarks?.ocde != null) {
      const d = row.score != null ? row.score - benchmarks.ocde : null;
      deltaOcdeCell = renderDeltaCell('Δ vs OCDE', d, meta.scaleMax);
    }
    const tier = getPerformanceTier(row.score, meta.scaleMax);
    return `
      <tr class="ind-table-row" data-open-drawer="${esc(row.iso3)}" data-tier="${tier}" tabindex="0" role="button" aria-label="Abrir detalle de ${esc(row.country)}">
        ${renderTableCell('Pos. regional', `<span class="${getRankCircleClass(row.regionalRank, 'ind-rank-pill')}">${row.regionalRank}</span>`, 'ind-table-cell--rank')}
        ${renderTableCell('País', `
          <div class="ind-table-country">
            <img src="${flagUrl(row.iso3)}" alt="" loading="lazy" />
            <div class="ind-table-country-copy">
              <span class="ind-table-country-name">${esc(row.country)}</span>
            </div>
          </div>
        `, 'ind-table-cell--country')}
        ${renderTableCell('Puntuación', `
          <div class="ind-metric-cell">
            <strong class="ind-metric-value">${fmt(row.score, meta.scaleMax)}</strong>
          </div>
        `, 'ind-table-cell--metric')}
        ${hasWorldRank ? renderTableCell('Ranking mundial', row.rankWorld != null
          ? `<span class="${getRankCircleClass(row.rankWorld, 'ind-world-rank-chip')}">${row.rankWorld}</span>`
          : '<span class="ind-world-rank-chip ind-world-rank-chip--empty">—</span>',
        'ind-table-cell--world-rank') : ''}
        ${componentCells}
        ${deltaAlcCell}${deltaOcdeCell}
        ${hasGroup ? renderTableCell('Grupo', row.group ? getGroupBadge(row.group) : '', 'ind-table-cell--group') : ''}
      </tr>
    `;
  }).join('');

  let missingBody = '';
  if (withoutData.length > 0) {
    const colspan = headerCells.length;
    missingBody = `
      <tr class="ind-table-row--missing-sep">
        <td colspan="${colspan}">
          <div class="ind-table-missing-banner">Países sin datos en esta edición</div>
        </td>
      </tr>
      ${withoutData.sort((a,b) => a.country.localeCompare(b.country, 'es')).map((row) => `
        <tr data-open-drawer="${esc(row.iso3)}" class="ind-table-row ind-table-row--missing" tabindex="0" role="button" aria-label="Abrir detalle de ${esc(row.country)}">
          ${renderTableCell('Pos. regional', '<span class="ind-rank-pill ind-rank-pill--missing">—</span>', 'ind-table-cell--rank')}
          ${renderTableCell('País', `
            <div class="ind-table-country">
              <img src="${flagUrl(row.iso3)}" alt="" loading="lazy" />
              <div class="ind-table-country-copy">
                <span class="ind-table-country-name">${esc(row.country)}</span>
              </div>
            </div>
          `, 'ind-table-cell--country')}
          <td colspan="${colspan - 2}" data-label="Estado">
            <span class="ind-table-missing-copy">Sin dato disponible para esta edición.</span>
          </td>
        </tr>
      `).join('')}
    `;
  }


  return `
    <div class="ind-card-head ind-table-card-head">
      <div class="ind-table-copy">
        <span class="ind-card-kicker">Tabla de datos</span>
        <h3 class="ind-card-title">Detalle completo por país</h3>
        <p class="ind-card-copy">Ordenable por cualquier columna. Incluye diferencias frente a referencias ALC y OCDE.</p>
      </div>
      <div class="ind-table-head-actions">
        ${components.length ? `<button type="button" class="ind-chip-toggle ${state.showRankingComponents ? 'active' : ''}" id="ranking-components-toggle">Ver componentes</button>` : ''}
      </div>
    </div>
    <div class="ind-table-toolbar">
      <div class="ind-table-toolbar-main">
        ${buildIndexChips(meta, edition, ranking)}
      </div>
    </div>
    <div class="ind-table-wrap">
      <table class="ind-table" id="ranking-data-table">
        <caption class="ind-sr-only">Detalle completo por país para ${esc(meta.shortName)} ${esc(String(edition))}</caption>
        <thead><tr>${headerCells.join('')}</tr></thead>
        <tbody id="ranking-data-tbody">${body}${missingBody}</tbody>
      </table>
    </div>
  `;
}

function renderRankingHeatmap(ranking, meta, edition, componentShort) {
  const container = $('#ind-map-svg-container');
  if (!container || !window.d3 || !window.topojson) return;

  if (worldAtlas) {
    drawRankingHeatmap(container, worldAtlas, ranking, meta, edition, componentShort);
    return;
  }

  d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json')
    .then((world) => {
      worldAtlas = world;
      drawRankingHeatmap(container, world, ranking, meta, edition, componentShort);
    })
    .catch(() => {
      container.innerHTML = '<div class="ind-map-fallback">No se pudo cargar el mapa.</div>';
    });
}

function drawRankingHeatmap(container, world, ranking, meta, edition, componentShort) {
  const d3 = window.d3;
  const topojson = window.topojson;
  container.innerHTML = '';

  const width = container.getBoundingClientRect().width || 360;
  const height = Math.max(360, Math.round(width * 0.82));
  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  const countries = topojson.feature(world, world.objects.countries).features;
  const regionFeatures = countries.filter((feature) => numericToIso[Number(feature.id)]);
  const projection = d3.geoMercator();
  projection.fitExtent([[10, 10], [width - 10, height - 10]], { type: 'FeatureCollection', features: regionFeatures });
  const path = d3.geoPath().projection(projection);

  const values = ranking.filter((entry) => entry.score != null).map((entry) => entry.score);
  const minScore = values.length ? Math.min(...values) : 0;
  const maxScore = values.length ? Math.max(...values) : meta.scaleMax;
  const scale = d3.scaleLinear()
    .domain([minScore, maxScore])
    .range([hexToRgba(meta.color, 0.08), meta.color]);
  const scoreMap = Object.fromEntries(ranking.map((entry) => [entry.iso3, entry]));

  let tooltip = $('.ind-map-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.className = 'ind-map-tooltip';
    document.body.appendChild(tooltip);
  }

  svg.selectAll('path')
    .data(regionFeatures)
    .join('path')
    .attr('class', 'ind-map-country')
    .attr('d', path)
    .attr('fill', (feature) => {
      const iso3 = numericToIso[Number(feature.id)];
      const row = scoreMap[iso3];
      return row && row.score != null ? scale(row.score) : '#e5ebf2';
    })
    .on('mouseenter', (event, feature) => {
      const iso3 = numericToIso[Number(feature.id)];
      const row = scoreMap[iso3];
      if (!row || row.score == null) return;
      tooltip.innerHTML = `
        <strong>${esc(row.country)}</strong>
        <span>${esc(getComponentLabel(meta.key, componentShort))} · ${esc(edition)}</span>
        <span>Puntuación ${fmt(row.score, meta.scaleMax)}</span>
      `;
      tooltip.style.opacity = '1';
      tooltip.style.left = `${event.pageX + 16}px`;
      tooltip.style.top = `${event.pageY - 14}px`;
    })
    .on('mouseleave', () => {
      tooltip.style.opacity = '0';
    })
    .on('click', (_, feature) => {
      const iso3 = numericToIso[Number(feature.id)];
      const row = scoreMap[iso3];
      if (row) openDrawer(iso3);
    });
}

function renderCompareView(container) {
  const year = state.compareYear;
  const selections = state.compareCountries;
  const countryCount = selections.filter((k) => !isAggregate(k)).length;
  const aggregateCount = selections.filter((k) => isAggregate(k)).length;

  container.innerHTML = `
    <section class="ind-compare-shell">
      ${renderCompareHero()}
      ${renderCompareTimeline(year)}
      ${renderCompareCountryPicker()}
      ${renderCompareSelectedTags()}
      <div class="cmp-charts-stack">
        <article class="ind-compare-controls-card">
          <div class="ind-card-head">
            <div>
              <span class="ind-card-kicker">Perfil comparado</span>
              <h3 class="ind-card-title">Radar de índices internacionales</h3>
              <p class="ind-card-copy">Todos los índices normalizados a escala 0-1 para una comparación visual directa. Datos de la última edición disponible${year < new Date().getFullYear() ? ` hasta ${year}` : ''}.</p>
            </div>
          </div>
          <div class="cmp-radar-canvas-wrap"><canvas id="compare-radar-chart"></canvas></div>
        </article>

        <article class="ind-compare-controls-card">
          <div class="ind-card-head">
            <div>
              <span class="ind-card-kicker">Comparación directa</span>
              <h3 class="ind-card-title">Puntuaciones normalizadas por índice</h3>
              <p class="ind-card-copy">Barras en escala 0-1 para comparar de un vistazo qué selección lidera en cada índice.</p>
            </div>
          </div>
          <div class="cmp-bars-canvas-wrap"><canvas id="compare-bars-chart"></canvas></div>
        </article>

        <article class="ind-compare-controls-card">
          <div class="ind-card-head">
            <div>
              <span class="ind-card-kicker">Detalle numérico</span>
              <h3 class="ind-card-title">Panorama transversal</h3>
              <p class="ind-card-copy">Puntuaciones originales por índice para el año seleccionado.</p>
            </div>
            ${renderCompareCrossExport()}
          </div>
          ${renderCompareCrossTable(year)}
        </article>
      </div>
    </section>
  `;

  renderCompareRadarChart(year);
  renderCompareBarsChart(year);
  initCompareCountryGrid();
}

function renderCompareHero() {
  return `
    <article class="cmp-hero-card">
      <div class="cmp-hero-content">
        <span class="ind-card-kicker">Laboratorio comparativo</span>
        <h2 class="ind-card-title">Comparar países a través de todos los índices</h2>
        <p class="ind-card-copy">Selecciona países o medias de referencia y compara su posición en los ${store.indicesSorted.length} índices internacionales. El radar normaliza todas las escalas para una lectura visual directa.</p>
      </div>
      <div class="cmp-hero-stats">
        <div class="cmp-hero-stat"><span class="cmp-hero-stat-num">${store.indicesSorted.length}</span><span class="cmp-hero-stat-label">Índices</span></div>
        <div class="cmp-hero-stat"><span class="cmp-hero-stat-num">${BID_COUNTRIES.length}</span><span class="cmp-hero-stat-label">Países ALC</span></div>
        <div class="cmp-hero-stat"><span class="cmp-hero-stat-num">${state.compareCountries.length}</span><span class="cmp-hero-stat-label">Seleccionados</span></div>
      </div>
    </article>
  `;
}

function renderCompareTimeline(activeYear) {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = 2021; y <= currentYear; y++) years.push(y);

  const yearDots = years.map((y) => {
    const hasData = store.indicesSorted.some((idx) => {
      const ed = getEditionForYear(idx, y);
      return ed != null;
    });
    const isActive = y === activeYear;
    return `<button type="button" class="cmp-timeline-dot ${isActive ? 'is-active' : ''} ${hasData ? 'has-data' : ''}" data-compare-year="${y}">
      <span class="cmp-timeline-dot-circle"></span>
      <span class="cmp-timeline-dot-year">${y}</span>
    </button>`;
  }).join('');

  return `
    <div class="cmp-timeline">
      <span class="cmp-timeline-label">Año de referencia</span>
      <div class="cmp-timeline-track">
        <div class="cmp-timeline-line"></div>
        ${yearDots}
      </div>
    </div>
  `;
}

function renderCompareSelectedTags() {
  if (!state.compareCountries.length) return '<div class="cmp-selected-bar"><span style="color:var(--ind-text-4);font-style:italic;font-size:.82rem">Ninguna selección. Elige países o medias de referencia para comparar.</span></div>';
  const tags = state.compareCountries.map((key, idx) => {
    const agg = AGGREGATE_META[key];
    const color = COUNTRY_COLORS[idx % COUNTRY_COLORS.length];
    if (agg) {
      return `<span class="ind-compare-tag" style="--tag-color:${agg.color}">
        <span class="cmp-agg-icon">${agg.icon}</span>
        <span>${esc(agg.label)}</span>
        <button type="button" class="ind-compare-tag-remove" data-remove-compare="${esc(key)}" aria-label="Quitar ${esc(agg.label)}">&times;</button>
      </span>`;
    }
    const name = store.isoToName[key] || key;
    return `<span class="ind-compare-tag" style="--tag-color:${color}">
      <img src="${flagUrl(key)}" alt="" loading="lazy" />
      <span>${esc(name)}</span>
      <button type="button" class="ind-compare-tag-remove" data-remove-compare="${esc(key)}" aria-label="Quitar ${esc(name)}">&times;</button>
    </span>`;
  }).join('');

  return `<div class="cmp-selected-bar">${tags}</div>`;
}

function renderCompareCountryPicker() {
  // Aggregate buttons
  const aggButtons = AGGREGATE_KEYS.map((key) => {
    const meta = AGGREGATE_META[key];
    const selected = state.compareCountries.includes(key);
    return `<button type="button" class="cmp-agg-btn ${selected ? 'is-selected' : ''}" data-toggle-compare="${key}">
      <span class="cmp-agg-icon">${meta.icon}</span>
      <span>${esc(meta.label)}</span>
    </button>`;
  }).join('');

  // Subregion toggle buttons
  const subregionButtons = SUBREGIONS.map((sr) => {
    const regionCountries = BID_COUNTRIES.filter((bc) => bc.subregion === sr.label);
    const allSelected = regionCountries.every((bc) => state.compareCountries.includes(bc.iso3));
    return `<button type="button" class="cmp-agg-btn cmp-subregion-btn ${allSelected ? 'is-selected' : ''}" data-toggle-subregion="${sr.key}">
      <span class="cmp-agg-icon">${sr.icon}</span>
      <span>${esc(sr.label)}</span>
    </button>`;
  }).join('');

  // Country grid grouped by subregion
  const groupedHtml = SUBREGIONS.map((sr) => {
    const regionCountries = BID_COUNTRIES.filter((bc) => bc.subregion === sr.label);
    const chips = regionCountries.map((bc) => {
      const selected = state.compareCountries.includes(bc.iso3);
      return `<button type="button" class="cmp-country-chip ${selected ? 'is-selected' : ''}" data-toggle-compare="${esc(bc.iso3)}">
        <img src="${flagUrl(bc.iso3)}" alt="" loading="lazy" />
        <span>${esc(bc.name)}</span>
      </button>`;
    }).join('');
    return `
      <div class="cmp-subregion-group">
        <h4 class="cmp-subregion-title">${sr.icon} ${esc(sr.label)}</h4>
        <div class="cmp-subregion-chips">${chips}</div>
      </div>`;
  }).join('');

  // Clear button (only show if there are selections)
  const clearBtn = state.compareCountries.length > 0
    ? `<button type="button" class="cmp-clear-btn" data-clear-compare>🗑 Limpiar selección</button>`
    : '';

  return `
    <article class="cmp-picker-card">
      <div class="cmp-picker-header">
        <div>
          <span class="ind-card-kicker">Seleccionar países</span>
          <p class="cmp-picker-hint">Haz clic para añadir o quitar. Máximo ${MAX_COMPARE} selecciones (${state.compareCountries.length}/${MAX_COMPARE}).</p>
        </div>
        ${clearBtn}
      </div>
      <div class="cmp-agg-row">${aggButtons}</div>
      <div class="cmp-agg-row">${subregionButtons}</div>
      <div class="cmp-country-grid" id="cmp-country-grid">${groupedHtml}</div>
    </article>
  `;
}

function initCompareCountryGrid() {
  // No search to init; interactions handled via event delegation
}

function getCompareEntryName(key) {
  if (AGGREGATE_META[key]) return AGGREGATE_META[key].label;
  return store.isoToName[key] || key;
}

function getCompareScore(key, index, year) {
  const edition = getEditionForYear(index, year);
  if (!edition) return null;
  if (isAggregate(key)) {
    const benchmarks = store.getBenchmarks(index, edition);
    if (key === 'WRL') return benchmarks.world;
    if (key === 'ALC') return benchmarks.alc;
    if (key === 'OCD') return benchmarks.ocde;
    return null;
  }
  const entry = store.getCountryIndexRow(key, index, edition);
  return entry?.score ?? null;
}

function renderCompareRadarChart(year) {
  const canvas = $('#compare-radar-chart');
  if (!canvas || !window.Chart) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (compareRadarChart) {
    compareRadarChart.destroy();
    compareRadarChart = null;
  }

  const labels = store.indicesSorted.map((idx) => INDEX_META[idx].shortName);
  const fullLabels = store.indicesSorted.map((idx) => {
    const ed = getEditionForYear(idx, year);
    return `${INDEX_META[idx].shortName} (${ed || '—'})`;
  });

  const datasets = state.compareCountries.map((key, i) => {
    const color = isAggregate(key) ? AGGREGATE_META[key].color : COUNTRY_COLORS[i % COUNTRY_COLORS.length];
    const data = store.indicesSorted.map((idx) => {
      const meta = INDEX_META[idx];
      const score = getCompareScore(key, idx, year);
      return normalizeScore(score, meta.scaleMax);
    });
    return {
      label: getCompareEntryName(key),
      data,
      borderColor: color,
      backgroundColor: hexToRgba(color, 0.12),
      borderWidth: 2.5,
      pointRadius: 4,
      pointHoverRadius: 7,
      pointBackgroundColor: color,
      pointBorderColor: '#fff',
      pointBorderWidth: 2
    };
  });

  compareRadarChart = new Chart(ctx, {
    type: 'radar',
    data: { labels: fullLabels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          min: 0,
          max: 1,
          beginAtZero: true,
          ticks: {
            stepSize: 0.25,
            callback: (v) => v.toFixed(2),
            color: '#8a9fb4',
            backdropColor: 'transparent',
            font: { size: 10, weight: '600', family: 'Inter, sans-serif' }
          },
          pointLabels: {
            font: { size: 12, weight: '800', family: 'Inter, sans-serif' },
            color: '#1a2b3c',
            padding: 14
          },
          grid: {
            color: 'rgba(18, 42, 64, 0.08)',
            lineWidth: 1
          },
          angleLines: {
            color: 'rgba(18, 42, 64, 0.06)'
          }
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            boxWidth: 8,
            padding: 18,
            font: { family: 'Inter, sans-serif', weight: '700', size: 12 }
          }
        },
        tooltip: {
          callbacks: {
            title(items) {
              if (!items.length) return '';
              return fullLabels[items[0].dataIndex] || labels[items[0].dataIndex];
            },
            label(context) {
              const key = state.compareCountries[context.datasetIndex];
              const indexKey = store.indicesSorted[context.dataIndex];
              const meta = INDEX_META[indexKey];
              const rawScore = getCompareScore(key, indexKey, year);
              const normalized = context.parsed.r;
              return `${context.dataset.label}: ${rawScore != null ? fmt(rawScore, meta.scaleMax) : '—'} (${normalized != null ? normalized.toFixed(2) : '—'})`;
            }
          }
        }
      }
    }
  });
}

function renderCompareBarsChart(year) {
  const canvas = $('#compare-bars-chart');
  if (!canvas || !window.Chart) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (compareBarsChart) {
    compareBarsChart.destroy();
    compareBarsChart = null;
  }

  const indexLabels = store.indicesSorted.map((idx) => {
    const ed = getEditionForYear(idx, year);
    return `${INDEX_META[idx].shortName}${ed ? ' ' + ed : ''}`;
  });

  const datasets = state.compareCountries.map((key, i) => {
    const color = isAggregate(key) ? AGGREGATE_META[key].color : COUNTRY_COLORS[i % COUNTRY_COLORS.length];
    const data = store.indicesSorted.map((idx) => {
      const meta = INDEX_META[idx];
      const score = getCompareScore(key, idx, year);
      return normalizeScore(score, meta.scaleMax);
    });
    return {
      label: getCompareEntryName(key),
      data,
      backgroundColor: hexToRgba(color, 0.78),
      borderColor: color,
      borderWidth: 1.5,
      borderRadius: 5,
      borderSkipped: false
    };
  });

  // Dynamic height: enough rows for each index × selections
  const numIndices = store.indicesSorted.length;
  const numSelections = state.compareCountries.length;
  const barThickness = 18;
  const groupGap = 14;
  const totalHeight = numIndices * (numSelections * barThickness + groupGap) + 60;
  canvas.parentElement.style.height = totalHeight + 'px';

  compareBarsChart = new Chart(ctx, {
    type: 'bar',
    data: { labels: indexLabels, datasets },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      barThickness,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            boxWidth: 8,
            padding: 18,
            font: { family: 'Inter, sans-serif', weight: '700', size: 12 }
          }
        },
        tooltip: {
          callbacks: {
            label(context) {
              const key = state.compareCountries[context.datasetIndex];
              const indexKey = store.indicesSorted[context.dataIndex];
              const meta = INDEX_META[indexKey];
              const rawScore = getCompareScore(key, indexKey, year);
              const normalized = context.parsed.x;
              return `${context.dataset.label}: ${rawScore != null ? fmt(rawScore, meta.scaleMax) : '—'} (${normalized != null ? normalized.toFixed(2) : '—'})`;
            }
          }
        }
      },
      scales: {
        x: {
          min: 0,
          max: 1,
          ticks: {
            stepSize: 0.25,
            callback: (v) => v.toFixed(2),
            color: '#8a9fb4',
            font: { family: 'Inter, sans-serif', size: 11, weight: '600' }
          },
          grid: { color: 'rgba(18,42,64,0.07)' }
        },
        y: {
          ticks: {
            color: '#1a2b3c',
            font: { family: 'Inter, sans-serif', size: 12, weight: '700' }
          },
          grid: { display: false }
        }
      }
    }
  });
}

function renderCompareCrossTable(year) {
  const selections = state.compareCountries;
  const header = selections.map((key, i) => {
    const name = getCompareEntryName(key);
    const agg = AGGREGATE_META[key];
    return `<th>${agg ? agg.icon + ' ' : ''}${esc(name)}</th>`;
  }).join('');

  const rows = store.indicesSorted.map((index) => {
    const meta = INDEX_META[index];
    const edition = getEditionForYear(index, year);
    const cells = selections.map((key) => {
      const score = getCompareScore(key, index, year);
      if (score == null) return '<td class="cmp-cell-empty">—</td>';
      return `<td><strong>${fmt(score, meta.scaleMax)}</strong></td>`;
    }).join('');
    return `<tr>
      <th style="border-left: 3px solid ${meta.color}">${esc(meta.shortName)}<small>${edition || '—'}</small></th>
      ${cells}
    </tr>`;
  }).join('');

  return `
    <div class="ind-table-wrap">
      <table class="ind-crossindex-table cmp-cross-table">
        <thead><tr><th>Índice</th>${header}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderCompareCrossExport() {
  return `
    <div class="ind-export-wrap ind-compare-cross-export" id="compare-cross-export-wrap">
      <button type="button" class="ind-toolbar-btn" id="compare-cross-export-toggle" aria-haspopup="true" aria-expanded="false" title="Exportar datos mostrados">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Exportar
      </button>
      <div class="ind-export-dropdown hidden" id="compare-cross-export-dropdown">
        <div class="ind-export-section">
          <div class="ind-export-section-label">Datos mostrados</div>
          <div class="ind-export-actions">
            <button type="button" class="ind-export-btn" data-export-scope="compare-cross" data-export-kind="xlsx">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Excel
            </button>
            <button type="button" class="ind-export-btn" data-export-scope="compare-cross" data-export-kind="csv">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              CSV
            </button>
            <button type="button" class="ind-export-btn" data-export-scope="compare-cross" data-export-kind="json">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}


function buildCompareTag(iso3, index) {
  const agg = AGGREGATE_META[iso3];
  const color = agg ? agg.color : COUNTRY_COLORS[index % COUNTRY_COLORS.length];
  const name = agg ? agg.label : (store.isoToName[iso3] || iso3);
  return `
    <span class="ind-compare-tag" style="--tag-color:${color}">
      ${agg ? `<span class="cmp-agg-icon">${agg.icon}</span>` : `<img src="${flagUrl(iso3)}" alt="" loading="lazy" />`}
      <span>${esc(name)}</span>
      <button type="button" class="ind-compare-tag-remove" data-remove-compare="${esc(iso3)}" aria-label="Quitar ${esc(name)}">&times;</button>
    </span>
  `;
}

function renderCompareEmptyState(index, edition) {
  const topPicks = store.getRanking(index, edition).slice(0, 5);
  return `
    <div class="ind-empty-state ind-empty-state--compare">
      <h3>Empieza añadiendo al menos dos países</h3>
      <p>La comparativa está pensada para jugar con los datos. Selecciona países en la grid superior.</p>
      <div class="ind-quick-picks">
        ${topPicks.map((entry) => `<button type="button" class="ind-quick-country" data-add-compare="${esc(entry.iso3)}">${esc(entry.country)}</button>`).join('')}
      </div>
    </div>
  `;
}

function renderCrossIndexSnapshot(selectedEntries) {
  const header = selectedEntries.map((item) => `<th>${esc(item.name)}</th>`).join('');
  const rows = store.indicesSorted.map((index) => {
    const meta = INDEX_META[index];
    const edition = store.getLatestEdition(index);
    const cells = selectedEntries.map((item) => {
      const entry = store.getCountryIndexRow(item.iso3, index, edition);
      if (!entry || entry.score == null) return '<td>—</td>';
      return `<td><strong>${fmt(entry.score, meta.scaleMax)}</strong><span>#${entry.regionalRank} ALC</span></td>`;
    }).join('');
    return `
      <tr>
        <th>${esc(meta.shortName)}<small>${edition}</small></th>
        ${cells}
      </tr>
    `;
  }).join('');

  return `
    <div class="ind-table-wrap">
      <table class="ind-crossindex-table">
        <thead><tr><th>Índice</th>${header}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderCompareTrendChart(index, meta, selectedEntries) {
  const canvas = $('#compare-trend-chart');
  if (!canvas || !window.Chart) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (compareTrendChart) {
    compareTrendChart.destroy();
    compareTrendChart = null;
  }

  const datasets = selectedEntries
    .map((item, idx) => {
      const series = store.getTimeSeries(item.iso3, index);
      if (!series.length) return null;
      return {
        label: item.name,
        data: series.map((point) => ({ x: point.year, y: point.score })),
        borderColor: COUNTRY_COLORS[idx % COUNTRY_COLORS.length],
        backgroundColor: hexToRgba(COUNTRY_COLORS[idx % COUNTRY_COLORS.length], 0.2),
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2.5,
        tension: 0.28
      };
    })
    .filter(Boolean);

  compareTrendChart = new Chart(ctx, {
    type: 'line',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      parsing: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            boxWidth: 8,
            padding: 18,
            font: { family: 'Inter, sans-serif', weight: '700' }
          }
        },
        tooltip: {
          callbacks: {
            label(context) {
              return `${context.dataset.label}: ${fmt(context.parsed.y, meta.scaleMax)}`;
            }
          }
        }
      },
      scales: {
        x: {
          type: 'linear',
          ticks: {
            precision: 0,
            color: '#61758d'
          },
          grid: {
            color: 'rgba(18, 42, 64, 0.08)'
          }
        },
        y: {
          min: 0,
          max: meta.scaleMax,
          ticks: {
            callback(value) {
              return fmt(Number(value), meta.scaleMax);
            },
            color: '#61758d'
          },
          grid: {
            color: 'rgba(18, 42, 64, 0.08)'
          }
        }
      }
    }
  });
}

function initCompareInput() {
  // Legacy – no longer used, kept for compatibility
}

function addCompareCountry(iso3) {
  if (!iso3 || state.compareCountries.includes(iso3) || state.compareCountries.length >= MAX_COMPARE) return;
  state.compareCountries.push(iso3);
  renderApp();
}

function removeCompareCountry(iso3) {
  state.compareCountries = state.compareCountries.filter((item) => item !== iso3);
  renderApp();
}

function clearCompareSelections() {
  state.compareCountries = [];
  renderApp();
}

function toggleSubregion(subregionKey) {
  const regionLabel = SUBREGION_MAP[subregionKey];
  if (!regionLabel) return;
  const regionCountries = BID_COUNTRIES.filter((bc) => bc.subregion === regionLabel);
  const allSelected = regionCountries.every((bc) => state.compareCountries.includes(bc.iso3));
  if (allSelected) {
    // Remove all countries of this subregion
    const regionIsos = new Set(regionCountries.map((bc) => bc.iso3));
    state.compareCountries = state.compareCountries.filter((key) => !regionIsos.has(key));
  } else {
    // Add missing countries of this subregion (respecting max)
    regionCountries.forEach((bc) => {
      if (!state.compareCountries.includes(bc.iso3) && state.compareCountries.length < MAX_COMPARE) {
        state.compareCountries.push(bc.iso3);
      }
    });
  }
  renderApp();
}

function openDrawer(iso3) {
  const overlay = $('#drawer-overlay');
  const drawer = $('#drawer');
  if (!overlay || !drawer) return;
  state.drawerIso = iso3;
  state.drawerEditions = {};
  renderDrawerContent(iso3);
  overlay.classList.remove('hidden');
  requestAnimationFrame(() => {
    overlay.classList.add('is-open');
    drawer.classList.add('is-open');
  });
}

function closeDrawer() {
  const overlay = $('#drawer-overlay');
  const drawer = $('#drawer');
  if (!overlay || !drawer) return;
  overlay.classList.remove('is-open');
  drawer.classList.remove('is-open');
  setTimeout(() => overlay.classList.add('hidden'), 250);
  $('#drawer-export-dropdown')?.classList.add('hidden');
  $('#drawer-export-toggle')?.setAttribute('aria-expanded', 'false');
  state.drawerIso = null;
  state.drawerEditions = {};
}

function renderDrawerContent(iso3) {
  const body = $('#drawer-body');
  const title = $('#drawer-country-name');
  const flag = $('#drawer-flag');
  if (!body || !title || !flag) return;

  const name = store.isoToName[iso3] || iso3;
  title.textContent = name;
  flag.src = flagUrl(iso3, 'w80');
  flag.alt = name;

  body.innerHTML = `
    <section class="ind-drawer-section">
      <span class="ind-card-kicker">Perfil comparado</span>
      <h3 class="ind-card-title">Posicionamiento de ${esc(name)} en los índices</h3>
      <div class="ind-drawer-index-grid">
        ${store.indicesSorted.map((index) => renderDrawerIndexCard(index, iso3)).join('')}
      </div>
    </section>

    <section class="ind-drawer-section">
      <span class="ind-card-kicker">Evolución</span>
      <h3 class="ind-card-title">Series históricas disponibles</h3>
      <div class="ind-drawer-series">
        ${store.indicesSorted.map((index) => renderDrawerSeries(index, iso3)).join('')}
      </div>
    </section>

    <section class="ind-drawer-section ind-drawer-section--cta">
      <a href="/ficha.html?country=${esc(iso3)}#gov-section" class="ind-drawer-link">
        Ver ficha completa del país
      </a>
    </section>
  `;
}

function renderDrawerIndexCard(index, iso3) {
  const meta = INDEX_META[index];
  const editions = store.getEditions(index).slice().sort((a, b) => b - a);
  const selectedEdition = state.drawerEditions[index] && editions.includes(state.drawerEditions[index])
    ? state.drawerEditions[index]
    : editions[0];
  const data = getDrawerIndexSnapshot(iso3, index, selectedEdition);
  if (!data?.entry) {
    return `
      <article class="ind-drawer-index-card ind-drawer-index-card--empty">
        <h4>${esc(meta.shortName)}</h4>
        <p>Sin dato disponible en la última edición integrada.</p>
      </article>
    `;
  }
  const width = clamp((data.entry.score / meta.scaleMax) * 100, 0, 100);
  const marks = [
    { key: 'world', label: 'Mundial', value: data.benchmarks.world },
    { key: 'ocde', label: 'OCDE', value: data.benchmarks.ocde },
    { key: 'alc', label: 'ALC', value: data.benchmarks.alc }
  ].filter((item) => item.value != null).map((item) => {
    const position = clamp((item.value / meta.scaleMax) * 100, 0, 100);
    return `<span class="ind-drawer-mini-mark ind-drawer-mini-mark--${item.key}" style="left:${position}%" title="${esc(item.label)} ${fmt(item.value, meta.scaleMax)}"></span>`;
  }).join('');
  const editionOptions = editions.map((edition) => `<option value="${edition}" ${edition === selectedEdition ? 'selected' : ''}>${edition}</option>`).join('');
  return `
    <article class="ind-drawer-index-card">
      <div class="ind-drawer-index-head">
        <div>
          <h4>${esc(meta.shortName)}</h4>
          <div class="ind-drawer-index-subhead">
            <p>${esc(meta.org)}</p>
            <label class="ind-drawer-year-select-wrap">
              <span class="ind-sr-only">Seleccionar edición</span>
              <select class="ind-drawer-year-select" data-drawer-index-year="${esc(index)}">${editionOptions}</select>
            </label>
          </div>
        </div>
        <strong>${fmt(data.entry.score, meta.scaleMax)}</strong>
      </div>
      <div class="ind-drawer-mini-bar">
        <span style="width:${width}%; background:${meta.color}"></span>
        <div class="ind-drawer-mini-marks">${marks}</div>
      </div>
      <div class="ind-drawer-index-meta">
        ${data.entry.regionalRank ? `<span class="ind-drawer-rank-meta"><span class="${getRankCircleClass(data.entry.regionalRank, 'ind-ranking-pos')}">${data.entry.regionalRank}</span><span>ALC</span></span>` : ''}
        ${data.entry.rankWorld ? `<span class="ind-drawer-rank-meta"><span class="${getRankCircleClass(data.entry.rankWorld, 'ind-ranking-pos ind-ranking-pos--world')}">${data.entry.rankWorld}</span><span>Mundial</span></span>` : ''}
      </div>
      ${data.entry.group ? getGroupBadge(data.entry.group) : ''}
    </article>
  `;
}

function renderDrawerSeries(index, iso3) {
  const meta = INDEX_META[index];
  const series = store.getTimeSeries(iso3, index);
  if (!series.length) return '';
  const rows = series.map((point) => `
    <tr>
      <td>${point.year}</td>
      <td>${point.rankWorld ?? '—'}</td>
      <td>${point.regionalRank ?? '—'}</td>
      <td>${fmt(point.score, meta.scaleMax)}</td>
    </tr>
  `).join('');
  return `
    <article class="ind-drawer-series-card">
      <h4>${esc(meta.shortName)}</h4>
      <p class="ind-drawer-series-org">${esc(meta.org)}</p>
      <div class="ind-drawer-series-table-wrap">
        <table class="ind-drawer-series-table">
          <thead>
            <tr>
              <th>Edición</th>
              <th>Pos. global</th>
              <th>Pos. ALC</th>
              <th>Puntuación</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </article>
  `;
}

function openMethodology() {
  const overlay = $('#methodology-overlay');
  if (!overlay) return;
  renderMethodologyContent();
  overlay.classList.remove('hidden');
  requestAnimationFrame(() => overlay.classList.add('is-open'));
}

function closeMethodology() {
  const overlay = $('#methodology-overlay');
  if (!overlay) return;
  overlay.classList.remove('is-open');
  setTimeout(() => overlay.classList.add('hidden'), 250);
}

function renderMethodologyContent() {
  const body = $('#methodology-body');
  if (!body) return;

  const activeIndex = getActiveIndex();

  // Build tab navigation
  const tabs = store.indicesSorted.map((index) => {
    const meta = INDEX_META[index];
    return `<button type="button" class="ind-modal-tab ${index === activeIndex ? 'active' : ''}" data-modal-tab="${esc(index)}">${esc(meta.shortName)}</button>`;
  }).join('');

  // Build panels
  const panels = store.indicesSorted.map((index) => {
    const meta = INDEX_META[index];
    const aspects = store.getMethodology(index)
      .filter((row) => row.index === index)
      .filter((row) => row.aspect !== 'Descripción');
    const description = store.getMethodologyAspect(index, 'Descripción');
    const sources = store.getSources(index);
    const numComponents = Object.keys(COMPONENT_META[index] || {}).filter((k) => k !== 'General').length;
    return `
      <div class="ind-modal-panel ${index === activeIndex ? 'active' : ''}" data-modal-panel="${esc(index)}">
        <article class="ind-modal-index-card" style="--idx-color:${meta.color}">
          <div class="ind-modal-index-head">
            <div>
              <span class="ind-card-kicker">${esc(meta.org)}</span>
              <h3 class="ind-card-title">${esc(meta.name)}</h3>
            </div>
            <div style="display:flex;flex-direction:column;gap:0.35rem;align-items:flex-end">
              <span class="ind-reading-pill">Escala 0–${esc(meta.scaleMax)}</span>
              ${numComponents ? `<span class="ind-reading-pill">${numComponents} componentes</span>` : ''}
            </div>
          </div>
          <p class="ind-card-copy">${esc(description || meta.orgLong)}</p>
          <div class="ind-modal-aspects">
            ${aspects.map((row) => `
              <article class="ind-modal-aspect">
                <h4>${esc(row.aspect)}</h4>
                <p>${esc(row.detail)}</p>
              </article>
            `).join('')}
          </div>
          <div class="ind-modal-sources">
            ${sources.map((row) => `
              <a class="ind-modal-source-link" href="${esc(row.url)}" target="_blank" rel="noopener">
                ${esc(row.source)}${row.edition ? ` · ${esc(row.edition)}` : ''}
              </a>
            `).join('')}
          </div>
        </article>
      </div>
    `;
  }).join('');

  body.innerHTML = `<div class="ind-modal-tabs">${tabs}</div>${panels}`;

  // Tab click
  body.addEventListener('click', (event) => {
    const tabBtn = event.target.closest('[data-modal-tab]');
    if (!tabBtn) return;
    const idx = tabBtn.dataset.modalTab;
    body.querySelectorAll('.ind-modal-tab').forEach((t) => t.classList.toggle('active', t.dataset.modalTab === idx));
    body.querySelectorAll('.ind-modal-panel').forEach((p) => p.classList.toggle('active', p.dataset.modalPanel === idx));
  });
}

function getExportComponentShort(row) {
  if (store.isGeneral(row.index, row.componentShort) || store.isGeneral(row.index, row.component)) return 'General';
  return row.componentShort || row.component || 'General';
}

function getExportComponentOrder(index, componentShort) {
  if (componentShort === 'General') return -1;
  const labels = COMPONENT_META[index] || {};
  const orderedKeys = Object.keys(labels).filter((key) => key !== 'General');
  const position = orderedKeys.indexOf(componentShort);
  return position === -1 ? Number.MAX_SAFE_INTEGER : position;
}

function sortExportRows(rows) {
  const aggregateOrder = { ALC: 0, OCD: 1, WRL: 2 };
  return [...rows].sort((a, b) => {
    const indexOrder = INDEX_ORDER.indexOf(a.index) - INDEX_ORDER.indexOf(b.index);
    if (indexOrder !== 0) return indexOrder;

    if (a.edition !== b.edition) return b.edition - a.edition;

    const componentOrder = getExportComponentOrder(a.index, getExportComponentShort(a)) - getExportComponentOrder(b.index, getExportComponentShort(b));
    if (componentOrder !== 0) return componentOrder;

    if (a.isCountry !== b.isCountry) return a.isCountry ? -1 : 1;

    if (!a.isCountry && !b.isCountry) {
      const aggDiff = (aggregateOrder[a.iso3] ?? Number.MAX_SAFE_INTEGER) - (aggregateOrder[b.iso3] ?? Number.MAX_SAFE_INTEGER);
      if (aggDiff !== 0) return aggDiff;
    }

    const aComponent = getExportComponentShort(a);
    const bComponent = getExportComponentShort(b);
    const rankA = a.isCountry ? (store.getCountryIndexRow(a.iso3, a.index, a.edition, aComponent)?.regionalRank ?? Number.MAX_SAFE_INTEGER) : Number.MAX_SAFE_INTEGER;
    const rankB = b.isCountry ? (store.getCountryIndexRow(b.iso3, b.index, b.edition, bComponent)?.regionalRank ?? Number.MAX_SAFE_INTEGER) : Number.MAX_SAFE_INTEGER;
    if (rankA !== rankB) return rankA - rankB;

    return String(a.country).localeCompare(String(b.country), 'es', { sensitivity: 'base' });
  });
}

function formatRowsForExport(rows) {
  return sortExportRows(rows).map((row) => {
    const meta = INDEX_META[row.index] || {};
    const componentShort = getExportComponentShort(row);
    const regionalRank = row.isCountry
      ? store.getCountryIndexRow(row.iso3, row.index, row.edition, componentShort)?.regionalRank ?? ''
      : '';

    return {
      Entidad: row.country,
      ISO3: row.iso3,
      Tipo: row.isCountry ? 'País' : 'Media',
      Índice: meta.shortName || row.index,
      'Nombre del índice': meta.name || row.index,
      Organización: meta.org || '',
      Edición: row.edition,
      Componente: componentShort === 'General' ? 'General' : getComponentLabel(row.index, componentShort),
      'Código componente': componentShort,
      Puntuación: row.score ?? '',
      'Ranking mundial': row.rankWorld ?? '',
      'Posición ALC': regionalRank,
      Grupo: row.group ?? ''
    };
  });
}

function getShownExportData() {
  return formatRowsForExport(
    store.rows.filter((row) => row.index === state.index && row.edition === state.edition)
  );
}

function getCompareCrossExportData(year = state.compareYear) {
  return store.indicesSorted.map((index) => {
    const meta = INDEX_META[index];
    const edition = getEditionForYear(index, year);
    const row = {
      Índice: meta.shortName,
      'Nombre del índice': meta.name || index,
      Organismo: meta.org,
      Año: edition || '',
    };

    state.compareCountries.forEach((key) => {
      const label = getCompareEntryName(key);
      const score = getCompareScore(key, index, year);
      row[label] = score == null ? '' : fmt(score, meta.scaleMax);
    });

    return row;
  });
}

function getAllExportData() {
  return formatRowsForExport(store.rows);
}

function getCountryExportData(iso3) {
  const name = store.isoToName[iso3] || iso3;
  return store.indicesSorted.flatMap((index) => {
    const meta = INDEX_META[index];
    return store.getTimeSeries(iso3, index).map((point) => ({
      País: name,
      ISO3: iso3,
      Índice: meta.shortName,
      'Nombre del índice': meta.name,
      Organización: meta.org,
      Edición: point.year,
      'Posición global': point.rankWorld ?? '',
      'Posición ALC': point.regionalRank ?? '',
      Puntuación: point.score ?? '',
      Grupo: point.group ?? ''
    }));
  });
}

function exportDataFile(data, kind, baseName, sheetName = 'Datos') {
  if (!Array.isArray(data) || !data.length) return;
  if (kind === 'json') {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    downloadBlob(blob, `${baseName}.json`);
    return;
  }

  if (!window.XLSX) return;
  const worksheet = window.XLSX.utils.json_to_sheet(data);
  const workbook = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  if (kind === 'xlsx') {
    window.XLSX.writeFile(workbook, `${baseName}.xlsx`);
    return;
  }
  const csv = window.XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, `${baseName}.csv`);
}

function exportShownData(kind) {
  exportDataFile(
    getShownExportData(),
    kind,
    `OGDILAC_DatosMostrados_${state.index}_${state.edition}`,
    `${state.index}_${state.edition}`
  );
}

function exportCompareCrossData(kind) {
  exportDataFile(
    getCompareCrossExportData(state.compareYear),
    kind,
    `OGDILAC_PanoramaTransversal_${state.compareYear}`,
    `Panorama_${state.compareYear}`
  );
}

function exportAllData(kind) {
  exportDataFile(
    getAllExportData(),
    kind,
    'OGDILAC_TodosLosDatos',
    'OGDILAC'
  );
}

function exportCountryFile(iso3, kind) {
  if (!iso3) return;
  const data = getCountryExportData(iso3);
  if (!data.length) return;
  const countryName = (store.isoToName[iso3] || iso3)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w-]+/g, '_');
  const baseName = `OGDILAC_${countryName}_${iso3}`;

  exportDataFile(data, kind, baseName, 'Pais');
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function bindGlobalEvents() {
  document.addEventListener('click', (event) => {
    const viewTab = event.target.closest('.ind-view-tab, .ind-sticky-tab');
    if (viewTab) {
      state.view = viewTab.dataset.view;
      renderApp();
      return;
    }

    const indexButton = event.target.closest('.ind-index-btn, .ind-sticky-index-btn');
    if (indexButton) {
      const index = indexButton.dataset.index;
      if (state.view === 'compare') {
        state.compareIndex = index;
        state.compareEdition = store.getLatestEdition(index);
      } else {
        state.index = index;
        state.edition = store.getLatestEdition(index);
        state.rankingMode = 'global';
        state.selectedComponent = 'General';
        state.rankingSortKey = 'regionalRank';
        state.rankingSortDir = 'asc';
      }
      renderApp();
      return;
    }

    const rankingToggle = event.target.closest('.ind-toggle-btn');
    if (rankingToggle) {
      state.rankingMode = rankingToggle.dataset.mode;
      if (state.rankingMode === 'component') {
        const components = store.getComponents(state.index, state.edition);
        state.selectedComponent = components[0] || 'General';
      }
      renderApp();
      return;
    }

    const compareRemove = event.target.closest('[data-remove-compare]');
    if (compareRemove) {
      removeCompareCountry(compareRemove.dataset.removeCompare);
      return;
    }

    const compareAdd = event.target.closest('[data-add-compare]');
    if (compareAdd) {
      addCompareCountry(compareAdd.dataset.addCompare);
      return;
    }

    const clearCompare = event.target.closest('[data-clear-compare]');
    if (clearCompare) {
      clearCompareSelections();
      return;
    }

    const toggleSub = event.target.closest('[data-toggle-subregion]');
    if (toggleSub) {
      toggleSubregion(toggleSub.dataset.toggleSubregion);
      return;
    }

    const toggleCompare = event.target.closest('[data-toggle-compare]');
    if (toggleCompare) {
      const key = toggleCompare.dataset.toggleCompare;
      if (state.compareCountries.includes(key)) {
        removeCompareCountry(key);
      } else {
        addCompareCountry(key);
      }
      return;
    }

    const timelineDot = event.target.closest('[data-compare-year]');
    if (timelineDot) {
      state.compareYear = Number(timelineDot.dataset.compareYear);
      renderApp();
      return;
    }

    const drawerTarget = event.target.closest('[data-open-drawer]');
    if (drawerTarget) {
      openDrawer(drawerTarget.dataset.openDrawer);
      return;
    }

    if (event.target.id === 'ranking-components-toggle') {
      state.showRankingComponents = !state.showRankingComponents;
      renderApp();
      return;
    }

    const sortHeader = event.target.closest('[data-sort-key]');
    if (sortHeader) {
      const key = sortHeader.dataset.sortKey;
      if (state.rankingSortKey === key) {
        state.rankingSortDir = state.rankingSortDir === 'asc' ? 'desc' : 'asc';
      } else {
        state.rankingSortKey = key;
        state.rankingSortDir = key === 'country' || key === 'group' ? 'asc' : 'desc';
      }
      renderApp();
      return;
    }

    if (event.target.id === 'compare-components-toggle') {
      state.compareShowComponents = !state.compareShowComponents;
      renderApp();
      return;
    }

    if (event.target.id === 'compare-trend-toggle') {
      state.compareShowTrend = !state.compareShowTrend;
      renderApp();
      return;
    }

    const compareCrossExportWrap = $('#compare-cross-export-wrap');
    const compareCrossExportDrop = $('#compare-cross-export-dropdown');
    if (event.target.closest('#compare-cross-export-toggle')) {
      compareCrossExportDrop?.classList.toggle('hidden');
      const expanded = compareCrossExportDrop && !compareCrossExportDrop.classList.contains('hidden');
      $('#compare-cross-export-toggle')?.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      return;
    }

    const exportBtn = event.target.closest('[data-export-scope][data-export-kind]');
    if (exportBtn) {
      const { exportScope, exportKind } = exportBtn.dataset;
      if (exportScope === 'shown') exportShownData(exportKind);
      if (exportScope === 'all') exportAllData(exportKind);
      if (exportScope === 'compare-cross') exportCompareCrossData(exportKind);
      if (exportScope === 'compare-cross') {
        $('#compare-cross-export-dropdown')?.classList.add('hidden');
        $('#compare-cross-export-toggle')?.setAttribute('aria-expanded', 'false');
      }
      return;
    }

    const drawerExportWrap = $('#drawer-export-wrap');
    const drawerExportDrop = $('#drawer-export-dropdown');
    if (event.target.closest('#drawer-export-toggle')) {
      drawerExportDrop?.classList.toggle('hidden');
      const expanded = drawerExportDrop && !drawerExportDrop.classList.contains('hidden');
      $('#drawer-export-toggle')?.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      return;
    }

    if (drawerExportWrap && drawerExportDrop && !drawerExportWrap.contains(event.target)) {
      drawerExportDrop.classList.add('hidden');
      $('#drawer-export-toggle')?.setAttribute('aria-expanded', 'false');
    }

    if (compareCrossExportWrap && compareCrossExportDrop && !compareCrossExportWrap.contains(event.target)) {
      compareCrossExportDrop.classList.add('hidden');
      $('#compare-cross-export-toggle')?.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('ind-edition-select')) {
      const nextEdition = Number(event.target.value);
      if (state.view === 'compare') {
        state.compareEdition = nextEdition;
      } else {
        state.edition = nextEdition;
        state.rankingSortKey = 'regionalRank';
        state.rankingSortDir = 'asc';
      }
      renderApp();
      return;
    }
    if (event.target.id === 'chart-component-select') {
      state.selectedComponent = event.target.value;
      state.rankingSortKey = 'regionalRank';
      state.rankingSortDir = 'asc';
      renderApp();
      return;
    }
    if (event.target.id === 'compare-index-select') {
      state.compareIndex = event.target.value;
      state.compareEdition = store.getLatestEdition(state.compareIndex);
      renderApp();
      return;
    }
    if (event.target.id === 'compare-edition-select') {
      state.compareEdition = Number(event.target.value);
      renderApp();
      return;
    }
    if (event.target.matches('[data-drawer-index-year]')) {
      state.drawerEditions[event.target.dataset.drawerIndexYear] = Number(event.target.value);
      if (state.drawerIso) renderDrawerContent(state.drawerIso);
    }
  });

  $('#drawer-overlay')?.addEventListener('click', (event) => {
    if (event.target === event.currentTarget) closeDrawer();
  });
  $('#drawer-close')?.addEventListener('click', closeDrawer);

  $('#btn-methodology')?.addEventListener('click', openMethodology);
  $('#methodology-overlay')?.addEventListener('click', (event) => {
    if (event.target === event.currentTarget) closeMethodology();
  });
  $('#methodology-close')?.addEventListener('click', closeMethodology);

  $('#drawer-export-xlsx')?.addEventListener('click', () => {
    exportCountryFile(state.drawerIso, 'xlsx');
    $('#drawer-export-dropdown')?.classList.add('hidden');
    $('#drawer-export-toggle')?.setAttribute('aria-expanded', 'false');
  });
  $('#drawer-export-csv')?.addEventListener('click', () => {
    exportCountryFile(state.drawerIso, 'csv');
    $('#drawer-export-dropdown')?.classList.add('hidden');
    $('#drawer-export-toggle')?.setAttribute('aria-expanded', 'false');
  });

  document.addEventListener('keydown', (event) => {
    const drawerTrigger = event.target.closest('[data-open-drawer]');
    if (drawerTrigger && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      openDrawer(drawerTrigger.dataset.openDrawer);
      return;
    }
    if (event.key === 'Escape') {
      closeDrawer();
      closeMethodology();
      $('#compare-suggestions')?.classList.add('hidden');
      $('#drawer-export-dropdown')?.classList.add('hidden');
      $('#compare-cross-export-dropdown')?.classList.add('hidden');
      $('#compare-cross-export-toggle')?.setAttribute('aria-expanded', 'false');
    }
  });

  // Sticky bar: show on scroll past hero
  const heroEl = document.querySelector('.ind-hero');
  const stickyBar = document.getElementById('ind-sticky-bar');
  if (heroEl && stickyBar) {
    const obs = new IntersectionObserver(
      ([entry]) => stickyBar.classList.toggle('is-visible', !entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(heroEl);
  }

}

async function init() {
  syncStateFromURL();
  try {
    const [rawResponse, methodologyResponse, sourcesResponse, countriesResponse] = await Promise.all([
      fetch('/data/indices_data.json'),
      fetch('/data/indices_metodologia.json'),
      fetch('/data/indices_fuentes.json'),
      fetch('/api/countries').catch(() => null)
    ]);
    const [raw, methodology, sources] = await Promise.all([
      rawResponse.json(),
      methodologyResponse.json(),
      sourcesResponse.json()
    ]);
    const countries = countriesResponse ? await countriesResponse.json() : [];
    countries.forEach((country) => {
      if (country.numericId) numericToIso[Number(country.numericId)] = country.iso3;
    });
    store = new DataStore(raw, methodology, sources);
  } catch (error) {
    const content = $('#ind-content');
    if (content) {
      content.classList.remove('hidden');
      content.innerHTML = `
        <div class="ind-empty-state">
          <h3>Error al cargar los datos</h3>
          <p>${esc(error.message)}</p>
        </div>
      `;
    }
    return;
  }

  $('#ind-loading')?.classList.add('hidden');
  $('#ind-content')?.classList.remove('hidden');
  renderApp();
  bindGlobalEvents();
}

document.addEventListener('DOMContentLoaded', init);
