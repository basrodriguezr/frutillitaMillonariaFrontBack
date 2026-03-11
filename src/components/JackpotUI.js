import Phaser from 'phaser';

/**
 * Componente visual de jackpot para Phaser.
 * Representa un pozo acumulado único, su persistencia local y su animación en pantalla.
 */
export class JackpotUI {
    /**
     * Crea la instancia del jackpot y configura dependencias de escena, capa y formato.
     * Parámetros:
     * - `scene` (Phaser.Scene): Escena donde se renderiza el jackpot.
     * - `layer` (Phaser.GameObjects.Container): Capa contenedora donde se monta el jackpot.
     * - `options` (object, opcional): Opciones de textura, persistencia y reglas de contribución.
     */
    constructor(scene, layer, options = {}) {
        this.scene = scene;
        this.layer = layer;
        this.textureKey = options.textureKey ?? 'pozo';
        this.storageKey = options.storageKey ?? 'frutilla_jackpot_state_v1';
        this.totalContribution = Number.isFinite(options.totalContribution) ? options.totalContribution : 0.40;
        this.formatPoints = typeof options.formatPoints === 'function'
            ? options.formatPoints
            : (num) => Math.round(num).toString();
        this.valueXRatio = Number.isFinite(options.valueXRatio) ? options.valueXRatio : 0;
        this.valueYRatio = Number.isFinite(options.valueYRatio) ? options.valueYRatio : 0.06;

        this.amount = 0;
        this.displayAmount = 0;

        this.tweenAmount = null;

        this.container = null;
        this.image = null;
        this.amountTxt = null;
    }

    /**
     * Crea contenedor, imagen base y textos del pozo, y los agrega a la capa objetivo.
     * No requiere parámetros.
     */
    create() {
        this.container = this.scene.add.container(0, 0);
        this.image = this.scene.add.image(0, 0, this.textureKey).setOrigin(0.5);

        this.amountTxt = this.scene.add.text(0, 0, `$ ${this.formatPoints(this.amount)}`, {
            fontFamily: 'Luckiest Guy, Arial',
            fontSize: '52px',
            color: '#f8ff7c',
            stroke: '#1b3258',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.container.add([this.image, this.amountTxt]);
        this.layer.add(this.container);
    }

    /**
     * Indica si los elementos visuales del jackpot están inicializados.
     * No requiere parámetros.
     */
    hasVisuals() {
        return !!(this.layer && this.container && this.image);
    }

    /**
     * Obtiene el ancho de textura del jackpot o un fallback si aún no está disponible.
     * No requiere parámetros.
     */
    getTextureWidth() {
        return (this.image && this.image.width > 0) ? this.image.width : 1536;
    }

    /**
     * Obtiene el alto de textura del jackpot o un fallback si aún no está disponible.
     * No requiere parámetros.
     */
    getTextureHeight() {
        return (this.image && this.image.height > 0) ? this.image.height : 1024;
    }

    /**
     * Calcula la relación de aspecto actual del recurso visual del jackpot.
     * No requiere parámetros.
     */
    getAspect() {
        return this.getTextureWidth() / this.getTextureHeight();
    }

    /**
     * Devuelve un factor de corrección de alto visual según la relación de aspecto.
     * No requiere parámetros.
     */
    getVisualHeightFactor() {
        return this.getAspect() < 2.2 ? 0.38 : 1;
    }

    /**
     * Restaura valores de pozo desde `localStorage` y sincroniza sus valores de display.
     * No requiere parámetros.
     */
    restoreState() {
        try {
            const rawState = localStorage.getItem(this.storageKey);
            if (!rawState) return;

            const parsed = JSON.parse(rawState);
            const parsedAmount = this.parseValue(
                parsed?.amount ??
                parsed?.total ??
                parsed?.value ??
                parsed?.jackpot ??
                parsed?.acumulado
            );
            const parsedMayor = this.parseValue(parsed?.mayor);
            const parsedMenor = this.parseValue(parsed?.menor);
            const parsedLegacyPair = (Number.isFinite(parsedMayor) ? parsedMayor : 0) + (Number.isFinite(parsedMenor) ? parsedMenor : 0);

            if (Number.isFinite(parsedAmount) && parsedAmount >= 0) {
                this.amount = parsedAmount;
            } else if (parsedLegacyPair > 0) {
                this.amount = parsedLegacyPair;
            }
            this.displayAmount = this.amount;
        } catch (error) {
            console.warn('No se pudo restaurar estado del pozo:', error);
        }
    }

    /**
     * Persiste el estado actual del pozo en `localStorage`.
     * No requiere parámetros.
     */
    persistState() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify({
                amount: Math.round(this.amount),
                mayor: Math.round(this.amount),
                menor: 0,
                updatedAt: Date.now()
            }));
        } catch (error) {
            console.warn('No se pudo persistir estado del pozo:', error);
        }
    }

    /**
     * Refresca etiquetas de texto del pozo usando valores visualizados actuales.
     * Parámetros:
     * - `force` (boolean, opcional): Si es `true`, fuerza escritura de texto aunque no haya cambios.
     */
    updateTexts(force = false) {
        if (!this.amountTxt) return;

        const amountValue = Math.max(0, Math.round(this.displayAmount));
        const amountLabel = `$ ${this.formatPoints(amountValue)}`;

        if (force || this.amountTxt.text !== amountLabel) this.amountTxt.setText(amountLabel);
    }

    /**
     * Anima el valor visible hacia el valor objetivo del pozo.
     * Parámetros:
     * - `duration` (number, opcional): Duración de la transición en milisegundos.
     */
    animateToTarget(duration = 400) {
        if (!this.amountTxt) return;

        if (this.tweenAmount) this.tweenAmount.remove();

        this.tweenAmount = this.scene.tweens.addCounter({
            from: this.displayAmount,
            to: this.amount,
            duration,
            ease: 'Sine.easeOut',
            onUpdate: (tween) => {
                this.displayAmount = tween.getValue();
                this.updateTexts();
            }
        });
    }

    /**
     * Convierte un valor numérico o string formateado a número.
     * Parámetros:
     * - `value` (number|string): Valor de entrada a parsear.
     */
    parseValue(value) {
        if (Number.isFinite(value)) return Number(value);
        if (typeof value === 'string') {
            const digitsOnly = value.replace(/[^\d]/g, '');
            if (!digitsOnly) return NaN;
            return Number(digitsOnly);
        }
        return NaN;
    }

    /**
     * Aplica nuevos valores de jackpot desde un payload y actualiza visualmente.
     * Parámetros:
     * - `payload` (object, opcional): Objeto con claves de valor acumulado (incluye compatibilidad legacy).
     * - `animate` (boolean, opcional): Define si la actualización debe ser animada.
     */
    setValues(payload = {}, animate = true) {
        const nextAmount = this.parseValue(
            payload?.amount ??
            payload?.total ??
            payload?.value ??
            payload?.jackpot ??
            payload?.pozo ??
            payload?.acumulado
        );
        const nextMayor = this.parseValue(payload?.mayor ?? payload?.major ?? payload?.jackpotMayor);
        const nextMenor = this.parseValue(payload?.menor ?? payload?.minor ?? payload?.jackpotMenor);
        const nextLegacyPair = (Number.isFinite(nextMayor) ? nextMayor : 0) + (Number.isFinite(nextMenor) ? nextMenor : 0);

        if (Number.isFinite(nextAmount) && nextAmount >= 0) {
            this.amount = nextAmount;
        } else if (nextLegacyPair > 0) {
            this.amount = nextLegacyPair;
        }

        if (animate) {
            this.animateToTarget(450);
        } else {
            this.displayAmount = this.amount;
            this.updateTexts(true);
        }
        this.persistState();
    }

    /**
     * Incrementa el jackpot según reglas de contribución configuradas.
     * Parámetros:
     * - `amount` (number): Monto base sobre el que se calcula el aporte.
     */
    addContribution(amount) {
        const safeAmount = Number(amount);
        if (!Number.isFinite(safeAmount) || safeAmount <= 0) return;

        const totalIncrease = Math.round(safeAmount * this.totalContribution);
        this.amount += totalIncrease;
        this.animateToTarget(300);
        this.persistState();
    }

    /**
     * Escala el contenedor al ancho objetivo y recalcula layout de textos.
     * Parámetros:
     * - `targetWidth` (number): Ancho final deseado para el jackpot.
     */
    applyScale(targetWidth) {
        if (!this.hasVisuals()) return null;

        const textureWidth = this.getTextureWidth();
        const textureHeight = this.getTextureHeight();
        const scale = targetWidth / textureWidth;
        this.container.setScale(scale);

        this.applyTextLayout(targetWidth, scale);

        const visualHeight = textureHeight * scale * this.getVisualHeightFactor();
        return { scale, visualHeight };
    }

    /**
     * Posiciona el jackpot usando coordenada superior y ancho objetivo.
     * Parámetros:
     * - `x` (number): Posición horizontal del centro.
     * - `top` (number): Coordenada superior donde debe comenzar el jackpot.
     * - `targetWidth` (number): Ancho final deseado.
     */
    layoutByTop(x, top, targetWidth) {
        const result = this.applyScale(targetWidth);
        if (!result) return null;

        const y = top + (result.visualHeight / 2);
        this.layer.setPosition(x, y);
        return {
            y,
            width: targetWidth,
            height: result.visualHeight,
            bottom: y + (result.visualHeight / 2),
            scale: result.scale
        };
    }

    /**
     * Posiciona el jackpot usando coordenada central vertical y ancho objetivo.
     * Parámetros:
     * - `x` (number): Posición horizontal del centro.
     * - `y` (number): Posición vertical del centro.
     * - `targetWidth` (number): Ancho final deseado.
     */
    layoutByCenterY(x, y, targetWidth) {
        const result = this.applyScale(targetWidth);
        if (!result) return null;

        this.layer.setPosition(x, y);
        return {
            y,
            width: targetWidth,
            height: result.visualHeight,
            bottom: y + (result.visualHeight / 2),
            scale: result.scale
        };
    }

    /**
     * Ajusta tipografía, offsets y escala local del texto del pozo acumulado.
     * Parámetros:
     * - `targetWidth` (number): Ancho final del jackpot en pantalla.
     * - `scale` (number): Escala global aplicada al contenedor.
     */
    applyTextLayout(targetWidth, scale) {
        if (!this.amountTxt || !this.image) return;

        const baseFontSize = 40;
        const legacyFinalFontSize = Phaser.Math.Clamp(targetWidth * 0.058, 24, 56);
        const desiredFinalFontSize = Phaser.Math.Clamp(targetWidth * 0.064, 24, 60);
        const strokeThickness = Math.round(Phaser.Math.Clamp(desiredFinalFontSize * 0.12, 4, 8));
        const legacyScale = Phaser.Math.Clamp(legacyFinalFontSize / Math.max(baseFontSize * scale, 0.01), 0.65, 1.35);
        let localTextScale = Phaser.Math.Clamp(desiredFinalFontSize / Math.max(baseFontSize * scale, 0.01), 0.65, 1.45);
        const textX = Math.round(this.image.width * this.valueXRatio);
        const textY = Math.round(this.image.height * this.valueYRatio);
        const maxFinalTextWidth = targetWidth * 0.62;

        this.amountTxt
            .setPosition(textX, textY)
            .setFontSize(baseFontSize)
            .setStroke('#1b3258', strokeThickness)
            .setScale(localTextScale);

        // Ajuste de seguridad: si el texto se acerca al borde del panel, reducir escala.
        if (this.amountTxt.displayWidth > maxFinalTextWidth) {
            const fitScale = localTextScale * (maxFinalTextWidth / this.amountTxt.displayWidth);
            localTextScale = Phaser.Math.Clamp(fitScale, legacyScale, localTextScale);
            this.amountTxt.setScale(localTextScale);
        }
    }

    /**
     * Libera tweens activos y persiste estado final antes de destruir/reemplazar el UI.
     * No requiere parámetros.
     */
    destroy() {
        if (this.tweenAmount) {
            this.tweenAmount.remove();
            this.tweenAmount = null;
        }
        this.persistState();
    }
}
