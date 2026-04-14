const INDEX_DEFINITIONS = [
  {
    key: 'EGDI',
    slug: 'egdi',
    shortName: 'EGDI',
    name: 'Índice de Desarrollo del Gobierno Electrónico',
    org: 'Naciones Unidas',
    orgLong: 'Naciones Unidas',
    orgBadge: 'ONU',
    orgTooltip: 'Índice elaborado por Naciones Unidas.',
    tooltip: 'Índice E-Government Development Index (EGDI) de las Naciones Unidas sobre desarrollo de gobierno digital. Evalúa a partir de tres componentes: Online Service Index (OSI), que valora la disponibilidad y calidad de los servicios digitales gubernamentales; Telecommunication Infrastructure Index (TII), que mide el acceso y uso de infraestructuras TIC; y Human Capital Index (HCI), que captura el nivel educativo y las capacidades de la población.',
    color: '#2c67c7',
    scaleMax: 1,
    url: 'https://publicadministration.un.org/egovkb/en-us/Reports/UN-E-Government-Survey-2024',
    sourceLinkLabel: 'EGDI (Naciones Unidas)',
    infoCard: {
      title: 'Índice de Desarrollo del Gobierno Electrónico',
      descriptions: [
        'El E-Government Development Index (EGDI) de las Naciones Unidas es un índice compuesto que mide el nivel de desarrollo del gobierno electrónico y la capacidad de los países para utilizar tecnologías digitales en la provisión de servicios públicos.',
        'Evalúa comparativamente a 193 países a partir de tres componentes: el Online Service Index (OSI), que valora la disponibilidad y calidad de los servicios digitales gubernamentales; el Telecommunication Infrastructure Index (TII), que mide el acceso y uso de infraestructuras TIC; y el Human Capital Index (HCI), que captura el nivel educativo y las capacidades de la población.',
      ],
      source: 'Naciones Unidas',
      editions: '2003, 2004, 2005, 2008, 2010, 2012, 2014, 2016, 2018, 2020, 2022 y 2024.',
      categories: 'Muy alto (>=0,75), Alto (>=0,50), Medio (>=0,25), Bajo (<0,25).',
      link: 'https://publicadministration.un.org/egovkb/en-us/Reports/UN-E-Government-Survey-2024',
    },
    components: {
      General: 'EGDI',
      OSI: 'Online Service Index (OSI)',
      TII: 'Telecommunication Infrastructure Index (TII)',
      HCI: 'Human Capital Index (HCI)',
    },
    slugComponents: {
      General: 'EGDI',
      osi: 'Online Service Index (OSI)',
      tii: 'Telecommunication Infrastructure Index (TII)',
      hci: 'Human Capital Index (HCI)',
    },
    generalAliases: new Set([normalizeToken('general'), normalizeToken('egdi')]),
    componentAliases: {
      osi: 'OSI',
      tii: 'TII',
      hci: 'HCI',
    },
  },
  {
    key: 'GTMI',
    slug: 'gtmi',
    shortName: 'GTMI',
    name: 'Índice de Madurez GovTech',
    org: 'Banco Mundial',
    orgLong: 'Banco Mundial',
    orgBadge: 'BM',
    orgTooltip: 'Índice elaborado por el Banco Mundial.',
    tooltip: 'El GovTech Maturity Index (GTMI) del Banco Mundial ofrece una visión comparada del grado de transformación digital del sector público. Mide la madurez GovTech a partir de cuatro áreas: Sistemas centrales de gobierno e infraestructura digital compartida; Prestación de servicios públicos en línea; Participación y compromiso digital de la ciudadanía; y Habilitadores GovTech, que incluyen estrategia, instituciones, marcos legales y regulatorios, capacidades e innovación.',
    color: '#7657dd',
    scaleMax: 1,
    url: 'https://www.worldbank.org/en/programs/govtech/gtmi',
    sourceLinkLabel: 'GTMI (Banco Mundial)',
    infoCard: {
      title: 'Índice de Madurez GovTech',
      descriptions: [
        'El GovTech Maturity Index (GTMI) del Banco Mundial ofrece una visión comparada del grado de transformación digital del sector público.',
        'En su edición 2025 cubre 198 economías y mide la madurez GovTech a partir de cuatro áreas clave: sistemas centrales de gobierno e infraestructura digital compartida; prestación de servicios públicos en línea; participación y compromiso digital de la ciudadanía; y habilitadores GovTech, que incluyen estrategia, instituciones, marcos legales y regulatorios, capacidades e innovación.',
      ],
      source: 'Banco Mundial',
      editions: '2020, 2022 y 2025.',
      categories: 'Se utiliza la agrupación oficial A/B/C/D publicada en cada edición del GTMI.',
      link: 'https://www.worldbank.org/en/programs/govtech/gtmi',
    },
    components: {
      General: 'GTMI',
      CGSI: 'Sistemas centrales de gobierno e infraestructura digital compartida (CGSI)',
      PSDI: 'Prestación de servicios públicos en línea (PSDI)',
      DCEI: 'Participación y compromiso digital de la ciudadanía (DCEI)',
      GTEI: 'Habilitadores GovTech (GTEI)',
    },
    slugComponents: {
      General: 'GTMI',
      cgsi: 'Sistemas centrales de gobierno e infraestructura digital compartida (CGSI)',
      psdi: 'Prestación de servicios públicos en línea (PSDI)',
      dcei: 'Participación y compromiso digital de la ciudadanía (DCEI)',
      gtei: 'Habilitadores GovTech (GTEI)',
    },
    generalAliases: new Set([normalizeToken('general'), normalizeToken('gtmi')]),
    componentAliases: {
      cgsi: 'CGSI',
      psdi: 'PSDI',
      dcei: 'DCEI',
      cei: 'DCEI',
      gtei: 'GTEI',
    },
  },
  {
    key: 'GCI',
    slug: 'gci',
    shortName: 'Ciberseguridad',
    name: 'Índice Global de Ciberseguridad',
    org: 'Unión Internacional de Telecomunicaciones',
    orgLong: 'Unión Internacional de Telecomunicaciones',
    orgBadge: 'UIT',
    orgTooltip: 'Índice elaborado por la Unión Internacional de Telecomunicaciones.',
    tooltip: 'El Global Cybersecurity Index (GCI) de la UIT es una referencia internacional que mide el grado de compromiso de los países con la ciberseguridad. Evalúa sobre cinco pilares: Medidas legales, Medidas técnicas, Medidas organizacionales, Desarrollo de capacidades y Cooperación.',
    color: '#19896b',
    scaleMax: 100,
    url: 'https://www.itu.int/epublications/publication/global-cybersecurity-index-2024',
    sourceLinkLabel: 'Ciberseguridad (UIT)',
    infoCard: {
      title: 'Índice Global de Ciberseguridad',
      descriptions: [
        'El Global Cybersecurity Index (GCI) de la UIT es una referencia internacional que mide el grado de compromiso de los países con la ciberseguridad.',
        'Evalúa 194 países sobre cinco pilares: medidas legales, medidas técnicas, medidas organizacionales, desarrollo de capacidades y cooperación. Los resultados se agregan en una puntuación global que permite comparar países, identificar brechas y orientar políticas para fortalecer la seguridad y la confianza en el entorno digital.',
      ],
      source: 'Unión Internacional de Telecomunicaciones',
      editions: '2020 y 2024.',
      categories: 'Tiers oficiales ITU: T1 >=95, T2 >=75, T3 >=45, T4 >=20, T5 <20.',
      link: 'https://www.itu.int/epublications/publication/global-cybersecurity-index-2024',
    },
    components: {
      General: 'Ciberseguridad',
      Legal: 'Medidas legales',
      Technical: 'Medidas técnicas',
      Organizational: 'Medidas organizacionales',
      CapDev: 'Desarrollo de capacidades',
      Cooperation: 'Cooperación',
    },
    slugComponents: {
      General: 'Ciberseguridad',
      legal: 'Medidas legales',
      technical: 'Medidas técnicas',
      organizational: 'Medidas organizacionales',
      capacity: 'Desarrollo de capacidades',
      cooperation: 'Cooperación',
    },
    generalAliases: new Set([normalizeToken('general'), normalizeToken('gci')]),
    componentAliases: {
      legal: 'Legal',
      technical: 'Technical',
      organizational: 'Organizational',
      capdev: 'CapDev',
      capacity: 'CapDev',
      cooperation: 'Cooperation',
    },
  },
  {
    key: 'OCDE/BID',
    slug: 'ocde',
    shortName: 'DGI',
    name: 'Índice de Gobierno Digital para América Latina y el Caribe',
    org: 'OCDE/BID',
    orgLong: 'OCDE/BID',
    orgBadge: 'DGI',
    orgTooltip: 'Índice elaborado por la OCDE y el BID.',
    tooltip: 'El Índice de Gobierno Digital para América Latina y el Caribe de la OCDE y el BID estudia la madurez del Gobierno Digital en 23 países de la región. Se basa en seis dimensiones: Digital desde el diseño, Impulsado por los datos, Gobierno como plataforma, Apertura por defecto, Impulsado por los usuarios y Proactividad.',
    color: '#1d9db6',
    scaleMax: 1,
    url: 'https://www.oecd.org/en/publications/2023-oecd-idb-digital-government-index-of-latin-america-and-the-caribbean_10b82c83-en.html',
    sourceLinkLabel: 'DGI (OCDE/BID)',
    infoCard: {
      title: 'Índice de Gobierno Digital para América Latina y el Caribe',
      descriptions: [
        'El Índice de Gobierno Digital para América Latina y el Caribe de la OCDE y el BID estudia la madurez del Gobierno Digital en 23 países de la región.',
        'Se basa en seis dimensiones: Digital desde el diseño, Impulsado por los datos, Gobierno como plataforma, Apertura por defecto, Impulsado por los usuarios y Proactividad.',
      ],
      source: 'OCDE/BID',
      editions: '2023.',
      categories: 'Este índice no utiliza categorías.',
      link: 'https://www.oecd.org/en/publications/2023-oecd-idb-digital-government-index-of-latin-america-and-the-caribbean_10b82c83-en.html',
    },
    components: {
      General: 'DGI',
      DpD: 'Digital desde el diseño',
      Datos: 'Impulsado por los datos',
      Plataforma: 'Gobierno como plataforma',
      Abierto: 'Apertura por defecto',
      Usuario: 'Impulsado por los usuarios',
      Proactivo: 'Proactividad',
    },
    slugComponents: {
      General: 'DGI',
      dd: 'Digital desde el diseño',
      id: 'Impulsado por los datos',
      gp: 'Gobierno como plataforma',
      ad: 'Apertura por defecto',
      iu: 'Impulsado por los usuarios',
      pr: 'Proactividad',
    },
    generalAliases: new Set([normalizeToken('general'), normalizeToken('ocde/bid'), normalizeToken('dgi')]),
    componentAliases: {
      dpd: 'DpD',
      datos: 'Datos',
      plataforma: 'Plataforma',
      abierto: 'Abierto',
      usuario: 'Usuario',
      proactivo: 'Proactivo',
    },
  },
  {
    key: 'Government AI Readiness',
    slug: 'ai',
    shortName: 'Madurez IA',
    name: 'Índice de Preparación del Gobierno para la Inteligencia Artificial',
    org: 'Oxford Insights',
    orgLong: 'Oxford Insights',
    orgBadge: 'IA',
    orgTooltip: 'Índice elaborado por Oxford Insights.',
    tooltip: 'El Government AI Readiness Index de Oxford Insights evalúa la capacidad de los gobiernos para aprovechar la inteligencia artificial en beneficio del interés público.',
    color: '#dc8a25',
    scaleMax: 100,
    url: 'https://oxfordinsights.com/ai-readiness/',
    sourceLinkLabel: 'Madurez IA (Oxford Insights)',
    infoCard: {
      title: 'Índice de Preparación del Gobierno para la Inteligencia Artificial',
      descriptions: [
        'El Government AI Readiness Index de Oxford Insights evalúa la capacidad de los gobiernos para aprovechar la inteligencia artificial en beneficio del interés público.',
        'La edición 2025 cubre 195 gobiernos y utiliza una metodología actualizada que amplía el foco desde el uso de IA en servicios públicos hacia el papel más amplio del gobierno como usuario, habilitador, comprador y regulador.',
        'Para 2020-2024 se visualiza solo la puntuación general. Para 2025 se muestran la puntuación general y los seis pilares de primer nivel.',
      ],
      source: 'Oxford Insights',
      editions: '2020, 2021, 2022, 2023, 2024 y 2025.',
      categories: 'Este índice no utiliza categorías.',
      link: 'https://oxfordinsights.com/ai-readiness/',
    },
    components: {
      General: 'Madurez IA',
      PolicyCap: 'Capacidad de políticas',
      AIInfra: 'Infraestructura de IA',
      Governance: 'Gobernanza',
      PubAdopt: 'Adopción en el sector público',
      DevDiff: 'Desarrollo y difusión',
      Resilience: 'Resiliencia',
    },
    slugComponents: {
      General: 'Madurez IA',
      policyCapacity: 'Capacidad de políticas',
      aiInfrastructure: 'Infraestructura de IA',
      governance: 'Gobernanza',
      publicSectorAdoption: 'Adopción en el sector público',
      developmentDiffusion: 'Desarrollo y difusión',
      resilience: 'Resiliencia',
    },
    generalAliases: new Set([normalizeToken('general'), normalizeToken('government ai readiness'), normalizeToken('madurez ia'), normalizeToken('GovAI')]),
    componentAliases: {
      policycap: 'PolicyCap',
      aiinfra: 'AIInfra',
      governance: 'Governance',
      pubadopt: 'PubAdopt',
      devdiff: 'DevDiff',
      resilience: 'Resilience',
    },
  },
  {
    key: 'NRI',
    slug: 'nri',
    shortName: 'Madurez Redes',
    name: 'Índice de Preparación para las Redes (NRI)',
    org: 'Portulans',
    orgLong: 'Portulans',
    orgBadge: 'NRI',
    orgTooltip: 'Índice elaborado por Portulans.',
    tooltip: 'El Network Readiness Index (NRI), publicado por el Portulans Institute, mide la capacidad de los países para aprovechar las tecnologías digitales y las redes en apoyo del desarrollo económico y social. El modelo renovado del índice, vigente desde 2019 y utilizado en la edición 2025, se organiza en 4 pilares; Tecnología, Personas, Gobernanza e Impacto, 12 subpilares y 60 indicadores.',
    color: '#2a7fa7',
    scaleMax: 100,
    url: 'https://networkreadinessindex.org/',
    sourceLinkLabel: 'Madurez Redes (Portulans)',
    infoCard: {
      title: 'Índice de Preparación para las Redes (NRI)',
      descriptions: [
        'El Network Readiness Index (NRI), publicado por el Portulans Institute, mide la capacidad de los países para aprovechar las tecnologías digitales y las redes en apoyo del desarrollo económico y social.',
        'El modelo renovado del índice, vigente desde 2019 y utilizado en la edición 2025, se organiza en 4 pilares: Tecnología, Personas, Gobernanza e Impacto, 12 subpilares y 60 indicadores.',
      ],
      source: 'Portulans',
      editions: '2021, 2022, 2023, 2024 y 2025.',
      categories: 'Este índice no utiliza categorías.',
      link: 'https://networkreadinessindex.org/',
    },
    components: {
      General: 'Madurez Redes',
      Technology: 'Tecnología',
      People: 'Personas',
      Governance: 'Gobernanza',
      Impact: 'Impacto',
    },
    slugComponents: {
      General: 'Madurez Redes',
      technology: 'Tecnología',
      people: 'Personas',
      governance: 'Gobernanza',
      impact: 'Impacto',
    },
    generalAliases: new Set([normalizeToken('general'), normalizeToken('nri'), normalizeToken('madurez redes')]),
    componentAliases: {
      technology: 'Technology',
      people: 'People',
      governance: 'Governance',
      impact: 'Impact',
    },
  },
];

export const INDEX_ORDER = INDEX_DEFINITIONS.map((definition) => definition.key);
export const INDEX_ORDER_BY_SLUG = INDEX_DEFINITIONS.map((definition) => definition.slug);

export const INDEX_KEY_BY_SLUG = Object.fromEntries(
  INDEX_DEFINITIONS.map((definition) => [definition.slug, definition.key]),
);

export const INDEX_SLUG_BY_KEY = Object.fromEntries(
  INDEX_DEFINITIONS.map((definition) => [definition.key, definition.slug]),
);

export const INDEX_META = Object.fromEntries(
  INDEX_DEFINITIONS.map((definition) => [definition.key, definition]),
);

export const GOV_INDEX_META_BY_SLUG = Object.fromEntries(
  INDEX_DEFINITIONS.map((definition) => [definition.slug, definition]),
);

export const COMPONENT_META = Object.fromEntries(
  INDEX_DEFINITIONS.map((definition) => [definition.key, definition.components]),
);

export const GOV_COMPONENT_LABELS_BY_SLUG = Object.fromEntries(
  INDEX_DEFINITIONS.map((definition) => [definition.slug, definition.slugComponents]),
);

function normalizeToken(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

export function getIndexMeta(indexKeyOrSlug) {
  return INDEX_META[indexKeyOrSlug] || GOV_INDEX_META_BY_SLUG[indexKeyOrSlug] || null;
}

export function getCanonicalComponentKey(indexKeyOrSlug, rawComponent) {
  const meta = getIndexMeta(indexKeyOrSlug);
  if (!meta) return rawComponent || 'General';
  const normalized = normalizeToken(rawComponent);
  if (!normalized) return 'General';
  if (meta.generalAliases.has(normalized)) return 'General';
  return meta.componentAliases[normalized] || rawComponent || 'General';
}

export function getCanonicalComponentLabel(indexKeyOrSlug, rawComponent) {
  const meta = getIndexMeta(indexKeyOrSlug);
  if (!meta) return rawComponent || 'General';
  const canonicalKey = getCanonicalComponentKey(indexKeyOrSlug, rawComponent);
  return meta.components[canonicalKey] || rawComponent || 'General';
}

export function getGovSourceLinks() {
  return INDEX_DEFINITIONS.map((definition) => ({
    slug: definition.slug,
    key: definition.key,
    label: definition.sourceLinkLabel,
    url: definition.url,
  }));
}
