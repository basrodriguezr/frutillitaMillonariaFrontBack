# Checklist Mejoras Recomendadas (Frontend)

Objetivo: fortalecer arquitectura, UX y performance del front antes de separar toda la logica de negocio al backend.

## 1) Arquitectura y desacoplamiento (Alta prioridad)

- [ ] Reemplazar uso de `window.*` por un Event Bus interno tipado (`ui:event`, `game:event`, `audio:event`).
- [ ] Crear capa `frontend-core` (estado UI + contratos) separada de Phaser y React.
- [ ] Definir DTOs de interfaz para tickets, spins, replay, historial y jackpot.
- [ ] Reducir responsabilidades de `MainScene` dividiendo en controladores por dominio (`shop`, `spin`, `replay`, `layout`).
- [ ] Estandarizar nombres y ciclos de vida de eventos (alta/baja de listeners).

## 2) Estado y flujo de pantalla (Alta prioridad)

- [ ] Implementar maquina de estados para flujo principal (`loading`, `home`, `shop`, `game`, `replay`).
- [ ] Consolidar flags dispersos (`isSpinning`, `isManualMode`, `isReplayMode`, `pending`) en estado unico.
- [ ] Agregar guardas de transicion para evitar estados invalidos.
- [ ] Centralizar persistencia temporal (pending spin, consent audio, historial local) en un modulo unico.

## 3) Responsive y layout (Alta prioridad)

- [ ] Unificar reglas moviles/tablet en tokens y perfiles, evitando parches por resolucion aislada.
- [ ] Definir anclajes por bloques (jackpot, tablero, resultado, controles) con restricciones min/max.
- [ ] Crear matriz de validacion visual para breakpoints clave: 375x812, 390x844, 430x932, 768x1024, 1024x1366, 1366x768.
- [ ] Documentar reglas de posicion Y para shop/game para no romper otras resoluciones.

## 4) UI/estilos (Media-alta)

- [ ] Dividir `App.css` en modulos: `modal.css`, `hud.css`, `history.css`, `settings.css`, `layout.css`.
- [ ] Definir sistema de color/tipografia con tokens (light modal, dark game, estados win/lose/info).
- [ ] Homogeneizar componentes de boton (tamano, radio, hover, foco, disabled).
- [ ] Revisar contraste AA minimo para texto sobre fondos claros y oscuros.

## 5) Performance y carga (Media-alta)

- [ ] Aplicar code splitting (escenas/recursos) para bajar chunk principal.
- [ ] Configurar `manualChunks` en Vite para separar Phaser, UI y utilidades.
- [ ] Revisar pipeline de assets (peso, resolucion y formato para movil vs desktop).
- [ ] Preload progresivo por contexto (`loading`, `home`, `shop`, `game`) en vez de precarga total.
- [ ] Medir FPS y frame-time en moviles de gama media para ajustar escala/calidad.

## 6) Audio UX (Media)

- [ ] Mantener consentimiento de audio persistente y sincronizado con icono HUD.
- [ ] Separar claramente SFX de loading vs BGM de juego.
- [ ] Definir presets de mezcla por pantalla (loading/shop/game/replay).

## 7) Calidad y testing (Media)

- [ ] Agregar pruebas unitarias para utilidades (`formatters`, storage, normalizadores).
- [ ] Agregar pruebas E2E para flujos criticos:
  - [ ] Comprar pack 5/10/15/20
  - [ ] Apertura manual ticket a ticket
  - [ ] Apertura automatica completa
  - [ ] Replay desde historial
  - [ ] Recuperacion de jugada pendiente
- [ ] Agregar smoke test visual por viewport clave.

## 8) Observabilidad y soporte (Media)

- [ ] Log estructurado de eventos UI clave para debugging (solo front).
- [ ] Captura de errores no controlados en runtime (boundary + reporter).
- [ ] Panel simple de diagnostico en desarrollo (viewport, perfil, escala aplicada).

## 9) Documentacion operativa (Media-baja)

- [ ] Crear `docs/frontend-architecture.md` con mapa de modulos y flujo de eventos.
- [ ] Crear `docs/responsive-rules.md` con reglas por perfil y ejemplos.
- [ ] Crear `docs/audio-flow.md` con politica de activacion, mute y fases.

## Entregables sugeridos por fases

- [ ] Fase 1 (1 semana): Event Bus + estado central + saneamiento responsive mobile.
- [ ] Fase 2 (1 semana): CSS modular + tokens + validacion visual por breakpoints.
- [ ] Fase 3 (1 semana): code splitting + optimizacion assets + pruebas E2E base.
