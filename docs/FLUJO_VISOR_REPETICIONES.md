# Flujo - Visor de Repeticiones

## Objetivo

Permitir ver nuevamente una jugada ya resuelta, sin volver a cobrar apuesta ni alterar pozo.

---

## 1) Entradas al visor

Hay dos orígenes:

1. Desde tarjeta de shop (auto):
   - `setupReplay({ replayData, replayBet }, 'shop')`.
2. Desde historial:
   - `setupReplay({ bet, win }, 'history')`.

---

## 2) Preparación (`setupReplay`)

`setupReplay(configData, source)`:

1. `isReplayMode = true`
2. guarda `replaySource`
3. carga datos:
   - source `shop`: usa `configData.replayData` + `replayBet`.
   - source `history`: genera data mock con `generateHistoryMockSpin(bet, win)`.
4. cambia visibilidad de capas:
   - muestra `layerGame`, `layerUI`, `layerTopText`
   - oculta controles normales y manuales
   - muestra `replayControlsGroup`
5. muestra `replayTitleBox` (“ESTA ES UNA REPETICIÓN...”)
6. setea `APUESTA` del replay
7. resetea tablero
8. fija pantalla React en `game`
9. `onResize(...)` para layout correcto inmediato
10. dispara aviso UI `showReplayWarning`.

---

## 3) Aviso de repetición (React)

`window.showReplayWarning` en `SlotUI`:

- abre modal informativo:
  - “Esta es una repetición de una jugada ya realizada.”
- botón `Continuar` solo cierra modal.

---

## 4) Ejecución del replay (`executeReplay`)

Al presionar botón `REPRODUCIR`:

1. limpia animaciones previas
2. si ya está girando, ignora
3. activa `setReactSpinning(true)` y `isSpinning = true`
4. oculta botones `REPRODUCIR` y `SIGUIENTE`
5. resetea tablero visual
6. usa `currentReplayData` (no genera nueva apuesta/cobro)
7. anima caída de símbolos
8. termina en `endSpin(totalWin, winGroups)`.

---

## 5) Resolución en replay (forks)

`endSpin` corre igual, pero con guards por `isReplayMode`:

1. Si pierde:
   - muestra “TICKET SIN PREMIO”
   - no cobra ni paga saldo
   - vuelve a mostrar `REPRODUCIR/SIGUIENTE`.

2. Si gana:
   - reproduce secuencia de premios
   - no acredita balance (porque `isReplayMode`)
   - no registra historial nuevo
   - al final muestra `REPRODUCIR/SIGUIENTE`.

---

## 6) Salida (`SIGUIENTE` -> `exitReplay`)

Fork por origen:

1. `source='shop'`:
   - `showShop({ resetState: false })`
   - conserva estado previo de shop/tarjetas.

2. `source='history'`:
   - `showLobby()`
   - `openHistoryMenu()` para volver directo al historial.

---

## 7) Propiedades clave del visor

- No descuenta saldo.
- No aporta al pozo.
- No crea jugada pendiente.
- No persiste un nuevo resultado como jugada real.
- Es estrictamente visual.

---

## 8) Forks y límites

1. Replay desde historial no trae grid original:
- usa `generateHistoryMockSpin` con premio equivalente.

2. Replay desde shop sí trae grid original:
- usa `card.replayData`.

3. Si usuario intenta reproducir durante spin:
- se bloquea por `if (this.isSpinning) return`.

