import Phaser from 'phaser';
import logoAsset from '../assets/logo.webp';
import pozoAsset from '../assets/pozo.webp';

export class BootScene extends Phaser.Scene {
    /**
     * Inicializa la escena de arranque y define su clave de registro.
     * No requiere parámetros.
     */
    constructor() {
        super({ key: 'BootScene' });
    }

    /**
     * Precarga recursos mínimos usados por la pantalla de carga.
     * No requiere parámetros.
     */
    preload() {
        if (!this.textures.exists('loading_logo')) {
            this.load.image('loading_logo', logoAsset);
        }
    }

    /**
     * Transiciona desde arranque hacia la escena de carga principal.
     * No requiere parámetros.
     */
    create() {
        this.scene.start('LoadingScene');
    }
}

export class LoadingScene extends Phaser.Scene {
    /**
     * Inicializa la escena de carga y define su clave de registro.
     * No requiere parámetros.
     */
    constructor() {
        super({ key: 'LoadingScene' });
    }

    /**
     * Construye UI de progreso, carga assets principales y abre la escena de juego.
     * No requiere parámetros.
     */
    create() {
        const w = this.scale.width;
        const h = this.scale.height;
        const simulatedLoadingMs = 2000;
        let didTransition = false;
        let loadingStarted = false;
        let simulatedDone = false;
        let realLoadDone = false;
        let lastLoadingSfxStep = -1;

        window.__audioPhase = 'loading';
        window.dispatchEvent(new CustomEvent('audio-phase-changed', {
            detail: { phase: 'loading' }
        }));

        this.cameras.main.setBackgroundColor('#050a14');

        const logoY = h * 0.42;
        const logoGray = this.add.image(w / 2, logoY, 'loading_logo').setOrigin(0.5);
        const logoColor = this.add.image(w / 2, logoY, 'loading_logo').setOrigin(0.5);
        const logoScale = Math.min((w * 0.3) / logoColor.width, (h * 0.3) / logoColor.height, 2.2);
        logoGray.setScale(logoScale);
        logoColor.setScale(logoScale);
        logoGray.setTint(0x6b7280);
        logoGray.setAlpha(0.95);

        const logoDisplayWidth = logoColor.displayWidth;
        const logoDisplayHeight = logoColor.displayHeight;
        const logoLeft = logoColor.x - (logoDisplayWidth / 2);
        const logoTop = logoColor.y - (logoDisplayHeight / 2);
        const revealMaskShape = this.make.graphics();
        const revealMask = revealMaskShape.createGeometryMask();
        logoColor.setMask(revealMask);

        const loadingLabel = this.add.text(w / 2, logoTop + logoDisplayHeight + 36, 'Cargando 0%', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#D1D5DB',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        /**
         * Actualiza el logo/etiqueta usando el progreso mostrado en pantalla.
         * Parámetros:
         * - `value` (number): Progreso normalizado entre `0` y `1`.
         */
        const updateProgressVisual = (value) => {
            const progress = Phaser.Math.Clamp(value, 0, 1);
            const revealWidth = logoDisplayWidth * progress;

            revealMaskShape.clear();
            revealMaskShape.fillStyle(0xffffff, 1);
            revealMaskShape.fillRect(logoLeft, logoTop, revealWidth, logoDisplayHeight);

            loadingLabel.setText(`Cargando ${Math.round(progress * 100)}%`);

            const sfxStep = Math.floor(progress * 10);
            if (progress > 0 && sfxStep > lastLoadingSfxStep) {
                lastLoadingSfxStep = sfxStep;
                if (window.playLoadingFillSfx) window.playLoadingFillSfx(progress);
            }
        };

        /**
         * Intenta abrir `MainScene` sólo cuando termina carga real y simulación visual.
         * No requiere parámetros.
         */
        const tryGoToMainScene = () => {
            if (didTransition || !simulatedDone || !realLoadDone) return;
            didTransition = true;
            window.__audioPhase = 'main';
            window.dispatchEvent(new CustomEvent('audio-phase-changed', {
                detail: { phase: 'main' }
            }));
            this.scene.start('MainScene');
        };

        /**
         * Inicia la simulación de progreso visual por 2 segundos exactos.
         * No requiere parámetros.
         */
        const startSimulatedProgress = () => {
            this.tweens.addCounter({
                from: 0,
                to: 1,
                duration: simulatedLoadingMs,
                ease: 'Linear',
                onUpdate: (tween) => {
                    updateProgressVisual(tween.getValue());
                },
                onComplete: () => {
                    updateProgressVisual(1);
                    simulatedDone = true;
                    tryGoToMainScene();
                }
            });
        };

        /**
         * Arranca la carga real de assets una sola vez y coordina su finalización.
         * No requiere parámetros.
         */
        const startAssetLoading = () => {
            if (loadingStarted) return;
            loadingStarted = true;
            startSimulatedProgress();

            this.load.once('complete', () => {
                realLoadDone = true;
                tryGoToMainScene();
            });

            if (!this.textures.exists('bg')) this.load.image('bg', 'img/backgrounds2.webp');
            if (!this.textures.exists('symbols')) this.load.image('symbols', 'img/frutas.webp');
            if (!this.textures.exists('pozo')) this.load.image('pozo', pozoAsset);

            if (this.load.list.size === 0) {
                realLoadDone = true;
                tryGoToMainScene();
                return;
            }

            this.load.start();
        };

        /**
         * Crea botón rectangular para decidir activación de sonido en la carga.
         * Parámetros:
         * - `x` (number): Centro X del botón.
         * - `y` (number): Centro Y del botón.
         * - `label` (string): Texto visible del botón.
         * - `fill` (number): Color de fondo en formato hexadecimal numérico.
         * - `onPress` (Function): Callback ejecutado al presionar el botón.
         */
        const createChoiceButton = (x, y, label, fill, onPress, metrics = {}) => {
            const buttonWidth = metrics.width || 176;
            const buttonHeight = metrics.height || 56;
            const buttonFontSize = metrics.fontSize || 26;
            const buttonRadius = metrics.radius || 28;

            const button = this.add.container(x, y).setDepth(24);
            const shadow = this.add.ellipse(0, (buttonHeight * 0.36), buttonWidth * 0.74, 10, 0x000000, 0.14);
            const bg = this.add.graphics();
            bg.fillStyle(fill, 1);
            bg.lineStyle(2, 0xffffff, 0.2);
            bg.fillRoundedRect(-(buttonWidth / 2), -(buttonHeight / 2), buttonWidth, buttonHeight, buttonRadius);
            bg.strokeRoundedRect(-(buttonWidth / 2), -(buttonHeight / 2), buttonWidth, buttonHeight, buttonRadius);
            const buttonText = this.add.text(0, 1, label, {
                fontFamily: 'Arial',
                fontSize: `${buttonFontSize}px`,
                fontStyle: 'italic',
                color: '#F4F5F7'
            }).setOrigin(0.5).setResolution(2);

            button.add([shadow, bg, buttonText]);
            button.setSize(buttonWidth, buttonHeight);
            button.setInteractive({ useHandCursor: true });
            button.on('pointerdown', () => {
                if (window.playButtonSfx) window.playButtonSfx();
                onPress();
            });

            return button;
        };

        /**
         * Muestra modal de consentimiento de audio y empieza carga tras elegir.
         * No requiere parámetros.
         */
        const showAudioConsentModal = () => {
            const overlay = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.7)
                .setDepth(20)
                .setInteractive();
            const isCompactPortrait = h > w && w <= 520;
            const phoneScale = Phaser.Math.Clamp(Math.min(w / 430, h / 932), 0.84, 1.06);
            const panelWidth = isCompactPortrait
                ? Phaser.Math.Clamp(Math.round(w * 0.76 * phoneScale), 290, 360)
                : Math.min(Math.round(w * 0.88), 620);
            const panelHeight = isCompactPortrait
                ? Math.round(panelWidth * 0.62)
                : 300;
            const panelX = w / 2;
            const panelY = h / 2;
            const panelPadding = 8;
            const panelTop = panelY - (panelHeight / 2);
            const panelBottom = panelY + (panelHeight / 2);
            const innerTop = panelTop + panelPadding;
            const innerBottom = panelBottom - panelPadding;
            const innerWidth = panelWidth - (panelPadding * 2);
            const buttonGap = Phaser.Math.Clamp(Math.round(panelWidth * 0.055), 14, 24);
            const buttonHorizontalInset = Phaser.Math.Clamp(Math.round(panelWidth * 0.09), 22, 36);
            const buttonWidth = Phaser.Math.Clamp(
                Math.round((innerWidth - (buttonHorizontalInset * 2) - buttonGap) / 2),
                96,
                140
            );
            const buttonHeight = Phaser.Math.Clamp(Math.round(buttonWidth * 0.36), 42, 52);
            const buttonFontSize = Phaser.Math.Clamp(Math.round(buttonHeight * 0.42), 16, 24);
            const requestedCenterOffsetX = Math.round((buttonWidth + buttonGap) / 2);
            const maxCenterOffsetX = Math.floor((panelWidth / 2) - buttonHorizontalInset - (buttonWidth / 2));
            const buttonCenterOffsetX = Math.max(0, Math.min(requestedCenterOffsetX, maxCenterOffsetX));
            const buttonBottomInset = panelPadding + 4;
            const buttonY = panelBottom - buttonBottomInset - (buttonHeight / 2);
            const dividerY = Phaser.Math.Clamp(
                buttonY - Math.round(buttonHeight * 0.08),
                innerTop + Math.round(panelHeight * 0.25),
                innerBottom - 8
            );

            const panel = this.add.graphics().setDepth(21);
            panel.fillStyle(0xefeff1, 1);
            panel.lineStyle(4, 0xefeff1, 1);
            panel.fillRoundedRect(panelX - (panelWidth / 2), panelY - (panelHeight / 2), panelWidth, panelHeight, 24);
            panel.strokeRoundedRect(panelX - (panelWidth / 2), panelY - (panelHeight / 2), panelWidth, panelHeight, 24);

            const innerPanel = this.add.graphics().setDepth(22);
            innerPanel.fillStyle(0xc7c7ca, 1);
            innerPanel.fillRoundedRect(
                panelX - (panelWidth / 2) + panelPadding,
                panelY - (panelHeight / 2) + panelPadding,
                panelWidth - (panelPadding * 2),
                panelHeight - (panelPadding * 2),
                18
            );
            // Franja inferior clara para que el panel gris llegue hasta la línea de botones.
            innerPanel.fillStyle(0xefeff1, 1);
            innerPanel.fillRect(
                panelX - (panelWidth / 2) + panelPadding,
                dividerY,
                panelWidth - (panelPadding * 2),
                Math.max(0, innerBottom - dividerY)
            );

            const titleY = panelY - Math.round(panelHeight * (isCompactPortrait ? 0.18 : 0.22));
            const subtitleY = panelY - Math.round(panelHeight * (isCompactPortrait ? 0.04 : 0.09));
            const titleFontSize = `${Math.round(Phaser.Math.Clamp(panelWidth * (isCompactPortrait ? 0.06 : 0.046), 18, 30))}px`;
            const title = this.add.text(panelX, titleY, '¿QUIERES HABILITAR SONIDOS?', {
                fontFamily: 'Luckiest Guy, Arial',
                fontSize: titleFontSize,
                fontStyle: 'italic',
                color: '#2e333a',
                align: 'center',
                wordWrap: { width: panelWidth - 90, useAdvancedWrap: true }
            }).setOrigin(0.5).setDepth(22).setResolution(2);
            const subtitle = this.add.text(panelX, subtitleY, 'Selecciona una opción para comenzar', {
                fontFamily: 'Luckiest Guy, Arial',
                fontSize: isCompactPortrait ? '15px' : '16px',
                color: '#4b5160'
            }).setOrigin(0.5).setDepth(22).setResolution(2);

            const cleanupAndStart = (activateAudio) => {
                window.__audioConsentEnabled = Boolean(activateAudio);
                window.dispatchEvent(new CustomEvent('audio-consent-changed', {
                    detail: { enabled: Boolean(activateAudio) }
                }));

                if (activateAudio && window.bootstrapAudioEngine) {
                    window.bootstrapAudioEngine();
                }
                overlay.destroy();
                panel.destroy();
                innerPanel.destroy();
                title.destroy();
                subtitle.destroy();
                yesBtn.destroy();
                noBtn.destroy();
                startAssetLoading();
            };

            const buttonMetrics = {
                width: buttonWidth,
                height: buttonHeight,
                fontSize: buttonFontSize,
                radius: Math.round(buttonHeight / 2)
            };
            const yesBtn = createChoiceButton(panelX - buttonCenterOffsetX, buttonY, 'SÍ', 0x6c6f74, () => {
                cleanupAndStart(true);
            }, buttonMetrics);
            const noBtn = createChoiceButton(panelX + buttonCenterOffsetX, buttonY, 'NO', 0x35383d, () => {
                cleanupAndStart(false);
            }, buttonMetrics);
        };

        updateProgressVisual(0);
        showAudioConsentModal();
    }
}
