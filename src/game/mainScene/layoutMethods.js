import Phaser from 'phaser';
import { CONFIG_GAME, JACKPOT_SIZE_BOOST, VIEWPORT_RANGE_OVERRIDES, VIEWPORT_RESOLUTION_OVERRIDES, VIEWPORT_SCALE_MODEL } from './constants';
import { applyGameLayout } from './layoutGame';
import { applyHudAndFallbackLayout } from './layoutHud';
import { applyLobbyLayout } from './layoutLobby';
import { applyShopLayout } from './layoutShop';

/**
 * Obtiene el inset inferior del sistema para evitar solapamiento con barras del dispositivo.
 * No requiere parámetros.
 */
export function getBottomSystemInset() {
        if (typeof window === 'undefined') return 0;
        const vv = window.visualViewport;
        if (!vv) return 0;
        const rawInset = (window.innerHeight || this.scale.height || 0) - (vv.height + vv.offsetTop);
        if (!Number.isFinite(rawInset)) return 0;
        return Math.max(0, rawInset);
    }

/**
 * Calcula el perfil de viewport usado por las reglas de escalado responsivo.
 * Parámetros:
 * - `width` (number): Ancho actual del viewport.
 * - `height` (number): Alto actual del viewport.
 */
export function getViewportScaleProfile(width, height) {
        const safeWidth = Math.max(1, Math.round(Number(width) || 1));
        const safeHeight = Math.max(1, Math.round(Number(height) || 1));
        const orientation = safeHeight > safeWidth ? 'portrait' : 'landscape';
        const shortSide = Math.min(safeWidth, safeHeight);
        const longSide = Math.max(safeWidth, safeHeight);
        const hasTouchInput = typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0;

        let profileKey = 'desktop-landscape';
        if (orientation === 'portrait') {
            profileKey = safeWidth <= 767 ? 'mobile-portrait' : 'tablet-portrait';
        } else if (safeWidth <= 960 || shortSide <= 500) {
            profileKey = 'mobile-landscape';
        } else if (safeWidth <= 1366 && (hasTouchInput || shortSide <= 900)) {
            profileKey = 'tablet-landscape';
        }

        const model = VIEWPORT_SCALE_MODEL[profileKey] || VIEWPORT_SCALE_MODEL['desktop-landscape'];
        const baseScale = Math.min(
            safeWidth / model.baseResolution.width,
            safeHeight / model.baseResolution.height
        );
        const viewportScale = Phaser.Math.Clamp(baseScale, model.scaleClamp.min, model.scaleClamp.max);

        return {
            width: safeWidth,
            height: safeHeight,
            shortSide,
            longSide,
            orientation,
            isPortrait: orientation === 'portrait',
            profileKey,
            deviceType: profileKey.split('-')[0],
            scale: viewportScale,
            ...model
        };
    }

/**
 * Evalúa si un viewport cumple una regla de rango configurable.
 * Parámetros:
 * - `match` (object, opcional): Regla de coincidencia de viewport a evaluar.
 * - `width` (number): Ancho actual del viewport.
 * - `height` (number): Alto actual del viewport.
 * - `orientation` (string): Orientación del viewport (`portrait` o `landscape`).
 */
export function matchesViewportRange(match = {}, width, height, orientation) {
        if (match.orientation && match.orientation !== orientation) return false;
        if (Number.isFinite(match.minWidth) && width < match.minWidth) return false;
        if (Number.isFinite(match.maxWidth) && width > match.maxWidth) return false;
        if (Number.isFinite(match.minHeight) && height < match.minHeight) return false;
        if (Number.isFinite(match.maxHeight) && height > match.maxHeight) return false;
        return true;
    }

/**
 * Fusiona dos objetos de overrides preservando configuración previa.
 * Parámetros:
 * - `base` (object, opcional): Objeto base de configuración.
 * - `incoming` (object, opcional): Objeto de configuración entrante para fusionar.
 */
export function mergeOverrideScopes(base = {}, incoming = {}) {
        const merged = { ...base };
        Object.entries(incoming || {}).forEach(([scope, values]) => {
            if (values && typeof values === 'object' && !Array.isArray(values)) {
                merged[scope] = { ...(merged[scope] || {}), ...values };
                return;
            }
            merged[scope] = values;
        });
        return merged;
    }

/**
 * Resuelve overrides de layout aplicables al viewport actual.
 * Parámetros:
 * - `width` (number): Ancho actual del viewport.
 * - `height` (number): Alto actual del viewport.
 * - `viewportProfile` (object|null, opcional): Perfil de viewport precalculado.
 */
export function getViewportOverrides(width, height, viewportProfile = null) {
        const safeWidth = Math.max(1, Math.round(Number(width) || 1));
        const safeHeight = Math.max(1, Math.round(Number(height) || 1));
        const orientation = viewportProfile?.orientation || (safeHeight > safeWidth ? 'portrait' : 'landscape');
        const key = `${safeWidth}x${safeHeight}`;

        let mergedOverrides = {};
        VIEWPORT_RANGE_OVERRIDES.forEach((rule) => {
            if (!rule?.match || !rule?.overrides) return;
            if (!this.matchesViewportRange(rule.match, safeWidth, safeHeight, orientation)) return;
            mergedOverrides = this.mergeOverrideScopes(mergedOverrides, rule.overrides);
        });

        const exactOverrides = VIEWPORT_RESOLUTION_OVERRIDES[key];
        if (exactOverrides) {
            mergedOverrides = this.mergeOverrideScopes(mergedOverrides, exactOverrides);
        }

        return Object.keys(mergedOverrides).length ? mergedOverrides : null;
    }

/**
 * Recalcula posiciones y escalas según tamaño de pantalla.
 * Parámetros:
 * - `size` (object): Objeto con dimensiones de viewport (`width`, `height`).
 */
export function applyResponsiveLayout(size) {
        if (!this.layerGame) return; 
        
        const w = size.width;
        const h = size.height;
        const viewportProfile = this.getViewportScaleProfile(w, h);
        const isPortrait = viewportProfile.isPortrait;
        const isMobilePortrait = viewportProfile.profileKey === 'mobile-portrait';
        const isTabletPortrait = viewportProfile.profileKey === 'tablet-portrait';
        const isMobileLandscape = viewportProfile.profileKey === 'mobile-landscape';
        const isTabletLandscape = viewportProfile.profileKey === 'tablet-landscape';
        const thresholds = viewportProfile.thresholds;
        const viewportOverrides = this.getViewportOverrides(w, h, viewportProfile) || {};
        const sharedCfg = {
            contentMinWidth: 240,
            jackpotCompactAspectThreshold: 2.2,
            jackpotCompactHeightFactor: 0.38,
            lobbyScaleMin: 0.72,
            lobbyScaleMax: 1.12,
            shopScaleMin: 0.72,
            shopScaleMax: 1.12,
            shopCardsScaleMin: 0.72,
            shopCardsScaleMax: 1.14,
            shopResultScaleMin: 0.72,
            shopResultScaleMax: 1.12,
            gameBoardScaleMin: 0.74,
            gameBoardScaleMax: 1.0,
            gameInfoScaleMin: 0.72,
            gameInfoScaleMax: 1.06,
            gameControlsScaleMin: 0.7,
            gameControlsScaleMax: 1.04,
            shopTitleScaleMin: 0.8,
            shopTitleScaleMax: 1.1
        };
        const sharedTuning = { ...sharedCfg, ...(viewportOverrides.shared || {}) };
        const sidePadding = isPortrait
            ? viewportProfile.layout.sidePaddingPortrait
            : viewportProfile.layout.sidePaddingLandscape;
        const hudRightReserve = isPortrait
            ? viewportProfile.layout.hudRightReservePortrait
            : Math.round(
                Math.max(
                    viewportProfile.layout.hudRightReserveLandscapeMin,
                    Math.min(
                        viewportProfile.layout.hudRightReserveLandscapeMax,
                        w * viewportProfile.layout.hudRightReserveLandscapeRatio
                    )
                )
            );
        const contentLeft = sidePadding;
        const contentRight = Math.max(contentLeft + sharedTuning.contentMinWidth, w - hudRightReserve - sidePadding);
        const contentWidth = Math.max(sharedTuning.contentMinWidth, contentRight - contentLeft);
        const lobbyScaleFactor = Phaser.Math.Clamp(viewportProfile.scale * viewportProfile.sections.lobby, sharedTuning.lobbyScaleMin, sharedTuning.lobbyScaleMax);
        const shopScaleFactor = Phaser.Math.Clamp(viewportProfile.scale * viewportProfile.sections.shop, sharedTuning.shopScaleMin, sharedTuning.shopScaleMax);
        const shopCardsScaleFactor = Phaser.Math.Clamp(viewportProfile.scale * viewportProfile.sections.shopCards, sharedTuning.shopCardsScaleMin, sharedTuning.shopCardsScaleMax);
        const shopResultScaleFactor = Phaser.Math.Clamp(viewportProfile.scale * viewportProfile.sections.shopResult, sharedTuning.shopResultScaleMin, sharedTuning.shopResultScaleMax);
        const gameBoardScaleFactor = Phaser.Math.Clamp(viewportProfile.scale * viewportProfile.sections.gameBoard, sharedTuning.gameBoardScaleMin, sharedTuning.gameBoardScaleMax);
        const gameInfoScaleFactor = Phaser.Math.Clamp(viewportProfile.scale * viewportProfile.sections.gameInfo, sharedTuning.gameInfoScaleMin, sharedTuning.gameInfoScaleMax);
        const gameControlsScaleFactor = Phaser.Math.Clamp(viewportProfile.scale * viewportProfile.sections.gameControls, sharedTuning.gameControlsScaleMin, sharedTuning.gameControlsScaleMax);
        const shopTitleScaleFactor = Phaser.Math.Clamp(viewportProfile.scale * viewportProfile.sections.shopTitle, sharedTuning.shopTitleScaleMin, sharedTuning.shopTitleScaleMax);
        let jackpotHandled = false;
        const hasJackpot = this.layerJackpot && this.jackpotUI && this.jackpotUI.hasVisuals();
        const jackpotAspect = hasJackpot ? this.jackpotUI.getAspect() : 1.5;
        const jackpotVisualHeightFactor = jackpotAspect < sharedTuning.jackpotCompactAspectThreshold
            ? sharedTuning.jackpotCompactHeightFactor
            : 1;
        const jackpotVisualAspect = jackpotAspect / jackpotVisualHeightFactor;
        /**
         * Ajusta el ancho del jackpot para respetar un alto máximo relativo.
         * Parámetros:
         * - `baseWidth` (number): Ancho base objetivo antes de limitar.
         * - `maxHeightRatio` (number): Relación máxima de alto respecto a la pantalla.
         */
        const fitJackpotWidth = (baseWidth, maxHeightRatio) => {
            const byHeight = h * maxHeightRatio * jackpotVisualAspect;
            return Math.min(baseWidth, byHeight);
        };
        /**
         * Posiciona el jackpot desde el borde superior y retorna bounds útiles.
         * Parámetros:
         * - `x` (number): Centro X donde ubicar el jackpot.
         * - `top` (number): Borde superior destino.
         * - `baseWidth` (number): Ancho base a escalar.
         * - `maxHeightRatio` (number): Relación máxima de alto permitida.
         */
        const placeJackpot = (x, top, baseWidth, maxHeightRatio) => {
            if (!hasJackpot) return null;
            const targetWidth = fitJackpotWidth(baseWidth * JACKPOT_SIZE_BOOST, maxHeightRatio);
            const layout = this.jackpotUI.layoutByTop(x, top, targetWidth);
            if (!layout) return null;

            jackpotHandled = true;
            return layout;
        };

        if(this.bg) {
            this.bg.setPosition(w/2, h/2);
            this.bg.setScale(Math.max(w/this.bg.width, h/this.bg.height));
        }

        if (this.uiElements.landscapeGameTitle) {
            this.uiElements.landscapeGameTitle.setVisible(false);
        }


        applyLobbyLayout({
            scene: this,
            w,
            h,
            isPortrait,
            viewportOverrides,
            contentWidth,
            lobbyScaleFactor,
            placeJackpot
        });


        applyShopLayout({
            scene: this,
            w,
            h,
            isPortrait,
            isMobilePortrait,
            isTabletPortrait,
            isMobileLandscape,
            isTabletLandscape,
            thresholds,
            viewportOverrides,
            contentLeft,
            contentRight,
            contentWidth,
            shopScaleFactor,
            shopCardsScaleFactor,
            shopResultScaleFactor,
            gameControlsScaleFactor,
            shopTitleScaleFactor,
            placeJackpot
        });


        applyGameLayout({
            scene: this,
            w,
            h,
            isPortrait,
            isMobilePortrait,
            isTabletPortrait,
            thresholds,
            viewportOverrides,
            contentLeft,
            contentRight,
            contentWidth,
            gameBoardScaleFactor,
            gameInfoScaleFactor,
            gameControlsScaleFactor,
            placeJackpot
        });

        applyHudAndFallbackLayout({
            scene: this,
            w,
            h,
            isPortrait,
            isMobilePortrait,
            isTabletPortrait,
            thresholds,
            viewportProfile,
            viewportOverrides,
            contentLeft,
            contentRight,
            contentWidth,
            hasJackpot,
            jackpotHandled,
            jackpotAspect,
            fitJackpotWidth
        });}
