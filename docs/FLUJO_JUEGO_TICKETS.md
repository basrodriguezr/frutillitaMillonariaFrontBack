# Flujo Completo - Juego por Tickets

## Alcance

Este documento cubre el flujo completo de compra y ejecución de paquetes de tickets (`5/10/15/20`) con todos sus forks:

- selección de cantidad
- validación de saldo
- elección de visualización (Automática / Manual)
- replay de tarjetas
- resumen final manual
- retorno a home/historial.

Archivos base:

- `src/game/MainScene.js`
- `src/components/SlotUI.jsx`

---

## 1) Entrada a Shop (compra de tickets)

Desde Home -> botón `COMPRAR PAQUETE DE TICKETS`:

- llama `showShop()`.

`showShop()` (por defecto `resetState = true`):

1. corta spin pendiente solo en modo individual (`interruptSpinKeepingPending`)
2. `isReplayMode = false`
3. `isManualMode = false`
4. `resetBoardState()`
5. `resetShopState()`:
   - apuesta default `$100` (`currentBetIndex=0`)
   - `shopQty=5`
   - resetea resultado acumulado de shop
   - redibuja tarjetas.
6. muestra layer shop + pozo
7. `updateShopUI()`
8. `currentScreen='shop'`.

---

## 2) Configuración de compra en Shop

## 2.1 Selección de cantidad

Botones: `5, 10, 15, 20`.

Al tocar uno:

- `shopQty = opt`
- `updateShopUI()`

`updateShopUI()`:

- actualiza `APUESTA` y `COSTO TOTAL`
- marca botón activo
- si cambió cantidad:
  - redibuja grilla de tarjetas
  - oculta `RESULTADO` de shop (vuelve a `$0`)
  - relayout (`onResize`).

## 2.2 Ajuste de apuesta

Con botones `-` y `+` de shop:

- usa `changeBet(dir)` (mismo índice global de apuesta).
- clamp al rango permitido.

---

## 3) Click `COMPRAR` en Shop

En `btnBuyHit.on('pointerup')`:

1. calcula `total = BET_VALUES[currentBetIndex] * shopQty`
2. fork:
   - Si `balance < total`:
     - alerta `"Saldo Insuficiente"`
     - aborta.
   - Si hay saldo:
     - `resetShopCards()` (limpia visual de tarjetas)
     - oculta resultado de shop
     - abre modal React `showBuyModal(total, qty, betVal)`.

---

## 4) Modal de compra: fork principal

El modal muestra dos caminos:

- `Automática`
- `Manual`

---

## 5) Rama A: Visualización Automática (`startAutoReveal`)

### 5.1 Inicio

1. descuenta `totalCost` una vez
2. actualiza balance
3. aporta al pozo: `addJackpotContribution(totalCost)`
4. resetea `currentShopWin=0`
5. muestra panel `RESULTADO` de shop.

### 5.2 Reveals por tarjeta

Para cada tarjeta `i`:

1. genera spin mock con `betVal`
2. guarda en tarjeta:
   - `replayData`
   - `replayBet`
   - `ticketId`
3. reveal con delay `i * 150`
4. al revelar:
   - calcula `prize`
   - registra historial:
     - `mode: 'tickets-auto'`
     - `ticketId` de esa tarjeta
   - fork de premio:
     - si gana:
       - suma premio a balance
       - suma a `currentShopWin`
       - actualiza panel resultado (pulse anim)
     - si pierde:
       - solo render visual sin premio
   - habilita botón `VER`.

### 5.3 Fork `VER` (repetición desde tarjeta)

Si usuario toca `VER`:

- `setupReplay({replayData, replayBet}, 'shop')`.

Luego en replay:

- `REPRODUCIR` ejecuta `executeReplay()` (no descuenta balance, no aporta pozo).
- `SIGUIENTE` ejecuta `exitReplay()`:
  - al venir de shop: `showShop({resetState:false})`
  - conserva estado de compra/tarjetas.

---

## 6) Rama B: Visualización Manual (`startManualMode`)

### 6.1 Inicio de modo manual

1. descuenta `totalCost` una vez
2. actualiza balance
3. aporta al pozo: `addJackpotContribution(totalCost)`
4. configura estado manual:
   - `isManualMode=true`
   - `manualTotal=qty`
   - `manualCurrent=1`
   - `manualBet=betVal`
   - `manualResults=[]`
5. cambia a layer game
6. oculta controles normales/replay
7. muestra `manualControlsGroup`
8. setea `JUGADA X DE N` y apuesta manual
9. dispara primer giro con delay -> `executeManualSpin()`.

### 6.2 Cada giro manual (`executeManualSpin`)

1. si `isSpinning` => ignora
2. limpia animaciones
3. `setReactSpinning(true)`
4. `isSpinning=true`
5. oculta botón `SIGUIENTE` manual
6. resetea tablero/resultado
7. genera `data = generateMockSpin(manualBet)`
8. anima símbolos
9. termina en `endSpin(totalWin, winGroups)`.

### 6.3 Resolución de cada giro manual (`endSpin`)

Fork por premio:

- Si pierde:
  - `finishManualSpin(0)`
- Si gana:
  - pasa por `playSequentialWins`
  - al terminar: `finishManualSpin(accumulatedWin)`.

### 6.4 `finishManualSpin(winAmount)`

1. agrega al arreglo `manualResults`:
   - número de jugada
   - bet
   - win
2. registra historial:
   - `mode: 'tickets-manual'`
   - `ticketId` nuevo generado
3. fork:
   - Si `manualCurrent < manualTotal`:
     - muestra botón `SIGUIENTE` manual.
   - Si ya terminó todas:
     - muestra modal resumen (`showSummaryModal(manualResults)`).

### 6.5 Fork botón `SIGUIENTE` manual

Al tocar:

1. `manualCurrent++`
2. actualiza label `JUGADA X DE N`
3. vuelve a `executeManualSpin()`.

### 6.6 Modal resumen final (manual)

Muestra tabla paginada de jugadas.

Fork de salida:

- Botón historial:
  - `showLobby()`
  - luego abre menú historial.
- Botón home:
  - `showLobby()`.

---

## 7) Repeticiones relacionadas a tickets

Hay dos orígenes:

1. **Desde shop automático** (`source='shop'`):
   - usa `card.replayData`.
   - al salir vuelve a shop preservando estado.

2. **Desde historial** (`source='history'`):
   - crea spin mock con premio equivalente (`generateHistoryMockSpin`).
   - al salir vuelve a home y abre historial.

En ambos:

- no hay descuentos de balance
- no hay aporte al pozo
- no se registra nueva jugada de tickets.

---

## 8) Historial generado por tickets

### Automática

Una entrada por tarjeta:

- `mode: 'tickets-auto'`
- `ticketId` por tarjeta
- `bet`, `win`, `timestamp`.

### Manual

Una entrada por jugada manual:

- `mode: 'tickets-manual'`
- `ticketId` generado en `finishManualSpin`
- `bet`, `win`, `timestamp`.

---

## 9) Efectos en saldo y pozo (tickets)

## 9.1 Saldo

- Se descuenta **una sola vez al comprar paquete** (`totalCost`).
- En automática, cada tarjeta ganadora devuelve premio al balance al revelar.
- En manual, cada giro ganador devuelve premio al finalizar su secuencia.

## 9.2 Pozo

- Se aporta **una sola vez por compra de paquete**:
  - `addJackpotContribution(totalCost)`
- Las repeticiones no aportan.

---

## 10) Árbol de forks resumido

1. Entrar a shop.
2. Elegir qty + bet.
3. Comprar:
   - saldo insuficiente -> alerta
   - saldo ok -> modal modo
4. Modo:
   - automática
     - reveal por tarjeta
     - tarjeta gana/pierde
     - opción `VER` replay
   - manual
     - giro N gana/pierde
     - si faltan -> botón siguiente
     - si termina -> resumen
5. Salida:
   - replay `shop` -> vuelve a shop sin reset
   - resumen -> home o historial.

