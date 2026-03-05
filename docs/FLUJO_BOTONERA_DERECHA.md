# Flujo - Botonera de la Derecha (HUD)

## Objetivo

Controlar acciones rápidas globales desde UI React:

- Historial
- Reglas
- Ajustes
- Audio (mute/unmute)
- Home

Además:

- Botón de fullscreen (arriba derecha).
- Reposicionamiento responsivo para no solapar contenido de juego.

---

## 1) Estructura visual

En `SlotUI.jsx`:

1. `pos-top-right`:
   - botón fullscreen.
2. `pos-bottom-right`:
   - historial, reglas, ajustes, audio, home.

Ambos usan `hud-btn`.

---

## 2) Reglas de visibilidad

Variable:

- `hideRightHud = currentScreen === 'loading'`.

Visibilidad final:

- Si `hideRightHud` => botonera oculta.
- Si `isSpinning` => opacidad 0 y `pointer-events: none`.
- Si no => visible e interactiva.

Esto evita interacción durante spin y durante pantalla de carga.

---

## 3) Botones y acciones

## 3.1 Historial

- `openMenu('history')`.
- abre modal/tab historial y activa estado visual `active-hud`.

## 3.2 Reglas

- `openMenu('rules')`.

## 3.3 Ajustes

- `openMenu('settings')`.

## 3.4 Audio

- `toggleSound()`.
- alterna `isMuted`.
- ícono dinámico:
  - speaker-high / speaker-slash.

## 3.5 Home

- `goToHome()`.
- cierra modales (`closeAll`) y llama `window.gameRef.showLobby()`.

## 3.6 Fullscreen (arriba derecha)

- `toggleFullscreen()`:
  - entra/sale de fullscreen del documento.
- escucha `fullscreenchange` para mantener `isFullscreen` sincronizado.

---

## 4) Dock dinámico en móvil portrait

Bridge Phaser -> React:

- `window.setHudDockTop(top)`.

En `MainScene.onResize()`:

1. Si es mobile portrait:
   - calcula alto total de la botonera.
   - calcula `maxTop`.
   - si game visible:
     - posiciona botonera bajo el tablero (`boardBottom + 12`).
   - si lobby visible:
     - posiciona botonera bajo botón `JUGAR`.
   - clamp a rango visible.
2. llama `setHudDockTop(hudDockTop)`.

En `SlotUI`:

- si `hudDockTop` es número:
  - aplica style inline:
    - `top: ${hudDockTop}px`
    - `bottom: auto`
    - `right: 8px`
    - `transform: none`.

Resultado: evita solape con tablero/botones principales en portrait.

---

## 5) CSS responsivo relevante

En `App.css`:

- `.pos-bottom-right` desktop:
  - columna en esquina inferior derecha.
- En `@media (max-width: 900px)`:
  - pasa a anclaje lateral derecho centrado vertical.
- En `@media (max-height: 520px) and (orientation: landscape)`:
  - vuelve a zona baja derecha para no tapar contenido.

Los estilos base de `.hud-btn` incluyen:

- fondo semitransparente
- hover con escala
- active con escala menor.

---

## 6) Integración con estado global UI

`window.reactUI.isActive` considera modales/menús activos.

Aunque la botonera puede abrir modales, durante spin queda desactivada por estilo y no permite interacciones.

---

## 7) Forks y comportamiento esperado

1. Pantalla loading:
- botonera no se muestra.

2. Pantalla game/shop/home sin spin:
- botonera visible.

3. En spin:
- botonera invisible y sin clic.

4. Mobile portrait:
- prioridad a no solapar tablero ni botón jugar (dock dinámico).

5. Desktop/horizontal:
- posición fija por CSS + ajustes de layout generales.

