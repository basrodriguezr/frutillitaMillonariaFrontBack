# Flujo del Pozo (Jackpot) - Frutilla Millonaria

## 1) Resumen funcional

El pozo es un componente visual y lógico que muestra dos acumuladores:

- `MAYOR`
- `MENOR`

El valor del pozo:

- Se inicializa al crear `MainScene`.
- Se restaura desde `localStorage` si existe estado previo.
- Aumenta cuando se realizan apuestas (juego individual y compra de paquetes).
- Puede ser sobrescrito desde un sistema externo mediante `window.updateJackpotValues(...)`.
- Se renderiza de forma responsiva según pantalla/orientación.

Archivos principales:

- `src/game/MainScene.js`
- `src/components/JackpotUI.js`

---

## 2) Dónde vive el estado del pozo

El estado real del pozo vive en la clase `JackpotUI`:

- `this.mayor`
- `this.menor`

Y su estado visual animado:

- `this.displayMayor`
- `this.displayMenor`

Persistencia:

- `storageKey`: `frutilla_jackpot_state_v1`
- Guardado en `localStorage` con:
  - `mayor`
  - `menor`
  - `updatedAt`

Esto permite que, al recargar la página, el pozo no vuelva a cero.

---

## 3) Inicialización paso a paso

En `MainScene.create()`:

1. Se instancia `JackpotUI`:
   - `textureKey: 'pozo'`
   - `storageKey: 'frutilla_jackpot_state_v1'`
   - `totalContribution: 0.8`
   - `minorShare: 0.2`
2. Se llama `jackpotUI.create()` para crear imagen + textos.
3. Se llama `jackpotUI.restoreState()` para recuperar valores guardados.
4. Se llama `jackpotUI.updateTexts(true)` para pintar texto inicial.
5. Se expone un bridge global:
   - `window.updateJackpotValues = (payload) => this.setJackpotValues(payload, true)`

---

## 4) Fórmula actual de aporte al pozo

Cuando entra un monto `amount`:

1. `total = round(amount * totalContribution)`
2. `minorIncrease = round(total * minorShare)`
3. `mayorIncrease = max(0, total - minorIncrease)`
4. `mayor += mayorIncrease`
5. `menor += minorIncrease`

Con la configuración actual:

- `totalContribution = 0.8`
- `minorShare = 0.2`

Entonces, del total apostado:

- `MAYOR` recibe aprox. `64%`
- `MENOR` recibe aprox. `16%`
- `20%` no entra al pozo

Ejemplo con apuesta de `1000`:

- Total al pozo: `800`
- Menor: `160`
- Mayor: `640`

---

## 5) Cuándo se incrementa el pozo

### 5.1 Juego individual (`spin`)

En `spin()`:

- Si no es modo manual y hay saldo:
  - descuenta balance
  - llama `this.addJackpotContribution(betVal)`

Esto ocurre antes de resolver el giro.

### 5.2 Compra de tickets - automática

En `startAutoReveal(qty, totalCost)`:

- descuenta `totalCost`
- llama una sola vez a `this.addJackpotContribution(totalCost)`

No aporta por tarjeta individual; aporta por el costo total del paquete.

### 5.3 Compra de tickets - manual

En `startManualMode(qty, betVal, totalCost)`:

- descuenta `totalCost`
- llama una sola vez a `this.addJackpotContribution(totalCost)`

Luego cada jugada manual no vuelve a aportar al pozo (ya se aportó todo al inicio del paquete).

### 5.4 Repeticiones (`setupReplay` / historial)

No aportan al pozo. Son visualización de jugadas ya existentes.

---

## 6) Actualización externa del pozo (override)

Existe una entrada externa:

- `window.updateJackpotValues(payload)`

Esto llama `setJackpotValues(payload, animate=true)`, que acepta claves:

- `mayor` o `major` o `jackpotMayor`
- `menor` o `minor` o `jackpotMenor`

`parseValue()` acepta números o strings con separadores (`$`, `.`, etc.) y extrae dígitos.

Comportamiento:

- Si llega valor válido `>= 0`, reemplaza el estado interno.
- Anima hacia el nuevo valor (`animateToTarget(450)`).
- Persiste en `localStorage`.

Importante:

- Esta vía **sobrescribe** el acumulado local.
- Si hay backend autoritativo, esta debería ser la fuente de verdad.

---

## 7) Animación y render del valor

Actualizaciones de texto:

- `updateTexts(force)`
- Formato: `$ 123.456` usando `formatPoints` de `MainScene`.

Animación:

- `animateToTarget(300)` cuando el incremento viene por aporte local.
- `animateToTarget(450)` cuando viene por `setValues` externo.

Internamente usa `scene.tweens.addCounter` (uno para mayor y otro para menor), actualizando:

- `displayMayor`
- `displayMenor`

---

## 8) Layout responsivo del pozo

El pozo no solo cambia posición; también escala en función del espacio utilizable.

Puntos clave en `MainScene.onResize()`:

- `placeJackpot(x, top, baseWidth, maxHeightRatio)` calcula tamaño final.
- `fitJackpotWidth` limita por ancho y por alto disponible.
- Si la textura es muy ancha (`aspect >= 2.2`) usa alto completo.
- Si la textura tiene “alto visual efectivo” menor (`aspect < 2.2`) usa factor `0.38` para calcular colisiones visuales.

Escenarios:

- Lobby: normalmente centrado arriba.
- Shop y Game:
  - En portrait suele ir centrado arriba.
  - En landscape puede ir centrado o a la derecha según layout.

---

## 9) Ciclo de vida y limpieza

En `shutdownScene()`:

- `jackpotUI.destroy()` corta tweens y persiste estado.
- elimina `window.updateJackpotValues` si estaba apuntando al updater de esta escena.

Esto evita dejar referencias globales colgando al destruir Phaser.

---

## 10) Relación con localStorage

Claves principales relacionadas:

- Pozo: `frutilla_jackpot_state_v1`
- Historial (separado): `frutilla_history_v1`
- Jugada pendiente (separado): `frutilla_pending_spin`

El pozo es independiente de historial y jugada pendiente.

---

## 11) Consideraciones de negocio/técnicas

1. Fuente de verdad:
   - Hoy funciona como acumulado local con opción de override externo.
   - Si se conecta backend en tiempo real, conviene sincronizar periódicamente usando `window.updateJackpotValues`.

2. Redondeo:
   - Se usa `Math.round`, por lo que puede haber diferencias de 1 unidad según monto.

3. Persistencia por navegador/dispositivo:
   - `localStorage` es local al browser actual, no compartido entre dispositivos.

4. Repeticiones:
   - No deben alterar pozo (comportamiento actual correcto para replay).

---

## 12) Flujo resumido (pseudo-diagrama)

1. `MainScene.create()`
2. `new JackpotUI(...)`
3. `create() -> restoreState() -> updateTexts(true)`
4. Usuario apuesta:
   - juego individual: `addContribution(bet)`
   - paquetes: `addContribution(totalCost)`
5. `JackpotUI.addContribution`:
   - calcula reparto mayor/menor
   - anima
   - persiste
6. Opcional externo:
   - `window.updateJackpotValues(payload)`
   - reemplaza mayor/menor
   - anima
   - persiste

