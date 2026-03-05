# Flujo - Botón Historial

## Objetivo

Mostrar jugadas registradas, paginadas y ordenadas descendentemente por fecha, con opción de ver repetición.

---

## 1) Fuentes de datos

Clave de almacenamiento:

- `localStorage['frutilla_history_v1']`

Formato normalizado por entrada:

- `id` (ticket)
- `timestamp`
- `date`
- `bet`
- `win`
- `mode` (`single`, `tickets-auto`, `tickets-manual`, etc.)

---

## 2) Carga inicial en UI

En `SlotUI.jsx`:

1. `historyEntries` se inicializa con `loadHistory()`.
2. `loadHistory()`:
   - lee localStorage
   - normaliza entries (`normalizeHistoryEntry`)
   - ordena con `sortHistoryDesc`
   - limita a `HISTORY_MAX_ITEMS` (500).

---

## 3) Cómo se abre Historial

Hay dos rutas:

1. Botón de la botonera derecha:
   - `onClick={() => openMenu('history')}`.
2. Desde Phaser:
   - `window.openHistoryMenu = () => openMenu('history')`.

`openMenu('history')`:

- abre el modal/tab de historial
- resetea paginación a página 1.

---

## 4) Render del tab historial

Se calcula:

- `totalPages`
- `safeCurrentPage`
- `currentHistory` (slice de 5 items por página).

Tabla:

- Fecha (`formatHistoryDate`)
- N°Ticket
- Precio
- Premio
- Acción `Ver`.

Controles:

- botón anterior/siguiente de página.

---

## 5) Botón `Ver` dentro del historial (fork)

Al presionar `Ver` de una fila:

1. cierra modales (`closeAll`).
2. llama `window.gameRef.setupReplay({ bet: item.bet, win: item.win }, 'history')`.

Eso abre el visor de repetición en modo `history`.

---

## 6) Actualización del historial en runtime

Bridge expuesto:

- `window.addHistoryEntry = (entry) => { ... }`.

Al agregar:

1. normaliza entry
2. mergea con estado actual
3. ordena desc
4. limita a 500
5. persiste con `saveHistory`.

---

## 7) De dónde vienen las entradas

Desde `MainScene`:

- Jugada individual:
  - `mode: 'single'` (con premio 0 o >0).
- Tickets automáticos:
  - `mode: 'tickets-auto'`.
- Tickets manuales:
  - `mode: 'tickets-manual'`.

Todas llegan por `addHistoryEntry(...)`.

---

## 8) Comportamiento de salida

Al cerrar historial:

- `closeAll()` limpia tab/modal activo.

En replay iniciado desde historial:

- botón `SIGUIENTE` en replay ejecuta `exitReplay()`.
- como `source='history'`:
  - vuelve a `showLobby()`
  - reabre historial con `openHistoryMenu()`.

---

## 9) Forks y edge cases

1. Historial vacío:
- muestra mensaje “Aún no hay jugadas registradas”.

2. Fecha legada:
- si `date` viene en formato antiguo, `parseLegacyDate` intenta convertir.

3. Orden:
- siempre por `timestamp` desc; empate desempata por `id`.

4. Fallo de `localStorage`:
- `loadHistory` devuelve `[]`.
- `saveHistory` ignora error silenciosamente.

