const CONFIG_GAME = { reelTotalWidth: 700, reelTotalHeight: 600, reels: 5, rows: 5 };
const CELL_W = CONFIG_GAME.reelTotalWidth / CONFIG_GAME.reels; 
const CELL_H = CONFIG_GAME.reelTotalHeight / CONFIG_GAME.rows;
const BET_VALUES = [100, 200, 300, 400, 500, 1000, 2000, 5000, 10000];
const JACKPOT_SIZE_BOOST = 1.15;
const HISTORY_STORAGE_KEY = 'frutilla_history_v1';
const VIEWPORT_SCALE_MODEL = {
    'mobile-portrait': {
        baseResolution: { width: 390, height: 844 },
        scaleClamp: { min: 0.78, max: 1.0 },
        layout: {
            sidePaddingPortrait: 10,
            sidePaddingLandscape: 14,
            hudRightReservePortrait: 66,
            hudRightReserveLandscapeRatio: 0.1,
            hudRightReserveLandscapeMin: 88,
            hudRightReserveLandscapeMax: 124,
            hudDockTopShop: 160
        },
        sections: {
            lobby: 0.92,
            shop: 0.88,
            shopCards: 0.88,
            shopResult: 0.9,
            gameBoard: 1.0,
            gameInfo: 0.9,
            gameControls: 0.88,
            shopTitle: 0.9
        },
        thresholds: {
            compactPortraitMaxW: 760,
            compactPortraitMaxH: 960,
            veryCompactPortraitMaxW: 460,
            veryCompactPortraitMaxH: 760,
            midPortraitMinW: 520,
            midPortraitMaxW: 860,
            shortLandscapeShopMaxH: 430,
            shortLandscapeGameMaxH: 520,
            veryShortLandscapeGameMaxH: 430,
            midLandscapeMinW: 640,
            midLandscapeMaxW: 940,
            wideLandscapeMinW: 1200
        }
    },
    'tablet-portrait': {
        baseResolution: { width: 834, height: 1112 },
        scaleClamp: { min: 0.84, max: 1.08 },
        layout: {
            sidePaddingPortrait: 12,
            sidePaddingLandscape: 16,
            hudRightReservePortrait: 52,
            hudRightReserveLandscapeRatio: 0.1,
            hudRightReserveLandscapeMin: 94,
            hudRightReserveLandscapeMax: 132,
            hudDockTopShop: 144
        },
        sections: {
            lobby: 0.98,
            shop: 0.96,
            shopCards: 0.96,
            shopResult: 0.96,
            gameBoard: 0.98,
            gameInfo: 0.97,
            gameControls: 0.96,
            shopTitle: 0.96
        },
        thresholds: {
            compactPortraitMaxW: 980,
            compactPortraitMaxH: 1180,
            veryCompactPortraitMaxW: 620,
            veryCompactPortraitMaxH: 900,
            midPortraitMinW: 760,
            midPortraitMaxW: 1120,
            shortLandscapeShopMaxH: 500,
            shortLandscapeGameMaxH: 560,
            veryShortLandscapeGameMaxH: 470,
            midLandscapeMinW: 900,
            midLandscapeMaxW: 1200,
            wideLandscapeMinW: 1400
        }
    },
    'mobile-landscape': {
        baseResolution: { width: 844, height: 390 },
        scaleClamp: { min: 0.74, max: 0.96 },
        layout: {
            sidePaddingPortrait: 10,
            sidePaddingLandscape: 14,
            hudRightReservePortrait: 66,
            hudRightReserveLandscapeRatio: 0.09,
            hudRightReserveLandscapeMin: 86,
            hudRightReserveLandscapeMax: 118,
            hudDockTopShop: 160
        },
        sections: {
            lobby: 0.86,
            shop: 0.82,
            shopCards: 0.82,
            shopResult: 0.84,
            gameBoard: 0.84,
            gameInfo: 0.84,
            gameControls: 0.82,
            shopTitle: 0.86
        },
        thresholds: {
            compactPortraitMaxW: 760,
            compactPortraitMaxH: 960,
            veryCompactPortraitMaxW: 460,
            veryCompactPortraitMaxH: 760,
            midPortraitMinW: 520,
            midPortraitMaxW: 860,
            shortLandscapeShopMaxH: 430,
            shortLandscapeGameMaxH: 520,
            veryShortLandscapeGameMaxH: 430,
            midLandscapeMinW: 640,
            midLandscapeMaxW: 940,
            wideLandscapeMinW: 1160
        }
    },
    'tablet-landscape': {
        baseResolution: { width: 1180, height: 820 },
        scaleClamp: { min: 0.82, max: 1.04 },
        layout: {
            sidePaddingPortrait: 12,
            sidePaddingLandscape: 16,
            hudRightReservePortrait: 52,
            hudRightReserveLandscapeRatio: 0.1,
            hudRightReserveLandscapeMin: 92,
            hudRightReserveLandscapeMax: 128,
            hudDockTopShop: 148
        },
        sections: {
            lobby: 0.94,
            shop: 0.92,
            shopCards: 0.92,
            shopResult: 0.93,
            gameBoard: 0.93,
            gameInfo: 0.92,
            gameControls: 0.91,
            shopTitle: 0.92
        },
        thresholds: {
            compactPortraitMaxW: 980,
            compactPortraitMaxH: 1180,
            veryCompactPortraitMaxW: 620,
            veryCompactPortraitMaxH: 900,
            midPortraitMinW: 760,
            midPortraitMaxW: 1120,
            shortLandscapeShopMaxH: 500,
            shortLandscapeGameMaxH: 560,
            veryShortLandscapeGameMaxH: 470,
            midLandscapeMinW: 900,
            midLandscapeMaxW: 1280,
            wideLandscapeMinW: 1400
        }
    },
    'desktop-landscape': {
        baseResolution: { width: 1440, height: 900 },
        scaleClamp: { min: 0.9, max: 1.12 },
        layout: {
            sidePaddingPortrait: 12,
            sidePaddingLandscape: 18,
            hudRightReservePortrait: 42,
            hudRightReserveLandscapeRatio: 0.1,
            hudRightReserveLandscapeMin: 96,
            hudRightReserveLandscapeMax: 140,
            hudDockTopShop: 132
        },
        sections: {
            lobby: 1,
            shop: 1,
            shopCards: 1,
            shopResult: 1,
            gameBoard: 1,
            gameInfo: 1,
            gameControls: 1,
            shopTitle: 1
        },
        thresholds: {
            compactPortraitMaxW: 980,
            compactPortraitMaxH: 1180,
            veryCompactPortraitMaxW: 620,
            veryCompactPortraitMaxH: 900,
            midPortraitMinW: 760,
            midPortraitMaxW: 1120,
            shortLandscapeShopMaxH: 560,
            shortLandscapeGameMaxH: 560,
            veryShortLandscapeGameMaxH: 470,
            midLandscapeMinW: 900,
            midLandscapeMaxW: 1320,
            wideLandscapeMinW: 1280
        }
    }
};

// Ajustes por rango para evitar repetir la misma configuracion por resolucion exacta.
// Puedes definir reglas por orientacion + min/max de width/height.
// Scopes disponibles en overrides: shared, lobby, shop, gamePortrait, gameLandscape, hud, fallbackJackpot.
const VIEWPORT_RANGE_OVERRIDES = [
    {
        id: 'landscape-over-1200-force-narrow-game-layout',
        match: {
            orientation: 'landscape',
            minWidth: 1200
        },
        overrides: {
            gameLandscape: {
                forceNarrowLayout: true,
                panelGlobalYOffset: 0
            }
        }
    },
    {
        id: 'landscape-over-1300-force-narrow-game-layout',
        match: {
            orientation: 'landscape',
            minWidth: 1320
        },
        overrides: {
            gameLandscape: {
                forceNarrowLayout: true,
                panelGlobalYOffset: 50
            }
        }
    },
    {
        id: 'mobile-under-905-buttons',
        match: {
            maxWidth: 905
        },
        overrides: {
            lobby: {
                landscapeStackButtonsGap: 150,
                landscapeButtonsGap: 24,
                landscapeStackScaleThreshold: 1,
                portraitButtonsGap: 150
            }
        }
    },
    {
        id: 'small-portrait-bigger-board',
        match: {
            orientation: 'portrait',
            minWidth: 320,
            maxWidth: 430,
            minHeight: 600,
            maxHeight: 760
        },
        overrides: {
            shared: {
                gameBoardScaleMin: 1.0,
                gameBoardScaleMax: 1.06
            },
            gamePortrait: {
                portraitWidthFactorDefault: 1.04,
                portraitWidthFactorMid: 1.02,
                gameTopGap: 8,
                gameBottomGapToWin: 36
            }
        }
    },
    {
        id: 'mobile-portrait-lobby-compact-buttons',
        match: {
            orientation: 'portrait',
            minWidth: 320,
            maxWidth: 430,
            minHeight: 560,
            maxHeight: 760
        },
        overrides: {
            lobby: {
                portraitButtonScaleBaseWidthRatio: 0.82,
                portraitButtonScaleMin: 0.5,
                portraitButtonScaleMax: 0.82,
                portraitButtonsStartGap: 180,
                portraitButtonsGap: 96
            }
        }
    },
    {
        id: 'ipad-mini-portrait-bet-controls-up',
        match: {
            orientation: 'portrait',
            minWidth: 740,
            maxWidth: 790,
            minHeight: 980,
            maxHeight: 1060
        },
        overrides: {
            shared: {
                gameBoardScaleMin: 1.0,
                gameBoardScaleMax: 1.08
            },
            gamePortrait: {
                controlsGlobalYOffset: -80,
                contWinGlobalYOffset: 10,
                portraitWidthFactorMid: 1.08,
                gameBottomGapToWin: 36
            },
            hud: {
                dockBoardOffset: -150
            }
        }
    },
    {
        id: 'ipad-pro-portrait-lobby-button-spacing',
        match: {
            orientation: 'portrait',
            minWidth: 980,
            maxWidth: 1080,
            minHeight: 1260,
            maxHeight: 1400
        },
        overrides: {
            lobby: {
                portraitButtonsGap: 150
            }
        }
    },
    {
        id: 'surface-pro-portrait-lobby-button-spacing',
        match: {
            orientation: 'portrait',
            minWidth: 880,
            maxWidth: 979,
            minHeight: 1260,
            maxHeight: 1420
        },
        overrides: {
            lobby: {
                portraitButtonsGap: 150
            }
        }
    },
    {
        id: 'mobile-portrait-lobby-tight',
        match: {
            orientation: 'portrait',
            minWidth: 340,
            maxWidth: 540,
            minHeight: 660,
            maxHeight: 940
        },
        overrides: {
            lobby: {
                titleGapFromJackpot: 100
            },
            // Ejemplos:
            // shop: { portraitButtonsGap: 120 },
            // gamePortrait: { controlsYRatioDefault: 0.82 },
            // hud: { dockLobbyOffset: -120 }
            shared: {
                // Ajustes globales de escala por rango.
                // lobbyScaleMax: 1.08
            }
        }
    }
];

// Ajustes finos por resolucion exacta (solo excepciones puntuales).
// Tienen prioridad por encima del rango.
const VIEWPORT_RESOLUTION_OVERRIDES = {
    // '430x932': { lobby: { titleGapFromJackpot: 92 } }
};

export {
  CONFIG_GAME,
  CELL_W,
  CELL_H,
  BET_VALUES,
  JACKPOT_SIZE_BOOST,
  HISTORY_STORAGE_KEY,
  VIEWPORT_SCALE_MODEL,
  VIEWPORT_RANGE_OVERRIDES,
  VIEWPORT_RESOLUTION_OVERRIDES
};
