# Flujo - Jugada Pendiente

## Objetivo

Evitar que una jugada individual en curso se pierda si el usuario sale del juego antes de terminar su resolución.

---

## Clave de persistencia

- `localStorage['frutilla_pending_spin']`

Payload guardado:

- `bet`
- `ticket`
- `data` (grid, totalWin, winGroups)

---

## 1) Creación de jugada pendiente

En `MainScene.spin()`:

1. Se valida saldo y se descuenta apuesta.
2. Se genera `data` del spin.
3. Antes de animar, se guarda:
   - `frutilla_pending_spin = { bet, ticket, data }`.

Esto deja el estado listo para reanudar si el usuario interrumpe.

---

## 2) Interrupción del flujo (fork)

Si el usuario se va a Home durante spin:

- `showLobby()` llama `interruptSpinKeepingPending()`.
- Ese método:
  - pone `isSpinning = false`
  - notifica `setReactSpinning(false)`
  - **no borra** `frutilla_pending_spin`.

Resultado: la jugada queda pendiente de reanudación.

---

## 3) Detección al volver a jugar

Desde `buildLobby()` botón `JUGAR`:

1. Lee `localStorage['frutilla_pending_spin']`.
2. Fork:
   - Si existe:
     - entra a `showGame()`
     - invoca `window.showPendingSpinModal(JSON.parse(saved))`
   - Si no existe:
     - entra a juego normal (sin pendiente).

---

## 4) Modal React de jugada pendiente

En `SlotUI.jsx`:

- Estado: `pendingSpinAlert`.
- Expuesto globalmente: `window.showPendingSpinModal(data)`.
- Muestra modal bloqueante:
  - “Tienes una jugada pendiente... aceptar para continuar.”

Comportamiento:

- Click fuera del modal no cierra cuando hay pendiente.
- Solo botón `Aceptar`.

---

## 5) Reanudación real

Al aceptar modal:

- llama `window.gameRef.playPendingSpin(savedData)`.

`playPendingSpin(savedData)`:

1. `showGame()`.
2. Restaura `ticket`.
3. Restaura apuesta si existe en `BET_VALUES`.
4. Activa estado de spin (`isSpinning`, `setReactSpinning`).
5. Reproduce animación usando `savedData.data` (no regenera resultados).
6. Finaliza por `endSpin(totalWin, winGroups)`.

---

## 6) Cierre de pendiente

La clave pendiente se borra cuando la jugada se resuelve:

- En pérdida (`endSpin`): `localStorage.removeItem('frutilla_pending_spin')`.
- En ganancia al terminar secuencia (`playSequentialWins`): también se borra.

---

## 7) Forks importantes

1. No hay pendiente:
- `JUGAR` entra directo a flujo normal.

2. Hay pendiente:
- se fuerza modal de continuación.

3. Salida a Home mientras gira:
- no pierde jugada; queda pendiente.

4. Si el payload guardado está corrupto:
- `JSON.parse` puede fallar (no hay `try/catch` en esa lectura puntual).
- en ese caso no se reanuda automáticamente (riesgo actual).

---

## 8) Estado actual y límites

- La jugada pendiente aplica al flujo individual.
- No se usa para auto-reveal de tickets.
- El modal protege UX para no “saltearse” una jugada ya cobrada.

