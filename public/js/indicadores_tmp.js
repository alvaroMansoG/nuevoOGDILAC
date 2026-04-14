/**
 * OGDILAC â€” Indicadores Internacionales
 * Unified ranking + comparison experience
 */

/* â”€â”€ Constants â”€â”€ */
const ISO2_MAP = {
  ARG:'ar',BOL:'bo',BRA:'br',CHL:'cl',COL:'co',CRI:'cr',DOM:'do',
  ECU:'ec',SLV:'sv',GTM:'gt',HTI:'ht',HND:'hn',JAM:'jm',MEX:'mx',
  NIC:'ni',PAN:'pa',PRY:'py',PER:'pe',TTO:'tt',URY:'uy',VEN:'ve',
  GUY:'gy',SUR:'sr',BLZ:'bz',BHS:'bs',BRB:'bb'
}; 12 subpilares y 60 indicadores. El íÍndice busca reflejar no solo la disponibilidad tecnológica, sino también la capacidad de las personas, la calidad de la gobernanza digital y los efectos de la digitalización sobre la economía y la calidad de vida.',
  },
};

const INDEX_ORDER = ['EGDI','GTMI','GCI','OCDE/BID','Government AI Readiness','NRI'];
const COUNTRY_COLORS = ['#3f6db3','#d14f61','#2e8b57','#e08b2c','#7a5bd6','#22a3b8','#c45da5','#6b8e23'];

function flagUrl(iso3, size='w40') {
  const iso2 = ISO2_MAP[iso3];
  return iso2 ? `https://flagcdn.com/${size}/${iso2}.png` : '';
}

function fmt(v, max) {
  if (v == null || isNaN(v)) return 'â€”';
  if (max <= 1) return v.toFixed(3);
  if (max <= 10) return v.toFixed(2);
  return v.toFixed(1);
}

function esc(s) { return String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"—"/g,'&quot;'); }

function getGroupBadge(group) {
  if (!group) return '';
  const g = String(group).toLowerCase();
  let cls = 'ind-group-badge--gray';
  if (g.includes('muy alto') || g.includes('t1') || g.includes('grupo a')) cls = 'ind-group-badge--green';
  else if (g.includes('alto') || g.includes('t2') || g.includes('grupo b')) cls = 'ind-group-badge--blue';
  else if (g.includes('medio') || g.includes('t3') || g.includes('grupo c') || g.includes('consolid')) cls = 'ind-group-badge--yellow';
  else if (g.includes('t4') || g.includes('evol')) cls = 'ind-group-badge--orange';
  else if (g.includes('bajo') || g.includes('t5') || g.includes('grupo d')) cls = 'ind-group-badge--red';
  return `<span class="—"ind-group-badge ${cls}"—">${esc(group)}</span>`;
}

/* â”€â”€ Data Layer â”€â”€ */
class DataStore {
  constructor(raw, metodologia, fuentes) {
    this.raw = raw;
    this.metodologia = metodologia || [];
    this.fuentes = fuentes || [];
    this._buildIÍndices();
  }

  _buildIÍndices() {
    this.countries = [...new Set(this.raw.filter(r=>r.isCountry==='SI').map(r=>r.PaÃ­s))].sort();
    this.countryISO = {};
    this.raw.filter(r=>r.isCountry==='SI').forEach(r=>{ this.countryISO[r.PaÃ­s]=r.ISO3; });
    this.isoToName = {};
    this.raw.filter(r=>r.isCountry==='SI').forEach(r=>{ this.isoToName[r.ISO3]=r.PaÃ­s; });
    this.iÍndices = [...new Set(this.raw.map(r=>r['ÃÍndice']))];
    this.iÍndicesSorted = INDEX_ORDER.filter(i=>this.iÍndices.includes(i));
  }

  getEditions(index) {
    return [...new Set(this.raw.filter(r=>r['ÃÍndice']===index).map(r=>r['EdiciÃ³n']))].sort((a,b)=>b-a);
  }

  getLatestEdition(index) {
    const eds = this.getEditions(index);
    return eds.length ? eds[0] : null;
  }

  getRanking(index, edition, componentShort='General') {
    const compKey = componentShort === 'General' ? 
      this.raw.filter(r=>r['ÃÍndice']===index && r['EdiciÃ³n']===edition && r.isCountry==='SI')
        .map(r=>r['Componente corto'])
        .find(c => {
          const low = (c||'').toLowerCase();
          return low === index.toLowerCase() || low === 'general' || low === (INDEX_META[index]?.shortName||'').toLowerCase();
        }) || 'General'
      : componentShort;

    const isGeneral = c => {
      if (!c) return false;
      const low = c.toLowerCase();
      const idx = index.toLowerCase();
      const meta = INDEX_META[index];
      const shortLow = (meta?.shortName||'').toLowerCase();
      return low === 'general' || low === idx || low === shortLow || low === (meta?.key||'').toLowerCase();
    };

    return this.raw
      .filter(r => {
        if (r['ÃÍndice'] !== index || r['EdiciÃ³n'] !== edition) return false;
        if (componentShort === 'General') return isGeneral(r['Componente corto']) || isGeneral(r['Componente']);
        return r['Componente corto'] === componentShort;
      })
      .filter(r => r.isCountry === 'SI')
      .map(r => ({
        country: r.PaÃ­s,
        iso3: r.ISO3,
        score: r['PuntuaciÃ³n'],
        rank: r['Ranking Mundial'],
        group: r.Grupo,
      }))
      .sort((a,b) => {
        const aVal = a.score != null && !isNaN(a.score) ? a.score : -Infinity;
        const bVal = b.score != null && !isNaN(b.score) ? b.score : -Infinity;
        return bVal - aVal;
      });
  }

  getBenchmarks(index, edition) {
    const isGeneral = c => {
      if (!c) return false;
      const low = c.toLowerCase();
      const idx = index.toLowerCase();
      const meta = INDEX_META[index];
      const shortLow = (meta?.shortName||'').toLowerCase();
      return low === 'general' || low === idx || low === shortLow || low === (meta?.key||'').toLowerCase();
    };

    const agg = this.raw.filter(r =>
      r['ÃÍndice'] === index && r['EdiciÃ³n'] === edition &&
      r.isCountry === 'NO' && (isGeneral(r['Componente corto']) || isGeneral(r['Componente']))
    );
    const result = {};
    agg.forEach(r => {
      if (r.ISO3 === 'ALC') result.alc = r['PuntuaciÃ³n'];
      else if (r.ISO3 === 'OCD') result.ocde = r['PuntuaciÃ³n'];
      else if (r.ISO3 === 'WRL') result.world = r['PuntuaciÃ³n'];
    });
    return result;
  }

  getComponents(index, edition) {
    const isGeneral = c => {
      if (!c) return false;
      const low = c.toLowerCase();
      const idx = index.toLowerCase();
      const meta = INDEX_META[index];
      const shortLow = (meta?.shortName||'').toLowerCase();
      return low === 'general' || low === idx || low === shortLow || low === (meta?.key||'').toLowerCase();
    };

    return [...new Set(
      this.raw
        .filter(r => r['ÃÍndice'] === index && r['EdiciÃ³n'] === edition && !isGeneral(r['Componente corto']) && !isGeneral(r['Componente']))
        .map(r => r['Componente corto'])
    )];
  }

  getCountryProfile(iso3) {
    const results = {};
    this.iÍndicesSorted.forEach(idx => {
      const latestEd = this.getLatestEdition(idx);
      if (!latestEd) return;
      const ranking = this.getRanking(idx, latestEd);
      const entry = ranking.find(r => r.iso3 === iso3);
      const benchmarks = this.getBenchmarks(idx, latestEd);
      const components = this.getComponents(idx, latestEd);
      const compScores = {};
      components.forEach(comp => {
        const row = this.raw.find(r =>
          r['ÃÍndice'] === idx && r['EdiciÃ³n'] === latestEd &&
          r.ISO3 === iso3 && r['Componente corto'] === comp
        );
        if (row) compScores[comp] = { score: row['PuntuaciÃ³n'], rank: row['Ranking Mundial'] };
      });
      results[idx] = {
        edition: latestEd,
        entry,
        benchmarks,
        ranking,
        rankPosition: entry ? ranking.indexOf(entry) + 1 : null,
        totalCountries: ranking.length,
        components: compScores,
      };
    });
    return results;
  }

  getTimeSeries(iso3, index) {
    const isGeneral = c => {
      if (!c) return false;
      const low = c.toLowerCase();
      const idx = index.toLowerCase();
      const meta = INDEX_META[index];
      const shortLow = (meta?.shortName||'').toLowerCase();
      return low === 'general' || low === idx || low === shortLow || low === (meta?.key||'').toLowerCase();
    };

    return this.raw
      .filter(r => r.ISO3 === iso3 && r['ÃÍndice'] === index && (isGeneral(r['Componente corto']) || isGeneral(r['Componente'])))
      .map(r => ({ year: r['EdiciÃ³n'], score: r['PuntuaciÃ³n'] }))
      .filter(r => r.score != null)
      .sort((a,b) => a.year - b.year);
  }

  getInsights(index, edition) {
    const ranking = this.getRanking(index, edition);
    const benchmarks = this.getBenchmarks(index, edition);
    if (!ranking.length) return null;
    const top3 = ranking.slice(0, 3);
    const bottom3 = ranking.slice(-3).reverse();
    const leader = ranking[0];
    const laggard = ranking[ranking.length - 1];
    let biggestGapOcde = null;
    if (benchmarks.ocde != null) {
      let maxGap = -Infinity;
      ranking.forEach(r => {
        const gap = benchmarks.ocde - r.score;
        if (gap > maxGap) { maxGap = gap; biggestGapOcde = { ...r, gap: maxGap }; }
      });
    }
    let bestRelative = null;
    if (benchmarks.alc != null) {
      let bestDiff = -Infinity;
      ranking.forEach(r => {
        const diff = r.score - benchmarks.alc;
        if (diff > bestDiff) { bestDiff = diff; bestRelative = { ...r, diff: bestDiff }; }
      });
    }
    return { top3, bottom3, leader, laggard, biggestGapOcde, bestRelative, benchmarks };
  }

  getMetodologia(index) {
    return this.metodologia.filter(r => r['ÃÍndice'] === index || r['ÃÍndice'] === 'ComÃºn');
  }

  getFuentes(index) {
    return this.fuentes.filter(r => r['ÃÍndice'] === index);
  }
}

/* â”€â”€ State Manager â”€â”€ */
const state = {
  view: 'ranking',
  index: 'EGDI',
  edition: null,
  rankingMode: 'global', // 'global' or 'component'
  selectedComponent: 'General',
  showComponents: false,
  searchQuery: '',
  compareCountries: [],
  compareYearFrom: null,
  compareYearTo: null,
  compareIndex: null,
  sortCol: null,
  sortDir: 'desc',
  drawerIso: null,
};

let store = null;
let numericToIso = {
  32: 'ARG', 44: 'BHS', 52: 'BRB', 84: 'BLZ', 68: 'BOL', 76: 'BRA', 152: 'CHL', 170: 'COL',
  188: 'CRI', 214: 'DOM', 218: 'ECU', 222: 'SLV', 320: 'GTM', 328: 'GUY', 332: 'HTI', 340: 'HND',
  388: 'JAM', 484: 'MEX', 558: 'NIC', 591: 'PAN', 600: 'PRY', 604: 'PER', 740: 'SUR', 780: 'TTO',
  858: 'URY', 862: 'VEN'
}; // Mapping for robust heatmap matching (with LAC static fallback)

function syncStateFromURL() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('vista') === 'comparativa') state.view = 'compare';
  if (params.get('iÍndice') && INDEX_META[params.get('iÍndice')]) state.index = params.get('iÍndice');
  if (params.get('edicion')) state.edition = Number(params.get('edicion'));
  if (params.get('paises')) state.compareCountries = params.get('paises').split(',').filter(Boolean);
  if (params.get('desde')) state.compareYearFrom = Number(params.get('desde'));
  if (params.get('hasta')) state.compareYearTo = Number(params.get('hasta'));
}

function syncURLFromState() {
  const params = new URLSearchParams();
  params.set('vista', state.view === 'compare' ? 'comparativa' : 'ranking');
  params.set('iÍndice', state.index);
  if (state.edition) params.set('edicion', state.edition);
  if (state.view === 'compare' && state.compareCountries.length) {
    params.set('paises', state.compareCountries.join(','));
    if (state.compareYearFrom) params.set('desde', state.compareYearFrom);
    if (state.compareYearTo) params.set('hasta', state.compareYearTo);
  }
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState(null, '', newUrl);
}

/* â”€â”€ Render engine â”€â”€ */
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

function renderApp() {
  const main = $('#ind-content');
  if (!store) return;

  if (!state.edition) state.edition = store.getLatestEdition(state.index);

  renderFilters();
  renderViewTabs();

  if (state.view === 'ranking') {
    main.innerHTML = '';
    main.className = 'ind-view-panel';
    renderRankingView(main);
  } else {
    main.innerHTML = '';
    main.className = 'ind-view-panel';
    renderCompareView(main);
  }
  syncURLFromState();
}

function renderViewTabs() {
  $$('.ind-view-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.view === state.view);
  });
}

function renderFilters() {
  const indexGrp = $('#filter-index-group');
  const searchInput = $('#filter-search');

  if (indexGrp) {
    indexGrp.innerHTML = store.iÍndicesSorted.map(i => {
      const isActive = i === state.index;
      const meta = INDEX_META[i];
      return `
        <button type="—"button"—" class="—"ind-index-btn ${isActive?'active':''}"—" data-index="—"${esc(i)}"—">
          <div class="—"ind-index-btn-title"—">${esc(meta?.shortName || i)}</div>
          <div class="—"ind-index-btn-org"—">${esc(meta?.org || '')}</div>
        </button>
      `;
    }).join('');
  }

  if (searchInput) searchInput.value = state.searchQuery;

  const compToggle = $('#filter-components');
  if (compToggle) compToggle.classList.toggle('active', state.showComponents);
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   RANKING VIEW
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function renderRankingView(container) {
  const meta = INDEX_META[state.index];
  const editions = store.getEditions(state.index);
  const components = store.getComponents(state.index, state.edition);

  // Determine current ranking focus
  const rankingCompKey = state.rankingMode === 'component' ? state.selectedComponent : 'General';
  const ranking = store.getRanking(state.index, state.edition, rankingCompKey);
  const benchmarks = store.getBenchmarks(state.index, state.edition); // Benchmarks are usually for general, but we keep them for context

  let filtered = ranking;
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    filtered = ranking.filter(r => r.country.toLowerCase().includes(q) || r.iso3.toLowerCase().includes(q));
  }

  const withData = filtered.filter(r => r.score != null && !isNaN(r.score));
  const withoutData = filtered.filter(r => r.score == null || isNaN(r.score));

  let benchHtml = `<div class="—"ind-benchmarks"—">`;
  benchHtml += buildBenchCard('Promedio ALC', benchmarks.alc, meta.scaleMax, '--bench-color: #3f6db3', 'PaÃ­ses prestatarios BID');
  benchHtml += buildBenchCard('Promedio OCDE', benchmarks.ocde, meta.scaleMax, '--bench-color: #22a3b8', benchmarks.ocde != null ? '' : 'No disponible');
  benchHtml += buildBenchCard('Promedio Mundial', benchmarks.world, meta.scaleMax, '--bench-color: #5a7388', benchmarks.world != null ? '' : 'No disponible');
  benchHtml += `</div>`;

  let contextHtml = `
    <div class="—"ind-context-card"—" style="—"--bar-color: ${meta.color}"—">
      <h3 class="—"ind-context-title"—">${esc(meta.name)} <span style="—"font-weight:400;color:var(--ind-text-4);font-size:1rem;"—">(${esc(meta.shortName)})</span></h3>
      <p class="—"ind-context-desc"—">${esc(meta.desc)}</p>
      <div class="—"ind-context-meta"—">
        <span><strong>Organismo:</strong> ${esc(meta.org)}</span>
        <a href="—"${meta.url}"—" target="—"_blank"—" class="—"ind-context-link"—">Ver sitio web oficial <svg width="—"12"—" height="—"12"—" viewBox="—"0 0 24 24"—" fill="—"none"—" stroke="—"currentColor"—" stroke-width="—"2"—" style="—"vertical-align:middle;margin-top:-2px"—"><path d="—"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"—"/><polyline points="—"15 3 21 3 21 9"—"/><line x1="—"10"—" y1="—"14"—" x2="—"21"—" y2="—"3"—"/></svg></a>
      </div>
    </div>
  `;

  let mapHtml = `
    <div class="—"ind-map-panel"—" id="—"map-panel"—">
      <div class="—"ind-map-title"—">Heatmap Regional ALC</div>
      <div id="—"ind-map-svg-container"—" class="—"ind-map-svg"—"></div>
      <div class="—"ind-map-legend"—">
        <div class="—"ind-map-legend-gradient"—" id="—"map-legend-grad"—" style="—"--map-scale-start:#e4eaf0; --map-scale-end:${meta.color}"—"></div>
        <div class="—"ind-map-legend-labels"—">
          <span>MÃ­nimo</span>
          <span>MÃ¡ximo</span>
        </div>
      </div>
    </div>
  `;

  // Edition selector HTML
  const editionOptions = editions.map(e => `<option value="—"${e}"—" ${e === state.edition ? 'selected' : ''}>${e}</option>`).join('');

  // Component selector HTML (only shows if mode is component)
  let compSelectorHtml = '';
  if (state.rankingMode === 'component' && components.length > 0) {
    const compOptions = components.map(c => `<option value="—"${c}"—" ${c === state.selectedComponent ? 'selected' : ''}>${c}</option>`).join('');
    compSelectorHtml = `
      <div class="—"ind-chart-header-group"—">
        <span class="—"ind-chart-header-label"—">Componente:</span>
        <select class="—"ind-chart-header-select"—" id="—"chart-component-select"—">
          ${compOptions}
        </select>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="—"ind-ranking-layout"—">
      <!-- LEFT SIDEBAR -->
      <div class="—"ind-ranking-sidebar"—">
        ${mapHtml}
        ${contextHtml}
        ${benchHtml}
      </div>
      <!-- RIGHT MAIN CONTENT -->
      <div class="—"ind-ranking-main"—">
        <div class="—"ind-chart-card"—">
          <div class="—"ind-chart-title-bar"—">
            <div>
              <h3 class="—"ind-chart-title"—">DistribuciÃ³n regional</h3>
              <p class="—"ind-chart-subtitle"—">Puntuaciones ordenadas para ${state.rankingMode === 'global' ? 'Ranking General' : state.selectedComponent}</p>
            </div>
            <div class="—"ind-chart-header-actions"—">
              <div class="—"ind-chart-view-toggle"—">
                <button type="—"button"—" class="—"ind-toggle-btn ${state.rankingMode === 'global' ? 'active' : ''}"—" data-mode="—"global"—">General</button>
                <button type="—"button"—" class="—"ind-toggle-btn ${state.rankingMode === 'component' ? 'active' : ''}"—" data-mode="—"component"—">Componentes</button>
              </div>
              ${compSelectorHtml}
              <div class="—"ind-chart-header-group"—">
                <span class="—"ind-chart-header-label"—">Serie histÃ³rica:</span>
                <select class="—"ind-chart-header-select"—" id="—"chart-edition-select"—">
                  ${editionOptions}
                </select>
              </div>
            </div>
          </div>
          <div class="—"ind-bar-list"—" id="—"ranking-bars"—"></div>
        </div>
        <div class="—"ind-table-card"—" id="—"ranking-table-card"—" style="—"margin-top:1.5rem"—"></div>
      </div>
    </div>
  `;
  renderRankingBars(withData, withoutData, benchmarks, meta);
  renderRankingTable(filtered, meta, components);
  renderRankingHeatmap(withData, meta);
}

function buildBenchCard(label, value, scaleMax, style, detail) {
  return `
    <div class="—"ind-bench-card"—" style="—"${style}"—">
      <div class="—"ind-bench-label"—">${label}</div>
      <div class="—"ind-bench-value"—">${value != null ? fmt(value, scaleMax) : 'â€”'}</div>
      ${detail ? `<div class="—"ind-bench-detail"—">${detail}</div>` : ''}
    </div>
  `;
}

function renderRankingBars(withData, withoutData, benchmarks, meta) {
  const container = $('#ranking-bars');
  if (!container) return;
  const maxScore = meta.scaleMax;
  const barColor = meta.color;
  const barColorLight = meta.color + '99';

  let html = '';
  withData.forEach((r, i) => {
    const pct = maxScore > 0 ? (r.score / maxScore * 100) : 0;
    const isTop3 = i < 3;
    html += `
      <div class="—"ind-bar-item"—" data-iso="—"${r.iso3}"—" title="—"Clic para ver detalle de ${esc(r.country)}"—">
        <span class="—"ind-bar-rank ${isTop3?'top3':''}"—">${i+1}</span>
        <div class="—"ind-bar-country"—">
          <img class="—"ind-bar-flag"—" src="—"${flagUrl(r.iso3)}"—" alt="—"${esc(r.country)}"—" loading="—"lazy"—">
          <span class="—"ind-bar-name"—">${esc(r.country)}</span>
        </div>
        <div class="—"ind-bar-track"—">
          <div class="—"ind-bar-fill"—" style="—"width:${pct}%;--bar-color:${barColor};--bar-color-light:${barColorLight}"—"></div>
        </div>
        <span class="—"ind-bar-score"—">${fmt(r.score, maxScore)}${r.rank ? `<small>#${r.rank}</small>` : ''}</span>
      </div>
    `;
  });

  if (withoutData.length > 0) {
    html += `<div class="—"ind-no-data-list"—">`;
    withoutData.forEach(r => {
      html += `
        <div class="—"ind-no-data-tag"—" title="—"Sin datos evaluables en ediciÃ³n ${state.edition}"—">
          <img class="—"ind-insight-flag"—" src="—"${flagUrl(r.iso3)}"—" alt="—""—">
          <span>${esc(r.country)}</span>
        </div>
      `;
    });
    html += `</div>`;
  }

  container.innerHTML = html;
  container.querySelectorAll('.ind-bar-item').forEach(el => {
    el.addEventListener('click', () => openDrawer(el.dataset.iso));
  });
}

function renderRankingHeatmap(withData, meta) {
  const mapContainer = document.getElementById('ind-map-svg-container');
  if (!mapContainer || !window.d3 || !window.topojson) {
    if (mapContainer && (!window.d3 || !window.topojson)) {
      mapContainer.innerHTML = '<p style="—"padding:2rem;text-align:center;color:#666"—">Cargando mapa...</p>';
      setTimeout(() => renderRankingHeatmap(withData, meta), 1000); // Retry when libraries load
    }
    return;
  }
  
  if (window._currentIndMapData) {
    drawHeatmap(window._currentIndMapData, withData, meta);
  } else {
    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json').then(world => {
      window._currentIndMapData = world;
      drawHeatmap(world, withData, meta);
    });
  }
}

function drawHeatmap(world, withData, meta) {
  const container = d3.select('#ind-map-svg-container');
  container.selectAll('*').remove();

  const width = container.node().getBoundingClientRect().width || 400;
  const height = container.node().getBoundingClientRect().height || 500;
  
  const allCountries = topojson.feature(world, world.objects.countries);
  
  const scoresMap = {};
  let minScore = Infinity;
  let maxScore = -Infinity;
  
  withData.forEach(d => {
    // For mapping, try to match by name or iso3. ISO3 is best if topjson has it. Topjson 50m typically only has numeric ID and properties.name. 
    // We'll normalize names to match the latin american IDs usually used.
    scoresMap[d.country] = d.score;
    scoresMap[d.iso3] = d.score;
    if (d.score < minScore) minScore = d.score;
    if (d.score > maxScore) maxScore = d.score;
  });

  if (minScore === Infinity) { minScore = 0; maxScore = meta.scaleMax; }
  
  const colorScale = d3.scaleLinear()
    .domain([minScore, maxScore])
    .range(['#f0f7fc', meta.color]);

  // Just render all of world, but focusing on LATAM
  const projection = d3.geoMercator()
       .center([-75, -5])
       .scale(width * 0.5)
       .translate([width / 2, height / 2]);
       
  // Refine projection to fit LAC loosely
  const latamFeatures = allCountries.features.filter(f => {
     return !!numericToIso[Number(f.id)];
  });
  
  if (latamFeatures.length > 0) {
      projection.fitExtent([[10, 10], [width - 10, height - 10]], { type: 'FeatureCollection', features: latamFeatures });
  } else {
      projection.fitExtent([[10, 10], [width - 10, height - 10]], allCountries);
  }

  const path = d3.geoPath().projection(projection);

  const svg = container.append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .append('g');

  const tooltip = d3.select('body').append('div')
    .attr('class', 'map-tooltip')
    .style('position', 'absolute')
    .style('background', '#fff')
    .style('padding', '6px 10px')
    .style('border-radius', '4px')
    .style('box-shadow', '0 2px 10px rgba(0,0,0,0.1)')
    .style('font-size', '12px')
    .style('pointer-events', 'none')
    .style('opacity', 0);

    svg.selectAll('.ind-map-country')
      .data(latamFeatures)
      .join('path')
      .attr('class', 'ind-map-country')
      .attr('d', path)
      .attr('fill', d => {
        const iso3 = numericToIso[Number(d.id)];
        const score = iso3 ? scoresMap[iso3] : null;
        // Fallback to name matching if ISO lookup fails
        const finalScore = score ?? scoresMap[d.properties.name];

        if (finalScore == null) return '#e2e8f0';
        return colorScale(finalScore);
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      .on('mouseenter', (event, d) => {
        const iso3 = numericToIso[Number(d.id)];
        const score = iso3 ? scoresMap[iso3] : (scoresMap[d.properties.name] ?? null);
        const name = iso3 ? (store.isoToName[iso3] || d.properties.name) : d.properties.name;

        if (score == null) return;
        tooltip.transition().duration(50).style('opacity', 1);
        tooltip.html(`<strong>${esc(name)}</strong><br>${fmt(score, meta.scaleMax)}`)
               .style("—"left"—", (event.pageX + 10) + "—"px"—")
               .style("—"top"—", (event.pageY - 28) + "—"px"—");
      })
      .on('mousemove', (event) => {
        tooltip.style("—"left"—", (event.pageX + 10) + "—"px"—")
               .style("—"top"—", (event.pageY - 28) + "—"px"—");
      })
      .on('mouseleave', () => {
        tooltip.transition().duration(200).style('opacity', 0);
      });
}


function renderRankingTable(filtered, meta, components) {
  const card = $('#ranking-table-card');
  if (!card) return;

  const showComp = state.showComponents && components.length > 0;

  let thHtml = `<th data-sort="—"rank"—">Pos.</th><th data-sort="—"country"—">PaÃ­s</th><th data-sort="—"score"—">PuntuaciÃ³n</th><th data-sort="—"rankWorld"—">Rank Mundial</th>`;
  if (showComp) {
    components.forEach(c => { thHtml += `<th data-sort="—"${esc(c)}"—">${esc(c)}</th>`; });
  }
  thHtml += `<th data-sort="—"group"—">Grupo</th>`;

  let compData = {};
  if (showComp) {
    components.forEach(comp => {
      store.raw
        .filter(r => r['ÃÍndice'] === state.index && r['EdiciÃ³n'] === state.edition && r['Componente corto'] === comp && r.isCountry === 'SI')
        .forEach(r => {
          if (!compData[r.ISO3]) compData[r.ISO3] = {};
          compData[r.ISO3][comp] = r['PuntuaciÃ³n'];
        });
    });
  }

  let tbodyHtml = '';
  filtered.forEach((r, i) => {
    let rowHtml = `<td class="—"col-rank"—">${i+1}</td>`;
    rowHtml += `<td><div class="—"col-country"—"><img class="—"col-flag"—" src="—"${flagUrl(r.iso3)}"—" alt="—""—" loading="—"lazy"—"> ${esc(r.country)}</div></td>`;
    rowHtml += `<td class="—"col-score"—">${fmt(r.score, meta.scaleMax)}</td>`;
    rowHtml += `<td class="—"col-rank"—">${r.rank || 'â€”'}</td>`;
    if (showComp) {
      components.forEach(c => {
        const val = compData[r.iso3]?.[c];
        rowHtml += `<td>${val != null ? fmt(val, meta.scaleMax) : 'â€”'}</td>`;
      });
    }
    rowHtml += `<td>${getGroupBadge(r.group)}</td>`;
    tbodyHtml += `<tr data-iso="—"${r.iso3}"—">${rowHtml}</tr>`;
  });

  card.innerHTML = `
    <div class="—"ind-table-head"—">
      <h3 class="—"ind-table-title"—">Tabla completa</h3>
    </div>
    <div class="—"ind-table-wrap"—">
      <table class="—"ind-table"—">
        <thead><tr>${thHtml}</tr></thead>
        <tbody>${tbodyHtml}</tbody>
      </table>
    </div>
  `;

  card.querySelectorAll('tbody tr[data-iso]').forEach(el => {
    el.addEventListener('click', () => openDrawer(el.dataset.iso));
  });

  card.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.sort;
      if (state.sortCol === col) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      else { state.sortCol = col; state.sortDir = 'desc'; }
      renderApp();
    });
  });
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   COMPARISON VIEW
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function renderCompareView(container) {
  if (!state.compareYearFrom) {
    const eds = store.getEditions(state.index);
    state.compareYearFrom = eds[eds.length - 1] || 2020;
    state.compareYearTo = eds[0] || 2025;
  }

  container.innerHTML = `
    <div class="—"ind-compare-selector"—">
      <div class="—"ind-compare-row"—">
        <div class="—"ind-compare-countries-wrap"—" style="—"position:relative"—">
          <div class="—"ind-compare-countries-label"—">PaÃ­ses a comparar (mÃ­n. 2, mÃ¡x. 8)</div>
          <div class="—"ind-compare-tags"—" id="—"compare-tags-box"—">
            ${state.compareCountries.map((iso,i) => buildCompareTag(iso, i)).join('')}
            <input class="—"ind-compare-add-input"—" id="—"compare-input"—" placeholder="—"Buscar paÃ­s y pulsar introâ€¦"—" autocomplete="—"off"—">
          </div>
          <div class="—"ind-country-suggestions hidden"—" id="—"compare-suggestions"—"></div>
        </div>
      </div>
    </div>
    <div id="—"compare-results"—"></div>
  `;

  initCompareInput();

  if (state.compareCountries.length >= 0) renderCompareResults();
}

function getAllYears() { return [...new Set(store.raw.map(r=>r['EdiciÃ³n']))].sort((a,b)=>a-b); }

function buildCompareTag(iso3, idx) {
  const name = store.isoToName[iso3] || iso3;
  const color = COUNTRY_COLORS[idx % COUNTRY_COLORS.length];
  return `
    <span class="—"ind-compare-tag"—" style="—"background:${color}"—" data-iso="—"${iso3}"—">
      <img src="—"${flagUrl(iso3)}"—" alt="—""—">
      ${esc(name)}
      <button class="—"ind-compare-tag-remove"—" data-remove="—"${iso3}"—" title="—"Quitar"—">&times;</button>
    </span>
  `;
}

function initCompareInput() {
  const input = $('#compare-input');
  const sugBox = $('#compare-suggestions');
  const tagsBox = $('#compare-tags-box');
  if (!input || !sugBox || !tagsBox) return;

  tagsBox.querySelectorAll('.ind-compare-tag-remove').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const iso = btn.dataset.remove;
      state.compareCountries = state.compareCountries.filter(c => c !== iso);
      renderApp();
    });
  });

  tagsBox.addEventListener('click', () => input.focus());

  let focusIdx = -1;

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 1) { sugBox.classList.add('hidden'); return; }
    const matches = store.countries
      .filter(c => c.toLowerCase().includes(q) || (store.countryISO[c]||'').toLowerCase().includes(q))
      .filter(c => !state.compareCountries.includes(store.countryISO[c]))
      .slice(0, 10);
    if (!matches.length) { sugBox.classList.add('hidden'); return; }
    focusIdx = -1;
    sugBox.innerHTML = matches.map(c => `
      <div class="—"ind-country-suggestion"—" data-iso="—"${store.countryISO[c]}"—">
        <img src="—"${flagUrl(store.countryISO[c])}"—" alt="—""—" loading="—"lazy"—"> ${esc(c)}
      </div>
    `).join('');
    sugBox.classList.remove('hidden');
    sugBox.querySelectorAll('.ind-country-suggestion').forEach(el => {
      el.addEventListener('click', () => addCompareCountry(el.dataset.iso));
    });
  });

  input.addEventListener('keydown', e => {
    const items = sugBox.querySelectorAll('.ind-country-suggestion');
    if (e.key === 'ArrowDown') { e.preventDefault(); focusIdx = Math.min(focusIdx+1, items.length-1); updateSugFocus(items, focusIdx); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); focusIdx = Math.max(focusIdx-1, 0); updateSugFocus(items, focusIdx); }
    else if (e.key === 'Enter' && focusIdx >= 0 && items[focusIdx]) { e.preventDefault(); addCompareCountry(items[focusIdx].dataset.iso); }
    else if (e.key === 'Enter' && input.value.trim() !== '') { 
      // Fast add first match if enter
      if (items.length > 0) addCompareCountry(items[0].dataset.iso);
      e.preventDefault(); 
    }
    else if (e.key === 'Escape') { sugBox.classList.add('hidden'); }
  });

  document.addEventListener('click', e => {
    if (!sugBox.contains(e.target) && e.target !== input) sugBox.classList.add('hidden');
  });
}

function updateSugFocus(items, idx) {
  items.forEach((el, i) => el.classList.toggle('is-focused', i === idx));
}

function addCompareCountry(iso3) {
  if (state.compareCountries.length >= 8 || state.compareCountries.includes(iso3)) return;
  state.compareCountries.push(iso3);
  renderApp();
}

function renderCompareResults() {
  const container = $('#compare-results');
  if (!container) return;

  const isos = state.compareCountries;
  if (isos.length < 2) {
    container.innerHTML = `
      <div class="—"ind-compare-empty-state"—">
        <svg viewBox="—"0 0 24 24"—" width="—"60"—" height="—"60"—" stroke="—"#009ade"—" stroke-width="—"1.5"—" fill="—"none"—" style="—"margin:0 auto 1rem"—"><path d="—"M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z"—"/></svg>
        <h3>AnÃ¡lisis y Batalla de MÃ©tricas</h3>
        <p>AÃ±ade al menos dos paÃ­ses desde el selector superior para desplegar la comparativa.</p>
      </div>`;
    return;
  }

  // Legend
  let legendHtml = `<div class="—"ind-compare-legend"—">`;
  isos.forEach((iso, i) => {
    const name = store.isoToName[iso] || iso;
    const color = COUNTRY_COLORS[i % COUNTRY_COLORS.length];
    legendHtml += `<div class="—"ind-compare-legend-item"—"><span class="—"ind-compare-legend-dot"—" style="—"background:${color}"—"></span>${esc(name)}</div>`;
  });
  legendHtml += `</div>`;

  let layoutHtml = `<div class="—"ind-compare-impact-layout"—">`;

  // Radar Container
  layoutHtml += `
    <div class="—"ind-radar-container"—">
      <h3 class="—"ind-chart-title"—">DesempeÃ±o Global</h3>
      <p class="—"ind-chart-subtitle"—">AnÃ¡lisis multidimensional de las mÃ©tricas principales</p>
      <div style="—"position:relative;height:500px;width:100%;margin-top:1rem;"—"><canvas id="—"compare-radar-chart"—"></canvas></div>
    </div>
  `;

  // Heat Matrix Table
  layoutHtml += `
    <div class="—"ind-compare-heat-matrix"—">
      <h3 class="—"ind-chart-title"—" style="—"color:#fff;margin-bottom:.5rem;"—">Matriz de AdopciÃ³n (Heatmap)</h3>
      <table class="—"ind-compare-heat-table"—">
        <thead>
          <tr>
            <th class="—"row-header"—">ÃÍndices Digitales</th>
            ${isos.map((iso, i) => `<th style="—"color: ${COUNTRY_COLORS[i % COUNTRY_COLORS.length]}"—">${esc(store.isoToName[iso] || iso)}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
  `;

  const radarLabels = [];
  const radarDatasets = isos.map((iso, i) => ({
    label: store.isoToName[iso] || iso,
    data: [],
    backgroundColor: hexToRgba(COUNTRY_COLORS[i % COUNTRY_COLORS.length], 0.15),
    borderColor: COUNTRY_COLORS[i % COUNTRY_COLORS.length],
    pointBackgroundColor: COUNTRY_COLORS[i % COUNTRY_COLORS.length],
    pointHoverBorderColor: '#fff',
    borderWidth: 2,
    pointRadius: 4,
    pointHoverRadius: 6
  }));

  store.iÍndicesSorted.forEach(idx => {
    const meta = INDEX_META[idx];
    const latestEd = store.getLatestEdition(idx);
    if (!latestEd) return;
    
    radarLabels.push(meta.shortName);
    
    layoutHtml += `<tr><th class="—"row-header"—">${esc(meta.shortName)} <span style="—"font-size:0.7rem;font-weight:400;display:block;opacity:0.6"—">${latestEd}</span></th>`;
    
    isos.forEach((iso, i) => {
      const ranking = store.getRanking(idx, latestEd);
      const entry = ranking.find(r => r.iso3 === iso);
      const val = entry?.score;
      const normalized = val != null ? val / meta.scaleMax : 0;
      
      radarDatasets[i].data.push(normalized);
      
      let bg = 'rgba(255,255,255,0.05)';
      let text = 'N/A';
      if (val != null) {
        text = fmt(val, meta.scaleMax);
        // Heat distribution: low = dark/transparent, high = saturated
        const opacity = 0.2 + (0.8 * normalized);
        bg = hexToRgba(COUNTRY_COLORS[i % COUNTRY_COLORS.length], opacity);
      }
      
      layoutHtml += `<td class="—"ind-compare-heat-cell"—" style="—"background:${bg}"—" title="—"${esc(store.isoToName[iso]||iso)} - ${esc(meta.shortName)}: ${text}"—">${text}</td>`;
    });
    layoutHtml += `</tr>`;
  });
  
  layoutHtml += `</tbody></table></div></div>`;
  container.innerHTML = legendHtml + layoutHtml;

  // Initialize Radar Chart
  setTimeout(() => {
    const ctx = document.getElementById('compare-radar-chart')?.getContext('2d');
    if (ctx && window.Chart) {
      if (window._compareRadarInstance) window._compareRadarInstance.destroy();
      window._compareRadarInstance = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: radarLabels,
          datasets: radarDatasets
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: {
            r: {
              min: 0, max: 1,
              ticks: { display: false, backdropColor: 'transparent' },
              pointLabels: { font: { size: 12, weight: '700', family: "—"'Inter', sans-serif"—" }, color: '#3a5169' },
              grid: { color: 'rgba(0,30,56,0.08)' },
              angleLines: { color: 'rgba(0,30,56,0.1)' },
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                 title: items => items[0]?.label || '',
                 label: context => `${context.dataset.label}: ${(context.raw * 100).toFixed(1)}% mÃ¡x.`
              }
            }
          }
        }
      });
    }
  }, 100);
}

function hexToRgba(hex, alpha) {
  let c;
  if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
      c= hex.substring(1).split('');
      if(c.length== 3){ c= [c[0], c[0], c[1], c[1], c[2], c[2]]; }
      c= '0x'+c.join('');
      return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+alpha+')';
  }
  return `rgba(0,0,0,${alpha})`;
}


/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   COUNTRY DRAWER
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function openDrawer(iso3) {
  state.drawerIso = iso3;
  const overlay = $('#drawer-overlay');
  const drawer = $('#drawer');
  if (!overlay || !drawer) return;

  overlay.classList.remove('hidden');
  // Force reflow so display:block is committed before transition starts
  overlay.offsetHeight;
  overlay.classList.add('is-open');
  drawer.classList.add('is-open');

  renderDrawerContent(iso3);
}

function closeDrawer() {
  const overlay = $('#drawer-overlay');
  const drawer = $('#drawer');
  if (!overlay || !drawer) return;
  overlay.classList.remove('is-open');
  drawer.classList.remove('is-open');
  setTimeout(() => overlay.classList.add('hidden'), 350);
  state.drawerIso = null;
}

function renderDrawerContent(iso3) {
  const body = $('#drawer-body');
  const headFlag = $('#drawer-flag');
  const headName = $('#drawer-country-name');
  if (!body) return;

  const name = store.isoToName[iso3] || iso3;
  if (headFlag) headFlag.src = flagUrl(iso3, 'w80');
  if (headName) headName.textContent = name;

  const profile = store.getCountryProfile(iso3);

  let html = `<div class="—"ind-drawer-section"—">
    <div class="—"ind-drawer-section-title"—">Posicionamiento en Ã­Índices</div>
    <div class="—"ind-drawer-index-list"—">`;

  store.iÍndicesSorted.forEach(idx => {
    const meta = INDEX_META[idx];
    const data = profile[idx];
    if (!data?.entry) {
      html += `<div class="—"ind-drawer-index-card"—"><div><div class="—"ind-drawer-idx-name"—">${esc(meta.shortName)}</div><div class="—"ind-drawer-idx-org"—">${esc(meta.org)}</div></div><div class="—"ind-drawer-empty"—">Sin datos</div></div>`;
      return;
    }
    const e = data.entry;
    const pct = meta.scaleMax > 0 ? (e.score / meta.scaleMax * 100) : 0;
    html += `
      <div class="—"ind-drawer-index-card"—">
        <div>
          <div class="—"ind-drawer-idx-name"—">${esc(meta.shortName)}</div>
          <div class="—"ind-drawer-idx-org"—">${esc(meta.org)} Â· ${data.edition}</div>
        </div>
        <div>
          <div class="—"ind-drawer-idx-score"—">${fmt(e.score, meta.scaleMax)}</div>
          <div class="—"ind-drawer-idx-rank"—">${e.rank ? `#${e.rank} mundial` : ''} Â· ${data.rankPosition}/${data.totalCountries} ALC</div>
        </div>
        <div class="—"ind-drawer-mini-bar"—">
          <div class="—"ind-drawer-mini-bar-fill"—" style="—"width:${pct}%;background:${meta.color}"—"></div>
        </div>
      </div>
    `;
  });
  html += `</div></div>`;

  // Benchmarks comparison
  html += `<div class="—"ind-drawer-section"—">
    <div class="—"ind-drawer-section-title"—">ComparaciÃ³n con benchmarks</div>`;

  store.iÍndicesSorted.forEach(idx => {
    const meta = INDEX_META[idx];
    const data = profile[idx];
    if (!data?.entry) return;
    const bm = data.benchmarks;
    const score = data.entry.score;

    html += `<div style="—"margin-bottom:.6rem"—"><span style="—"font-size:.72rem;font-weight:800"—">${esc(meta.shortName)}</span>`;
    html += `<div style="—"display:flex;gap:.5rem;margin-top:.2rem;flex-wrap:wrap"—">`;
    if (bm.alc != null) {
      const diff = score - bm.alc;
      const color = diff >= 0 ? '#2e8b57' : '#c94c4c';
      html += `<span style="—"font-size:.68rem;font-weight:700;color:${color}"—">vs ALC: ${diff>=0?'+':''}${fmt(diff, meta.scaleMax)}</span>`;
    }
    if (bm.ocde != null) {
      const diff = score - bm.ocde;
      const color = diff >= 0 ? '#2e8b57' : '#c94c4c';
      html += `<span style="—"font-size:.68rem;font-weight:700;color:${color}"—">vs OCDE: ${diff>=0?'+':''}${fmt(diff, meta.scaleMax)}</span>`;
    }
    if (bm.world != null) {
      const diff = score - bm.world;
      const color = diff >= 0 ? '#2e8b57' : '#c94c4c';
      html += `<span style="—"font-size:.68rem;font-weight:700;color:${color}"—">vs Mundial: ${diff>=0?'+':''}${fmt(diff, meta.scaleMax)}</span>`;
    }
    html += `</div></div>`;
  });
  html += `</div>`;

  // Evolution sparklines
  html += `<div class="—"ind-drawer-section"—">
    <div class="—"ind-drawer-section-title"—">EvoluciÃ³n temporal</div>`;

  store.iÍndicesSorted.forEach(idx => {
    const meta = INDEX_META[idx];
    const series = store.getTimeSeries(iso3, idx);
    if (!series.length) return;
    const maxVal = meta.scaleMax;
    const sparkMax = Math.max(...series.map(s => s.score));
    html += `<div style="—"margin-bottom:.6rem"—">
      <span style="—"font-size:.72rem;font-weight:800"—">${esc(meta.shortName)}</span>
      <div style="—"display:flex;align-items:end;gap:2px;height:28px;margin-top:.15rem"—">`;
    series.forEach(s => {
      const h = maxVal > 0 ? (s.score / maxVal * 100) : 0;
      html += `<div title="—"${s.year}: ${fmt(s.score, maxVal)}"—" style="—"flex:1;height:${Math.max(h, 3)}%;background:${meta.color};border-radius:2px 2px 0 0;min-width:4px;max-width:24px;opacity:.7;transition:opacity .15s"—" onmouseover="—"this.style.opacity=1"—" onmouseout="—"this.style.opacity=.7"—"></div>`;
    });
    html += `</div>
      <div style="—"display:flex;justify-content:space-between;font-size:.55rem;color:var(--ind-text-4);font-weight:600"—">
        <span>${series[0].year}</span><span>${series[series.length-1].year}</span>
      </div>
    </div>`;
  });
  html += `</div>`;

  // Link to full ficha
  html += `<div class="—"ind-drawer-section"—" style="—"text-align:center"—">
    <a href="—"/ficha.html?country=${iso3}#gov-section"—" class="—"ind-drawer-link"—">
      <svg viewBox="—"0 0 24 24"—" fill="—"none"—" stroke="—"currentColor"—" stroke-width="—"2"—"><path d="—"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"—"/><polyline points="—"15 3 21 3 21 9"—"/><line x1="—"10"—" y1="—"14"—" x2="—"21"—" y2="—"3"—"/></svg>
      Ver ficha completa del paÃ­s
    </a>
  </div>`;

  body.innerHTML = html;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   METHODOLOGY MODAL
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function openMethodology() {
  const overlay = $('#methodology-overlay');
  if (!overlay) return;
  overlay.classList.remove('hidden');
  overlay.offsetHeight; // force reflow
  overlay.classList.add('is-open');
  renderMethodologyContent();
}

function closeMethodology() {
  const overlay = $('#methodology-overlay');
  if (!overlay) return;
  overlay.classList.remove('is-open');
  setTimeout(() => overlay.classList.add('hidden'), 350);
}

function renderMethodologyContent() {
  const body = $('#methodology-body');
  if (!body) return;

  let html = '';
  store.iÍndicesSorted.forEach(idx => {
    const meta = INDEX_META[idx];
    const metData = store.getMetodologia(idx);
    const srcData = store.getFuentes(idx);
    const editions = store.getEditions(idx);
    const components = [];
    const latestEd = store.getLatestEdition(idx);
    if (latestEd) {
      const comps = store.getComponents(idx, latestEd);
      comps.forEach(c => components.push(c));
    }

    let descText = meta.desc;
    const descRow = metData.find(r => r.Aspecto === 'DescripciÃ³n');
    if (descRow) descText = descRow.Detalle;

    html += `
      <div class="—"ind-modal-index-card"—" style="—"--idx-color:${meta.color}"—">
        <div class="—"ind-modal-idx-name"—">${esc(meta.name)}</div>
        <div class="—"ind-modal-idx-org"—">${esc(meta.org)}</div>
        <div class="—"ind-modal-idx-desc"—">${esc(descText)}</div>
        <div class="—"ind-modal-idx-meta"—">
          <div class="—"ind-modal-idx-meta-item"—"><strong>Ediciones:</strong> ${editions.join(', ')}</div>
          <div class="—"ind-modal-idx-meta-item"—"><strong>Escala:</strong> 0 â€“ ${meta.scaleMax}</div>
        </div>
        ${components.length ? `
          <div style="—"margin-bottom:.4rem"—">
            <span style="—"font-size:.62rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--ind-text-4)"—">Componentes / Pilares</span>
          </div>
          <div class="—"ind-modal-idx-components"—">${components.map(c=>`<span class="—"ind-modal-idx-comp"—">${esc(c)}</span>`).join('')}</div>
        ` : ''}
        ${srcData.length ? `
          <div style="—"margin-top:.5rem"—">
            ${srcData.map(s=>`
              <a class="—"ind-modal-idx-link"—" href="—"${esc(s.URL)}"—" target="—"_blank"—" rel="—"noopener"—">
                <svg viewBox="—"0 0 24 24"—" fill="—"none"—" stroke="—"currentColor"—" stroke-width="—"2"—"><path d="—"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"—"/><polyline points="—"15 3 21 3 21 9"—"/><line x1="—"10"—" y1="—"14"—" x2="—"21"—" y2="—"3"—"/></svg>
                ${esc(s.Fuente)} (${esc(s['EdiciÃ³n'])})
              </a>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  });

  body.innerHTML = html;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   EXPORT
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function getExportData() {
  const meta = INDEX_META[state.index];
  if (state.view === 'ranking') {
    const ranking = store.getRanking(state.index, state.edition);
    let filtered = ranking;
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      filtered = ranking.filter(r => r.country.toLowerCase().includes(q) || r.iso3.toLowerCase().includes(q));
    }
    return {
      filename: `OGDILAC_Ranking_${meta.shortName}_${state.edition}`,
      data: filtered.map((r, i) => ({
        PosiciÃ³n: i + 1,
        PaÃ­s: r.country,
        ISO3: r.iso3,
        ÃÍndice: meta.shortName,
        EdiciÃ³n: state.edition,
        PuntuaciÃ³n: r.score,
        'Ranking Mundial': r.rank || '',
        Grupo: r.group || '',
      })),
    };
  } else {
    const rows = [];
    state.compareCountries.forEach(iso => {
      const name = store.isoToName[iso] || iso;
      store.iÍndicesSorted.forEach(idx => {
        const m = INDEX_META[idx];
        const latestEd = store.getLatestEdition(idx);
        if (!latestEd) return;
        const ranking = store.getRanking(idx, latestEd);
        const entry = ranking.find(r => r.iso3 === iso);
        rows.push({
          PaÃ­s: name,
          ISO3: iso,
          ÃÍndice: m.shortName,
          EdiciÃ³n: latestEd,
          PuntuaciÃ³n: entry?.score ?? '',
          'Ranking Mundial': entry?.rank ?? '',
          Grupo: entry?.group ?? '',
        });
      });
    });
    return {
      filename: `OGDILAC_Comparativa_${state.compareCountries.join('-')}`,
      data: rows,
    };
  }
}

function exportXLSX() {
  if (typeof XLSX === 'undefined') { alert('LibrerÃ­a XLSX no cargada'); return; }
  const { filename, data } = getExportData();
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Datos');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

function exportCSV() {
  const { filename, data } = getExportData();
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const bom = '\uFEFF';
  const csv = bom + headers.join(',') + '\n' + data.map(r => headers.map(h => {
    let v = String(r[h] ?? '');
    if (v.includes(',') || v.includes('"—"') || v.includes('\n')) v = `"—"${v.replace(/"—"/g,'"—""—"')}"—"`;
    return v;
  }).join(',')).join('\n');
  downloadBlob(csv, `${filename}.csv`, 'text/csv;charset=utf-8');
}

function exportJSON() {
  const { filename, data } = getExportData();
  const json = JSON.stringify(data, null, 2);
  downloadBlob(json, `${filename}.json`, 'application/json');
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   INITIALIZATION
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
async function init() {
  syncStateFromURL();

  try {
    const [rawRes, metRes, srcRes, countriesRes] = await Promise.all([
      fetch('/data/iÍndices_data.json'),
      fetch('/data/iÍndices_metodologia.json'),
      fetch('/data/iÍndices_fuentes.json'),
      fetch('/api/countries').catch(() => null) // Fallback if API fails
    ]);
    const raw = await rawRes.json();
    const met = await metRes.json();
    const src = await srcRes.json();
    const countries = countriesRes ? await countriesRes.json() : [];

    // Build numeric mapping for heatmap
    countries.forEach(c => {
      if (c.numericId) numericToIso[Number(c.numericId)] = c.iso3;
    });

    store = new DataStore(raw, met, src);
  } catch (err) {
    console.error('Error loading data:', err);
    const main = $('#ind-content');
    if (main) main.innerHTML = `<div class="—"ind-empty-state"—"><div class="—"ind-empty-icon"—">âš ï¸</div><h3 class="—"ind-empty-title"—">Error al cargar los datos</h3><p class="—"ind-empty-text"—">${esc(err.message)}</p></div>`;
    return;
  }

  const loading = $('#ind-loading');
  if (loading) loading.classList.add('hidden');
  const content = $('#ind-content');
  if (content) content.classList.remove('hidden');

  renderApp();
  bindGlobalEvents();
}

function bindGlobalEvents() {
  // View tabs
  $$('.ind-view-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      state.view = tab.dataset.view;
      renderApp();
    });
  });

  // Index filter
  document.addEventListener('click', e => {
    const btn = e.target.closest('.ind-index-btn');
    if (btn) {
      state.index = btn.dataset.index;
      state.edition = null;
      state.rankingMode = 'global';
      state.selectedComponent = 'General';
      state.sortCol = null;
      renderApp();
    }

    const toggleBtn = e.target.closest('.ind-toggle-btn');
    if (toggleBtn) {
      state.rankingMode = toggleBtn.dataset.mode;
      if (state.rankingMode === 'component') {
        const comps = store.getComponents(state.index, state.edition);
        if (comps.length > 0 && !comps.includes(state.selectedComponent)) {
          state.selectedComponent = comps[0];
        }
      }
      renderApp();
    }
  });

  document.addEventListener('change', e => {
    if (e.target.id === 'filter-edition' || e.target.id === 'chart-edition-select') {
      state.edition = Number(e.target.value);
      state.sortCol = null;
      renderApp();
    }
    if (e.target.id === 'chart-component-select') {
      state.selectedComponent = e.target.value;
      renderApp();
    }
  });

  // Search
  document.addEventListener('input', e => {
    if (e.target.id === 'filter-search') {
      state.searchQuery = e.target.value;
      renderApp();
    }
  });

  // Components toggle
  $('#filter-components')?.addEventListener('click', () => {
    state.showComponents = !state.showComponents;
    renderApp();
  });

  // Drawer close
  $('#drawer-overlay')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeDrawer();
  });
  $('#drawer-close')?.addEventListener('click', closeDrawer);

  // Methodology
  $('#btn-methodology')?.addEventListener('click', openMethodology);
  $('#methodology-overlay')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeMethodology();
  });
  $('#methodology-close')?.addEventListener('click', closeMethodology);

  // Export dropdown
  const exportWrap = $('#export-wrap');
  const exportDrop = $('#export-dropdown');
  if (exportWrap && exportDrop) {
    exportWrap.querySelector('.ind-toolbar-btn')?.addEventListener('click', () => {
      exportDrop.classList.toggle('hidden');
    });
    document.addEventListener('click', e => {
      if (!exportWrap.contains(e.target)) exportDrop.classList.add('hidden');
    });
  }

  $('#export-xlsx')?.addEventListener('click', () => { exportXLSX(); $('#export-dropdown')?.classList.add('hidden'); });
  $('#export-csv')?.addEventListener('click', () => { exportCSV(); $('#export-dropdown')?.classList.add('hidden'); });
  $('#export-json')?.addEventListener('click', () => { exportJSON(); $('#export-dropdown')?.classList.add('hidden'); });

  // Keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeDrawer();
      closeMethodology();
      $('#export-dropdown')?.classList.add('hidden');
    }
  });
}

// Boot
document.addEventListener('DOMContentLoaded', init);
