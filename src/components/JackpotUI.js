import Phaser from 'phaser';

export class JackpotUI {
    constructor(scene, layer, options = {}) {
        this.scene = scene;
        this.layer = layer;
        this.textureKey = options.textureKey ?? 'pozo';
        this.storageKey = options.storageKey ?? 'frutilla_jackpot_state_v1';
        this.totalContribution = Number.isFinite(options.totalContribution) ? options.totalContribution : 0.60;
        this.minorShare = Number.isFinite(options.minorShare) ? options.minorShare : 0.30;
        this.formatPoints = typeof options.formatPoints === 'function'
            ? options.formatPoints
            : (num) => Math.round(num).toString();

        this.mayor = 0;
        this.menor = 0;
        this.displayMayor = 0;
        this.displayMenor = 0;

        this.tweenMayor = null;
        this.tweenMenor = null;

        this.container = null;
        this.image = null;
        this.mayorTxt = null;
        this.menorTxt = null;
    }

    create() {
        this.container = this.scene.add.container(0, 0);
        this.image = this.scene.add.image(0, 0, this.textureKey).setOrigin(0.5);

        const sideSlotX = this.image.width * 0.3;
        this.mayorTxt = this.scene.add.text(-sideSlotX, -10, `$ ${this.formatPoints(this.mayor)}`, {
            fontFamily: 'Luckiest Guy, Arial',
            fontSize: '52px',
            color: '#f8ff7c',
            stroke: '#1b3258',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.menorTxt = this.scene.add.text(sideSlotX, -10, `$ ${this.formatPoints(this.menor)}`, {
            fontFamily: 'Luckiest Guy, Arial',
            fontSize: '52px',
            color: '#f8ff7c',
            stroke: '#1b3258',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.container.add([this.image, this.mayorTxt, this.menorTxt]);
        this.layer.add(this.container);
    }

    hasVisuals() {
        return !!(this.layer && this.container && this.image);
    }

    getTextureWidth() {
        return (this.image && this.image.width > 0) ? this.image.width : 1536;
    }

    getTextureHeight() {
        return (this.image && this.image.height > 0) ? this.image.height : 1024;
    }

    getAspect() {
        return this.getTextureWidth() / this.getTextureHeight();
    }

    getVisualHeightFactor() {
        return this.getAspect() < 2.2 ? 0.38 : 1;
    }

    restoreState() {
        try {
            const rawState = localStorage.getItem(this.storageKey);
            if (!rawState) return;

            const parsed = JSON.parse(rawState);
            const mayor = Number(parsed?.mayor);
            const menor = Number(parsed?.menor);

            if (Number.isFinite(mayor) && mayor > 0) this.mayor = mayor;
            if (Number.isFinite(menor) && menor > 0) this.menor = menor;
            this.displayMayor = this.mayor;
            this.displayMenor = this.menor;
        } catch (error) {
            console.warn('No se pudo restaurar estado del pozo:', error);
        }
    }

    persistState() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify({
                mayor: Math.round(this.mayor),
                menor: Math.round(this.menor),
                updatedAt: Date.now()
            }));
        } catch (error) {
            console.warn('No se pudo persistir estado del pozo:', error);
        }
    }

    updateTexts(force = false) {
        if (!this.mayorTxt || !this.menorTxt) return;

        const mayorValue = Math.max(0, Math.round(this.displayMayor));
        const menorValue = Math.max(0, Math.round(this.displayMenor));
        const mayorLabel = `$ ${this.formatPoints(mayorValue)}`;
        const menorLabel = `$ ${this.formatPoints(menorValue)}`;

        if (force || this.mayorTxt.text !== mayorLabel) this.mayorTxt.setText(mayorLabel);
        if (force || this.menorTxt.text !== menorLabel) this.menorTxt.setText(menorLabel);
    }

    animateToTarget(duration = 400) {
        if (!this.mayorTxt || !this.menorTxt) return;

        if (this.tweenMayor) this.tweenMayor.remove();
        if (this.tweenMenor) this.tweenMenor.remove();

        this.tweenMayor = this.scene.tweens.addCounter({
            from: this.displayMayor,
            to: this.mayor,
            duration,
            ease: 'Sine.easeOut',
            onUpdate: (tween) => {
                this.displayMayor = tween.getValue();
                this.updateTexts();
            }
        });

        this.tweenMenor = this.scene.tweens.addCounter({
            from: this.displayMenor,
            to: this.menor,
            duration,
            ease: 'Sine.easeOut',
            onUpdate: (tween) => {
                this.displayMenor = tween.getValue();
                this.updateTexts();
            }
        });
    }

    parseValue(value) {
        if (Number.isFinite(value)) return Number(value);
        if (typeof value === 'string') {
            const digitsOnly = value.replace(/[^\d]/g, '');
            if (!digitsOnly) return NaN;
            return Number(digitsOnly);
        }
        return NaN;
    }

    setValues(payload = {}, animate = true) {
        const nextMayor = this.parseValue(payload?.mayor ?? payload?.major ?? payload?.jackpotMayor);
        const nextMenor = this.parseValue(payload?.menor ?? payload?.minor ?? payload?.jackpotMenor);

        if (Number.isFinite(nextMayor) && nextMayor >= 0) this.mayor = nextMayor;
        if (Number.isFinite(nextMenor) && nextMenor >= 0) this.menor = nextMenor;

        if (animate) {
            this.animateToTarget(450);
        } else {
            this.displayMayor = this.mayor;
            this.displayMenor = this.menor;
            this.updateTexts(true);
        }
        this.persistState();
    }

    addContribution(amount) {
        const safeAmount = Number(amount);
        if (!Number.isFinite(safeAmount) || safeAmount <= 0) return;

        const total = Math.round(safeAmount * this.totalContribution);
        const minorIncrease = Math.round(total * this.minorShare);
        const mayorIncrease = Math.max(0, total - minorIncrease);
        this.mayor += mayorIncrease;
        this.menor += minorIncrease;
        this.animateToTarget(300);
        this.persistState();
    }

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

    applyTextLayout(targetWidth, scale) {
        if (!this.mayorTxt || !this.menorTxt || !this.image) return;

        const baseFontSize = 40;
        const desiredFinalFontSize = Phaser.Math.Clamp(targetWidth * 0.058, 24, 56);
        const strokeThickness = Math.round(Phaser.Math.Clamp(desiredFinalFontSize * 0.12, 4, 8));
        const localTextScale = Phaser.Math.Clamp(desiredFinalFontSize / Math.max(baseFontSize * scale, 0.01), 0.65, 1.35);
        const sideOffset = this.image.width * 0.30;
        const textY = -Math.round(this.image.height * 0.01);

        this.mayorTxt
            .setPosition(-sideOffset, textY)
            .setFontSize(baseFontSize)
            .setStroke('#1b3258', strokeThickness)
            .setScale(localTextScale);

        this.menorTxt
            .setPosition(sideOffset, textY)
            .setFontSize(baseFontSize)
            .setStroke('#1b3258', strokeThickness)
            .setScale(localTextScale);
    }

    destroy() {
        if (this.tweenMayor) {
            this.tweenMayor.remove();
            this.tweenMayor = null;
        }
        if (this.tweenMenor) {
            this.tweenMenor.remove();
            this.tweenMenor = null;
        }
        this.persistState();
    }
}
