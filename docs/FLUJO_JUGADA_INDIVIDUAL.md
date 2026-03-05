# Flujo Completo - Jugada Individual

## Alcance

Este documento describe el flujo completo de la jugada individual (`JUGAR`) y todos sus forks reales en código.

Archivos base:

- `src/game/MainScene.js`
- `src/components/SlotUI.jsx`

---

## 1) Entrada al flujo individual

### 1.1 Desde Home -> botón `JUGAR`

En `buildLobby()`:

1. Se revisa `localStorage['frutilla_pending_spin']`.
2. Fork:
   - Si **existe** jugada pendiente:
     - `showGame()`
     - se abre modal React `showPendingSpinModal(savedData)`.
   - Si **no existe** jugada pendiente:
     - `resetMainBetToDefault()` (deja apuesta en `$100`)
     - `showGame()`.

---

## 2) Pantalla de juego individual activa

`showGame()` deja:

- `isReplayMode = false`
- `isManualMode = false`
- visibles controles normales (`-`, `JUGAR`, `+`, `APUESTA`)
- `currentScreen = 'game'`.

---

## 3) Ajuste de apuesta

`changeBet(dir)`:

- Si `isSpinning` => ignora.
- Si no:
  - cambia `currentBetIndex` en rango `[0..BET_VALUES.length-1]`
  - actualiza texto de `APUESTA`.

Fork implícito:

- No se puede bajar de mínimo ni subir de máximo (clamp).

---

## 4) Disparo de la jugada (`spin()`)

### 4.1 Condiciones iniciales

1. `clearWinAnimations()`
2. Si `isSpinning` => return (fork de bloqueo por doble click).
3. `betVal = BET_VALUES[currentBetIndex]`.

### 4.2 Validación de saldo

Como en jugada individual `isManualMode` es `false`:

- Si `balance < betVal`:
  - muestra alerta React: `"Saldo Insuficiente"`
  - return.
- Si hay saldo:
  - descuenta balance
  - actualiza `TOTAL`
  - aporta al pozo (`addJackpotContribution(betVal)`).

### 4.3 Preparación de spin

- genera `currentTicket` nuevo
- muestra ticket en UI
- `setReactSpinning(true)`
- `isSpinning = true`
- oculta botones de apuesta y jugar
- resetea tablero
- ajusta tiempos por `speedLevel`:
  - normal / rápido / turbo.

### 4.4 Persistencia pendiente + animación

Dentro de `try`:

1. `data = generateMockSpin(betVal)`
2. guarda pendiente:
   - `localStorage['frutilla_pending_spin'] = { bet, ticket, data }`
3. espera 200ms
4. lanza animación de caída de símbolos
5. al terminar último símbolo -> `endSpin(totalWin, winGroups)`.

Fork de error:

- Si entra en `catch`:
  - log de error
  - `isSpinning = false`
  - re-muestra controles
  - `setReactSpinning(false)`.

---

## 5) Resolución (`endSpin`)

## 5.A Fork pérdida (`totalWin <= 0`)

Secuencia:

1. `isSpinning = false`
2. elimina pendiente `frutilla_pending_spin`
3. registra historial si es jugada individual:
   - `mode: 'single'`, `win: 0`
4. re-habilita controles normales
5. `setReactSpinning(false)`
6. `RESULTADO = "TICKET SIN PREMIO"`
7. muestra texto flotante de pérdida.

---

## 5.B Fork ganancia (`totalWin > 0`)

Secuencia:

1. `accumulatedWin = 0`
2. `RESULTADO = $0`
3. ejecuta `playSequentialWins(winGroups)`.

### 5.B.1 Durante `playSequentialWins`

Por cada grupo ganador:

- incrementa contador visual (`RESULTADO`) desde valor anterior al nuevo acumulado
- resalta símbolos ganadores
- atenúa símbolos no ganadores
- muestra label flotante del premio del grupo.

### 5.B.2 Al finalizar todos los grupos

1. elimina pendiente `frutilla_pending_spin`
2. suma `accumulatedWin` al balance (solo no-replay)
3. registra historial individual:
   - `mode: 'single'`
   - `win: accumulatedWin`
4. muestra mensaje total `¡GANASTE!`
5. `isSpinning = false`
6. re-habilita controles normales
7. `setReactSpinning(false)`.

---

## 6) Fork especial: abandono con jugada pendiente

Si el usuario sale del juego en medio del spin (por ejemplo Home):

- `showLobby()` llama `interruptSpinKeepingPending()`.
- Este método corta `isSpinning` **sin borrar** `frutilla_pending_spin`.

Resultado:

- al volver a `JUGAR`, se detecta pendiente y se obliga a retomar con modal.

---

## 7) Retomar jugada pendiente (`playPendingSpin`)

Flujo al aceptar modal pendiente:

1. `showGame()`
2. restaura `ticket` guardado
3. intenta restaurar `bet` (`currentBetIndex`)
4. activa estado de spin (`setReactSpinning(true)`, `isSpinning=true`)
5. usa `savedData.data` (no genera nuevo resultado)
6. anima símbolos
7. finaliza por `endSpin(totalWin, winGroups)`.

Forks finales:

- cae en fork pérdida o fork ganancia del punto 5.

---

## 8) Historial generado por jugada individual

Se agrega entrada en `frutilla_history_v1`:

- ticket: `currentTicket`
- bet: valor de apuesta vigente
- win: `0` o acumulado ganador
- mode: `'single'`
- timestamp.

---

## 9) Resumen de forks (árbol rápido)

1. Entrar a `JUGAR`:
   - pendiente existe -> modal pendiente -> retomar
   - no pendiente -> juego limpio (bet default)
2. Al girar:
   - ya está girando -> ignora
   - sin saldo -> alerta
   - con saldo -> spin
3. Ejecución:
   - error interno -> rollback UI
   - ok -> `endSpin`
4. Resultado:
   - pérdida -> texto sin premio + historial 0
   - ganancia -> secuencia de grupos + historial premio
5. Durante giro:
   - si abandona pantalla -> queda pendiente para reanudar.

