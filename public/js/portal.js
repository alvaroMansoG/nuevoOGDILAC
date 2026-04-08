/* OGDILAC portal interactions */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ISO2_BY_ISO3 = {
    ARG:'ar',BOL:'bo',BRA:'br',CHL:'cl',COL:'co',CRI:'cr',DOM:'do',
    ECU:'ec',SLV:'sv',GTM:'gt',HTI:'ht',HND:'hn',JAM:'jm',MEX:'mx',
    NIC:'ni',PAN:'pa',PRY:'py',PER:'pe',TTO:'tt',URY:'uy',VEN:'ve',
    GUY:'gy',SUR:'sr',BLZ:'bz',BHS:'bs',BRB:'bb'
  };

  const BID_REGION_ORDER = ['Cono Sur', 'Grupo Andino', 'Centroamérica y México', 'Caribe'];

  function normalizeId(id) { return String(id).padStart(3, '0'); }

  function getFlagUrl(iso3, size) {
    const iso2 = ISO2_BY_ISO3[iso3] || 'xx';
    return `https://flagcdn.com/${size || 'w80'}/${iso2}.png`;
  }

  function fixText(str) {
    const el = document.createElement('span');
    el.innerHTML = str || '';
    return el.textContent || '';
  }

  /* ── (IDB corporate header is injected externally) ── */

  /* ── Smooth scroll ── */
  const portalStickyNav = document.querySelector('.section-nav-bar--portal');
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const base = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) || 0;
      const navH = portalStickyNav ? portalStickyNav.offsetHeight : 0;
      const pad = 12;
      const offset = id === 'hero' ? base + pad : base + pad + navH;
      window.scrollTo({ top: Math.max(0, target.offsetTop - offset), behavior: 'smooth' });
    });
  });

  /* ── Reveal on scroll ── */
  if (!prefersReducedMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    ['.countries-layout', '.ind-card', '.content-group', '.hero-inner'].forEach((sel) => {
      $$(sel).forEach((el) => {
        el.classList.add('reveal');
        observer.observe(el);
      });
    });
  }

  /* ── Hero parallax ── */
  if (!prefersReducedMotion) {
    const heroGrid = $('.hero-grid');
    const glow1 = $('.hero-glow-1');
    const glow2 = $('.hero-glow-2');
    if (heroGrid && glow1 && glow2) {
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            const y = window.scrollY * 0.3;
            heroGrid.style.transform = `translateY(${y * 0.15}px)`;
            glow1.style.transform = `translate(${y * -0.08}px, ${y * 0.12}px)`;
            glow2.style.transform = `translate(${y * 0.06}px, ${y * -0.1}px)`;
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    }
  }

  /* ═══════════════════════════════════════════
     Countries selector + interactive map
     ═══════════════════════════════════════════ */
  async function initCountriesSelectorMap() {
    const selectEl = $('#portal-country-select');
    const trigger = $('#portal-country-picker-trigger');
    const triggerText = $('#portal-country-picker-trigger-text');
    const panel = $('#portal-country-picker-panel');
    const mapContainer = $('#portal-map-container');
    const mapPlaceholder = $('#portal-map-placeholder');
    if (!selectEl || !trigger || !triggerText || !panel || !mapContainer) return;

    let countries = [];
    let numericToIso = {};
    let activeIso = '';

    try {
      const res = await fetch('/api/countries');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      countries = await res.json();
    } catch (err) {
      console.error('Failed to load countries:', err);
      if (mapPlaceholder) mapPlaceholder.innerHTML = '<p>Error al cargar países.</p>';
      return;
    }

    countries.forEach((c) => {
      numericToIso[normalizeId(c.numericId)] = c.iso3;
    });

    const latamNumericIds = new Set(countries.map((c) => normalizeId(c.numericId)));

    /* ── Panel helpers ── */
    function closePanel() {
      panel.classList.add('hidden');
      trigger.setAttribute('aria-expanded', 'false');
    }

    function setActive(iso3) {
      activeIso = iso3;
      const selected = countries.find((c) => c.iso3 === iso3);
      triggerText.textContent = selected ? fixText(selected.name) : '— Elige un país —';
      selectEl.value = selected ? selected.iso3 : '';

      panel.querySelectorAll('.country-picker-card').forEach((el) => {
        el.classList.toggle('active', el.dataset.iso === iso3);
      });
      mapContainer.querySelectorAll('.portal-country-path').forEach((el) => {
        el.classList.toggle('is-active', el.dataset.iso3 === iso3);
      });
    }

    /* ── Populate <select> ── */
    selectEl.innerHTML = '<option value="">\u2014 Elige un país \u2014</option>';
    countries.forEach((country) => {
      const option = document.createElement('option');
      option.value = country.iso3;
      option.textContent = fixText(country.name);
      selectEl.appendChild(option);
    });

    /* ── Render picker panel with flag cards grouped by BID region ── */
    const grouped = BID_REGION_ORDER.map((region) => ({
      region,
      countries: countries.filter((c) => c.bidRegion === region),
    })).filter((g) => g.countries.length);

    const regionFlagPills = countries.map((c) => {
      const iso2 = (ISO2_BY_ISO3[c.iso3] || c.iso3).toUpperCase();
      return `<span class="picker-region-pill" title="${fixText(c.name)}" aria-hidden="true">
        <img class="picker-region-pill-flag" src="${getFlagUrl(c.iso3, 'w40')}" alt="" loading="lazy" />
        <span class="picker-region-pill-code">${iso2}</span>
      </span>`;
    }).join('');

    panel.innerHTML = `
      <section class="country-picker-group country-picker-group-region">
        <h3 class="country-picker-group-title">Agregado regional</h3>
        <button type="button" class="country-picker-card country-picker-card-region" data-iso="ALC">
          <span class="country-picker-region-icon" aria-hidden="true">\uD83C\uDF0E</span>
          <span class="country-picker-region-name">América Latina y el Caribe</span>
          <span class="country-picker-region-flags">${regionFlagPills}</span>
        </button>
      </section>
      ${grouped.map(({ region, countries: regionCountries }) => `
        <section class="country-picker-group">
          <h3 class="country-picker-group-title">${fixText(region)}</h3>
          <div class="country-picker-grid">
            ${regionCountries.map((country) => `
              <button type="button" class="country-picker-card" data-iso="${country.iso3}">
                <img class="country-picker-flag" src="${getFlagUrl(country.iso3)}" alt="Bandera de ${fixText(country.name)}" loading="lazy" />
                <span class="country-picker-name">${fixText(country.name)}</span>
                <span class="country-picker-chevron" aria-hidden="true">&#8250;</span>
              </button>
            `).join('')}
          </div>
        </section>
      `).join('')}
    `;

    function goToFicha(iso3) {
      window.location.href = `/ficha.html?country=${iso3}`;
    }

    /* ── Card click → navigate to ficha ── */
    panel.querySelectorAll('.country-picker-card').forEach((card) => {
      card.addEventListener('click', () => goToFicha(card.dataset.iso));
    });

    /* ── Trigger toggle ── */
    trigger.addEventListener('click', () => {
      const open = trigger.getAttribute('aria-expanded') === 'true';
      if (open) closePanel();
      else {
        panel.classList.remove('hidden');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });

    selectEl.addEventListener('change', () => {
      if (selectEl.value) goToFicha(selectEl.value);
    });

    document.addEventListener('click', (event) => {
      const picker = $('#portal-country-picker');
      if (picker && !picker.contains(event.target)) closePanel();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closePanel();
    });

    /* ── D3 Map ── */
    if (!window.d3 || !window.topojson) {
      if (mapPlaceholder) mapPlaceholder.innerHTML = '<p>No se pudo cargar el mapa.</p>';
      return;
    }

    try {
      const world = await window.d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json');
      const allFeatures = window.topojson.feature(world, world.objects.countries).features;
      const latamFeatures = allFeatures.filter((f) => latamNumericIds.has(normalizeId(f.id)));

      const contextFeatures = allFeatures.filter((f) => {
        if (latamNumericIds.has(normalizeId(f.id))) return false;
        const centroid = window.d3.geoCentroid(f);
        return centroid[0] > -120 && centroid[0] < -30 && centroid[1] > -60 && centroid[1] < 38;
      });

      const width = mapContainer.clientWidth || 560;
      const height = Math.max(420, Math.round(width * 0.9));

      const projection = window.d3.geoMercator()
        .fitExtent([[16, 12], [width - 16, height - 12]], {
          type: 'FeatureCollection', features: latamFeatures,
        });
      const path = window.d3.geoPath().projection(projection);

      const svg = window.d3.select(mapContainer).append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

      svg.append('g')
        .selectAll('path')
        .data(contextFeatures)
        .join('path')
        .attr('class', 'portal-country-context')
        .attr('d', path);

      const tooltip = document.createElement('div');
      tooltip.className = 'portal-map-tooltip';
      tooltip.setAttribute('aria-hidden', 'true');
      mapContainer.appendChild(tooltip);

      function showTooltip(iso3, evt) {
        const country = countries.find((c) => c.iso3 === iso3);
        if (!country) return;
        const flagSrc = getFlagUrl(iso3, 'w40');
        const name = fixText(country.name);
        tooltip.innerHTML =
          `<img class="portal-map-tooltip-flag" src="${flagSrc}" alt="" />` +
          `<span class="portal-map-tooltip-name">${name}</span>` +
          `<span class="portal-map-tooltip-hint">Ver ficha ›</span>`;
        tooltip.classList.add('is-visible');
        positionTooltip(evt);
      }

      function positionTooltip(evt) {
        const rect = mapContainer.getBoundingClientRect();
        let x = evt.clientX - rect.left + 14;
        let y = evt.clientY - rect.top - 10;
        const tw = tooltip.offsetWidth;
        const th = tooltip.offsetHeight;
        if (x + tw > rect.width - 8) x = evt.clientX - rect.left - tw - 10;
        if (y + th > rect.height - 8) y = y - th;
        if (y < 4) y = 4;
        tooltip.style.left = x + 'px';
        tooltip.style.top = y + 'px';
      }

      function hideTooltip() {
        tooltip.classList.remove('is-visible');
      }

      svg.append('g')
        .selectAll('path')
        .data(latamFeatures)
        .join('path')
        .attr('class', 'portal-country-path')
        .attr('d', path)
        .each(function (d) {
          const nid = normalizeId(d.id);
          const iso3 = numericToIso[nid];
          if (!iso3) {
            this.classList.add('is-disabled');
            return;
          }
          this.dataset.iso3 = iso3;
          this.dataset.id = nid;
          this.addEventListener('click', () => goToFicha(iso3));
          this.addEventListener('mouseenter', (e) => showTooltip(iso3, e));
          this.addEventListener('mousemove', (e) => positionTooltip(e));
          this.addEventListener('mouseleave', hideTooltip);
        });

      const alcBtn = document.createElement('button');
      alcBtn.type = 'button';
      alcBtn.className = 'portal-map-alc-btn';
      alcBtn.innerHTML = '\uD83C\uDF0E ALC';
      alcBtn.title = 'América Latina y el Caribe — Agregado regional';
      alcBtn.addEventListener('click', () => goToFicha('ALC'));
      mapContainer.appendChild(alcBtn);

      if (mapPlaceholder) mapPlaceholder.remove();
    } catch (err) {
      console.error('Map load error:', err);
      if (mapPlaceholder) mapPlaceholder.innerHTML = '<p>No se pudo cargar el mapa.</p>';
    }
  }

  initCountriesSelectorMap();
})();
