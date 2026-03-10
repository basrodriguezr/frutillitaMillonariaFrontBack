/**
 * Aplica animación resaltada a un símbolo ganador.
 * Parámetros:
 * - `originalSprite` (Phaser.GameObjects.Sprite): Símbolo ganador a animar.
 */
export function animateWinningSymbol(originalSprite) {
        const matrix = originalSprite.getWorldTransformMatrix();
        const clone = this.add.image(matrix.tx, matrix.ty, originalSprite.texture.key, originalSprite.frame.name);
        clone.setScale(matrix.scaleX, matrix.scaleY); this.layerAnimations.add(clone); originalSprite.alpha = 0;

        let pulseDuration = 750;
        if (this.currentSpeedLevel === 2) pulseDuration = 500;
        this.tweens.add({ targets: clone, scaleX: matrix.scaleX * 1.50, scaleY: matrix.scaleY * 1.50, duration: pulseDuration, yoyo: true, repeat: 0, ease: 'Sine.easeInOut' });

        if (!this.winningClones) this.winningClones = [];
        this.winningClones.push({ clone: clone, original: originalSprite });
    }

/**
 * Detiene y limpia animaciones activas de símbolos ganadores.
 * No requiere parámetros.
 */
export function clearWinAnimations() {
        if (!this.winningClones) return;
        this.winningClones.forEach(item => { item.clone.destroy(); item.original.alpha = 1; if (item.original.baseScale) { item.original.setScale(item.original.baseScale); } });
        this.winningClones = []; 
    }
