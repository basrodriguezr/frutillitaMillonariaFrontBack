# Checklist Responsive Operativo: FrutillaMillonaria

Objetivo: asegurar que el juego escale y se reposicione proporcionalmente en cualquier resolución, manteniendo usabilidad y consistencia visual.

Resoluciones base de diseño:
- Vertical (móviles): **390x844**
- Horizontal (tablet/desktop/móvil horizontal): **1910x903**

Nota: estas resoluciones son referencia de diseño, no límites. El sistema debe extrapolar correctamente a otros viewports.

## Principio de Implementación (Obligatorio)

- [ ] El comportamiento responsive debe ser real: adaptación correcta a cualquier resolución y relación de aspecto.
- [ ] Los componentes visuales (botones, imágenes, assets) no deben depender de medidas rígidas como regla principal.
- [ ] La implementación debe priorizar escalado proporcional, anclajes y reposicionamiento dinámico por bloque.
- [ ] Debe preservarse consistencia visual, legibilidad y usabilidad en todos los perfiles de dispositivo.
- [ ] Cualquier excepción con medidas fijas debe estar justificada y documentada.

## Definition of Done (Global)

- [ ] No hay solapes críticos entre jackpot, tablero, panel de info/controles ni HUD.
- [ ] Todos los botones táctiles cumplen mínimo de toque efectivo de 44x44 px.
- [ ] Tipografías y tags no se cortan en ninguna pantalla validada.
- [ ] No hay “saltos” visibles al rotar orientación o mostrar/ocultar barras del navegador móvil.
- [ ] FPS estable en móvil medio (objetivo: 50-60 FPS en gameplay normal).
- [ ] Existe evidencia QA con capturas por viewport y estado de pantalla.

## Fase 0: Auditoría y Baseline (Alta)

- [ ] Levantar inventario de todos los elementos que participan en layout: Phaser (`mainScene/*`) y React (`SlotUI`, HUD, modales).
- [ ] Identificar y registrar coordenadas/tamaños hardcodeados en px que no dependen de perfil de viewport.
- [ ] Unificar en un documento corto qué es “bloque crítico” de layout: `jackpot`, `board`, `resultado`, `controles`, `hud`.
- [ ] Dejar una matriz inicial de errores visibles por viewport para priorizar correcciones.

Criterio de salida Fase 0:
- [ ] Existe un baseline visual inicial (capturas) para comparar regresiones.

## Fase 1: Arquitectura Responsive Unificada (Alta)

- [ ] Definir un único contrato de escalado por perfil usando como bases 390x844 y 1910x903.
- [ ] Consolidar reglas de perfil/rango en una sola fuente de verdad (evitar parches dispersos por resolución exacta).
- [ ] Definir constraints por bloque: min/max scale, márgenes mínimos y prioridades de compresión.
- [ ] Normalizar política por orientación (`portrait`/`landscape`) y por tipo de fit (`contain`/`cover`) según pantalla.
- [ ] Crear/ajustar utilitario central (`scaleUtils`) para cálculos compartidos Phaser + React.

Criterio de salida Fase 1:
- [ ] El 80%+ de casos se resuelve por reglas de perfil/constraints, no por excepciones puntuales.

## Fase 2: Implementación Phaser (Alta)

- [ ] Ajustar `Scale Manager` y flujo de resize para evitar doble reflow y comportamiento inestable.
- [ ] Aplicar reposicionamiento por anchors de bloque, no por offsets absolutos acumulados.
- [ ] Homogeneizar `setScale`/`setDisplaySize` con fórmulas consistentes por bloque.
- [ ] Revisar hit areas tras escalado para que coincidan con la geometría visible.
- [ ] Implementar límites para estados críticos: `loading`, `lobby`, `shop`, `game`, `replay`.
- [ ] Reducir overrides exactos a solo excepciones justificadas y documentadas.

Criterio de salida Fase 2:
- [ ] No hay clipping ni cruces críticos en `390x844`, `844x390`, `1910x903`.

## Fase 3: Implementación React Overlay (Alta)

- [ ] Simplificar media queries de HUD/modales y migrar a reglas por tokens y `clamp()`.
- [ ] Integrar safe area (`env(safe-area-inset-*)`) para notch y barras del sistema.
- [ ] Revisar todos los tamaños de botón del HUD y estados `hover/active/disabled`.
- [ ] Corregir reglas CSS inválidas o ambiguas (unidades faltantes, duplicados, overrides conflictivos).
- [ ] Asegurar que el overlay no tape ni se superponga al contenido crítico de Phaser.

Criterio de salida Fase 3:
- [ ] HUD y modales mantienen legibilidad/interacción correcta en portrait y landscape.

## Fase 4: Assets y Performance (Media-Alta)

- [ ] Definir pipeline de assets por densidad (`1x/2x/3x`) con criterio claro de selección.
- [ ] Estandarizar uso de atlas/spritesheets para reducir draw calls.
- [ ] Aplicar carga progresiva por contexto (no precargar todo en bloque).
- [ ] Revisar peso de texturas y compresión para móviles.
- [ ] Medir frame-time y memoria en dispositivos de gama media.

Criterio de salida Fase 4:
- [ ] Se mantienen objetivos de fluidez y tiempos de carga aceptables en móviles.

## Fase 5: QA, Automatización y Cierre (Alta)

- [ ] Crear checklist QA por estado de pantalla: `loading`, `lobby`, `shop`, `manual`, `auto`, `replay`, `historial`, `ajustes`.
- [ ] Ejecutar matriz de viewports obligatorios (tabla abajo) en portrait y landscape según corresponda.
- [ ] Guardar evidencia por viewport (capturas o video corto) y registrar incidencias.
- [ ] Repetir validación tras cada bloque de cambios (no solo al final).
- [ ] Documentar guía operativa en `docs/responsive-rules.md` y actualizar `README.md`.

Criterio de salida Fase 5:
- [ ] Checklist completo con evidencia y sin bloqueantes P0/P1 abiertos.

## Matriz QA Obligatoria

| Viewport | Perfil esperado | Prioridad |
|---|---|---|
| 390x844 | Mobile portrait (base) | P0 |
| 430x932 | Mobile portrait large | P0 |
| 360x640 | Mobile portrait compact | P1 |
| 844x390 | Mobile landscape | P0 |
| 1024x768 | Tablet landscape | P1 |
| 1366x768 | Laptop landscape | P1 |
| 1910x903 | Desktop landscape (base) | P0 |
| 2560x1440 | Desktop wide | P2 |

## Riesgos a Corregir Primero

- [ ] Exceso de reglas específicas por resolución que dificulta mantenimiento.
- [ ] Dependencia de offsets manuales en vez de constraints por bloque.
- [ ] CSS responsive con múltiples overrides del mismo selector.
- [ ] Falta de evidencia QA sistemática por estado/viewport.
