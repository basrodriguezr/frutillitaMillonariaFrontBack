import Phaser from 'phaser';
import logoAsset from '../assets/logo.webp';
import pozoAsset from '../assets/pozo.webp';

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        if (!this.textures.exists('loading_logo')) {
            this.load.image('loading_logo', logoAsset);
        }
    }

    create() {
        this.scene.start('LoadingScene');
    }
}

export class LoadingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LoadingScene' });
    }

    create() {
        const w = this.scale.width;
        const h = this.scale.height;
        const minLoadingMs = 2000;
        const loadingStartedAt = Date.now();
        let didTransition = false;

        this.cameras.main.setBackgroundColor('#050a14');

        const logo = this.add.image(w / 2, h * 0.42, 'loading_logo').setOrigin(0.5);
        const logoScale = Math.min((w * 0.3) / logo.width, (h * 0.3) / logo.height, 2.2);
        logo.setScale(logoScale);

        const barWidth = Math.min(w * 0.7, 400);
        const barHeight = 24;
        const barX = (w - barWidth) / 2;
        const barY = h * 0.72;

        const barBg = this.add.graphics();
        barBg.fillStyle(0x1f2937, 1);
        barBg.lineStyle(2, 0x4b5563, 1);
        barBg.fillRoundedRect(barX, barY, barWidth, barHeight, 10);
        barBg.strokeRoundedRect(barX, barY, barWidth, barHeight, 10);

        const barFill = this.add.graphics();
        const loadingLabel = this.add.text(w / 2, barY + 45, 'Cargando 0%', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#D1D5DB',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const updateProgress = (value) => {
            const progress = Phaser.Math.Clamp(value, 0, 1);
            const fillWidth = (barWidth - 6) * progress;

            barFill.clear();
            barFill.fillStyle(0xFFFF00, 1);
            barFill.fillRoundedRect(barX + 3, barY + 3, fillWidth, barHeight - 6, 8);

            loadingLabel.setText(`Cargando ${Math.round(progress * 100)}%`);
        };

        const goToMainScene = () => {
            if (didTransition) return;
            didTransition = true;

            const elapsed = Date.now() - loadingStartedAt;
            const pending = Math.max(0, minLoadingMs - elapsed);

            this.time.delayedCall(pending, () => this.scene.start('MainScene'));
        };

        updateProgress(0);

        this.load.on('progress', updateProgress);
        this.load.once('complete', () => {
            this.load.off('progress', updateProgress);
            updateProgress(1);
            loadingLabel.setText('100%');
            goToMainScene();
        });

        if (!this.textures.exists('bg')) this.load.image('bg', 'img/backgrounds2.webp');
        if (!this.textures.exists('symbols')) this.load.image('symbols', 'img/frutas.webp');
        if (!this.textures.exists('pozo')) this.load.image('pozo', pozoAsset);

        if (this.load.list.size === 0) {
            updateProgress(1);
            loadingLabel.setText('100%');
            goToMainScene();
            return;
        }

        this.load.start();
    }
}
