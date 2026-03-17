# Auditoría Responsive Baseline — FrutillaMillonaria

Fecha: 2026-03-17
Estado: post-Fase 3, pre-Fase 4

---

## 1. Inventario de Capas de Layout

### Capa Phaser
| Módulo | Responsabilidad |
|---|---|
| `src/game/mainScene/constants.js` | Fuente de verdad: `VIEWPORT_SCALE_MODEL` (5 perfiles), `VIEWPORT_RANGE_OVERRIDES` (11 reglas), `VIEWPORT_RESOLUTION_OVERRIDES` (vacío) |
| `src/game/mainScene/layoutMethods.js` | Núcleo de cálculo: `getViewportScaleProfile`, `getViewportOverrides`, `applyResponsiveLayout` |
| `src/game/mainScene/layoutGame.js` | Layout pantalla juego (portrait/landscape) |
| `src/game/mainScene/layoutLobby.js` | Layout lobby |
| `src/game/mainScene/layoutShop.js` | Layout tienda |
| `src/game/mainScene/layoutHud.js` | HUD Phaser + fallback jackpot |

### Capa React / CSS
| Archivo | Responsabilidad |
|---|---|
| `src/App.css` | Todos los estilos React: HUD buttons, modales, overlays |
| `src/components/SlotUI.jsx` | Orquestador de overlays React |
| `src/components/slot/ui/HudControls.jsx` | Botones HUD (menu, historial, fullscreen, etc.) |
| `src/components/slot/ui/ModalLarge.jsx` | Modal principal (historial, reglas, ajustes) |
| `src/components/slot/ui/AlertModal.jsx`, `BuyModal.jsx`, etc. | Modales secundarios |

---

## 2. Perfiles de Viewport Definidos

| Perfil | Dimensión base | Rango de activación | scaleClamp |
|---|---|---|---|
| `mobile-portrait` | 390×844 | portrait ≤767px ancho | 0.78–1.0 |
| `tablet-portrait` | 834×1112 | portrait >767px ancho | 0.84–1.08 |
| `mobile-landscape` | 844×390 | landscape ≤960px ancho o shortSide ≤500px | 0.74–0.96 |
| `tablet-landscape` | 1180×820 | landscape ≤1366px + touch o shortSide ≤900px | 0.82–1.04 |
| `desktop-landscape` | 1440×900 | resto landscape | 0.9–1.12 |

---

## 3. Bloques Críticos de Layout (Definition)

| Bloque | Implementación | Estado |
|---|---|---|
| `jackpot` | `placeJackpot()` en layoutMethods; posicionado por cada layout | ✅ Dinámico |
| `board` | `gameBoardScaleFactor` + anchors en layoutGame | ✅ Dinámico |
| `resultado` | Posicionado relativo al board en layoutGame | ✅ Dinámico |
| `controles` | `gameControlsScaleFactor` + offsets en layoutGame | ✅ Dinámico |
| `hud` (Phaser) | `dockButtonSize: 38px`, calculado en layoutHud | ⚠️ 38px < 44px mínimo |
| `hud` (React) | `.hud-btn` en App.css | ✅ Corregido a 44px mínimo |
| `lobby` | `lobbyScaleFactor` + anchors en layoutLobby | ✅ Dinámico |
| `shop` | `shopScaleFactor` + anchors en layoutShop | ✅ Dinámico |

---

## 4. Valores Fijos Relevantes

### Tablero (constants.js)
```
reelTotalWidth:  700px (lógico, escala con gameBoardScaleFactor)
reelTotalHeight: 600px (lógico, escala con gameBoardScaleFactor)
CELL_W: 140px | CELL_H: 120px
```

### HUD Phaser (layoutHud.js — valores base)
```
dockButtonSize: 38px   ⚠️ Por debajo del mínimo de 44px del DoD
dockGap:         6px
dockCount:       5
dockBottomMargin:10px
dockMinTop:      8px
```

### HUD React (App.css — corregido en Fase 3)
```
.hud-btn base: clamp(44px, 4.4vw, 54px)  ✅
Todos los breakpoints respetan ≥44px       ✅
```

---

## 5. Estado de safe-area-inset

| Contexto | Método | Estado |
|---|---|---|
| Phaser (bottom) | `getBottomSystemInset()` vía `visualViewport` API | ✅ Implementado |
| React CSS HUD | `env(safe-area-inset-*)` con CSS vars `--safe-*` | ✅ Implementado en Fase 3 |
| Modales | Centrados — safe-area no crítico | Aceptable |
| `viewport-fit=cover` en meta tag | Requerido para env() en iOS | ✅ Presente |

---

## 6. Reglas de Override Activas (VIEWPORT_RANGE_OVERRIDES)

| ID | Match | Scopes | Tipo |
|---|---|---|---|
| `mobile-landscape-bigger-board-smaller-controls` | landscape ≤960×500 | gameLandscape | Regla por rango ✅ |
| `landscape-over-1200-force-narrow-game-layout` | landscape ≥1200px | gameLandscape | Regla por rango ✅ |
| `landscape-over-1300-force-narrow-game-layout` | landscape ≥1320px | gameLandscape | Regla por rango ✅ |
| `tablet-portrait-compact-bigger-board` | portrait 520–740px / 700–980px | shared, gamePortrait | Regla por rango ✅ |
| `mobile-under-905-buttons` | portrait ≤905px | lobby | Regla por rango ✅ |
| `small-portrait-bigger-board` | portrait 320–430px / 600–760px | shared, gamePortrait | Regla por rango ✅ |
| `mobile-portrait-lobby-compact-buttons` | portrait 320–430px / 560–760px | lobby | Regla por rango ✅ |
| `ipad-mini-portrait-bet-controls-up` | portrait 740–790px / 980–1060px | shared, gamePortrait, hud | Excepción dispositivo ⚠️ |
| `square-tablet-portrait-bigger-board-smaller-jackpot` | portrait 768–980px / 820–980px | shared, gamePortrait | Regla por rango ✅ |
| `ipad-pro-portrait-lobby-button-spacing` | portrait 980–1080px / 1260–1400px | lobby | Regla por rango ✅ |
| `surface-pro-portrait-lobby-button-spacing` | portrait 880–979px / 1260–1420px | lobby | Regla por rango ✅ |
| `mobile-portrait-lobby-tight` | portrait 340–540px / 660–940px | lobby, shared | Regla por rango ✅ |

**Observación**: `ipad-mini-portrait-bet-controls-up` es la única excepción por dispositivo específico. Paralela al media query CSS también especifico de iPad Mini. Ambas funcionan coordinadas. Aceptable como excepción documentada.

---

## 7. CSS Media Queries Activos (post-Fase 3)

| Query | Elementos afectados | Tipo |
|---|---|---|
| `portrait ≤900px` | pos-bottom-right, modales | Perfil amplio ✅ |
| `portrait` | buy-options-layout | Perfil amplio ✅ |
| `landscape ≤520px height` | hud-btn (44px), pos-top/bottom-right | Perfil compacto ✅ |
| `≤1100px or ≤760px` | hud-btn (44px), pos-bottom-right | Perfil medio ✅ |
| `≤900px` | hud-btn (44px), pos-top-right | Perfil mobile ✅ |
| `portrait 740–790px / 980–1060px` | pos-bottom-right, pos-top-right | Excepción iPad Mini ⚠️ |
| `landscape 831–900px` | pos-bottom-right | Transición landscape ✅ |
| `portrait ≤600px` | pos-bottom-right (top: 66%) | Mobile pequeño ✅ |

---

## 8. Gaps Pendientes (Fases siguientes)

### Fase 2 — Phaser
- [ ] `dockButtonSize: 38px` en layoutHud.js — por debajo del mínimo 44px del DoD
- [ ] Verificar que hit areas de botones Phaser coinciden con área visual tras resize
- [ ] Verificar comportamiento del Scale Manager en doble resize rápido (orientación)
- [ ] Probar estados críticos en viewports P0: 390×844, 844×390, 1910×903

### Fase 4 — Assets
- [ ] No hay atlas/spritesheet — texturas individuales con extracción por frame
- [ ] No hay densidades 1x/2x/3x — una resolución única para todos los dispositivos
- [ ] `frutas.webp` y `backgrounds2.webp` — evaluar peso en móvil gama media

### Fase 5 — QA
- [ ] Sin evidencia de capturas por viewport
- [ ] Sin checklist QA por estado de pantalla (loading, lobby, shop, manual, auto, replay)
- [ ] Ejecutar matriz de viewports obligatorios del checklist

---

## 9. Matriz de Errores Conocidos

| Viewport | Estado | Prioridad | Descripción |
|---|---|---|---|
| 844×390 (mobile landscape) | Sin validar | P0 | Controles derecha podrían solapar tablero |
| 390×844 (mobile portrait) | Sin validar | P0 | Jackpot vs. tablero en pantallas cortas |
| 360×640 (mobile compact) | Sin validar | P1 | Posible compresión excesiva |
| Cualquier iOS con notch | Mejorado | P1 | safe-area ahora en CSS; falta validar |
| iPad Mini 768×1024 | Sin validar | P1 | Reglas coordinadas JS+CSS implementadas |
| 1910×903 (desktop base) | Sin validar | P0 | Layout landscape desktop |

---

## 10. Fuente de Verdad Responsive

El sistema sigue un contrato de tres capas:

```
1. VIEWPORT_SCALE_MODEL (constants.js)
   └─ Define perfiles y scaleClamp por tipo de dispositivo

2. VIEWPORT_RANGE_OVERRIDES (constants.js)
   └─ Ajustes por rango — evitar excepciones por resolución exacta
   └─ Combinados via mergeOverrideScopes (acumulativo, no destructivo)

3. VIEWPORT_RESOLUTION_OVERRIDES (constants.js)
   └─ Excepciones puntuales — actualmente vacío (correcto)
```

El 80%+ de los casos se resuelve por perfiles + reglas de rango. Solo `ipad-mini-portrait-bet-controls-up` funciona como excepción de dispositivo (coordinada con media query CSS correspondiente).
