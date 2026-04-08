# Project guidance

## Contexto
Este repositorio contiene una web ya operativa cuya interfaz actual es un activo principal del proyecto.

## Regla principal
La página actual de datosLATAM debe considerarse la referencia canónica de interfaz para la ficha principal.
Su estructura, jerarquía, orden de secciones, tipos de gráficos, iconografía, lógica visual y disposición de elementos deben preservarse salvo indicación expresa.

## Objetivo
Construir una nueva web más amplia que:
- mantenga la página actual como base funcional y visual
- aplique una evolución estética hacia un look and feel corporativo IADB
- añada nuevas secciones y páginas alrededor de esa base
- mejore visualmente sin rehacer la lógica de interacción ya definida

## Reglas
- No rediseñar libremente la ficha actual.
- No cambiar orden de secciones, gráficos, indicadores o iconografía sin autorización expresa.
- Tratar `public/index.html`, `public/styles.css` y `public/js/main.js` como referencia principal de comportamiento e interfaz.
- Proponer primero cambios de skin, espaciado, tipografía, color, superficies, navegación y microinteracciones.
- Antes de modificar la UI, distinguir entre:
  1. elementos invariantes
  2. elementos estilables
  3. elementos ampliables
- Priorizar cambios reversibles y graduales.