import React, { useEffect, useRef } from 'react';
import { MainScene } from './MainScene';
import { BootScene, LoadingScene } from './LoadingScene';

export default function PhaserGame() {
  const gameRef = useRef(null);

  useEffect(() => {
    /**
     * Obtiene una resolucion de render segura para dispositivos high-DPI.
     * No requiere parametros.
     */
    const getRenderResolution = () => {
      const dpr = Number(window.devicePixelRatio) || 1;
      // Limitar a 2 evita sobrecarga fuerte en moviles antiguos.
      return Math.min(2, Math.max(1, dpr));
    };

    /**
     * Obtiene el tamaño real del viewport priorizando `visualViewport`.
     * No requiere parámetros.
     */
    const getViewportSize = () => {
      const vv = window.visualViewport;
      if (vv && Number.isFinite(vv.width) && Number.isFinite(vv.height)) {
        return {
          w: Math.max(1, Math.round(vv.width)),
          h: Math.max(1, Math.round(vv.height))
        };
      }
      return {
        w: Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1),
        h: Math.max(1, window.innerHeight || document.documentElement.clientHeight || 1)
      };
    };

    /**
     * Fuerza un resize de Phaser al tamaño actual del viewport.
     * No requiere parámetros.
     */
    const forceResize = () => {
      const game = gameRef.current;
      if (!game) return;

      const { w, h } = getViewportSize();
      game.scale.resize(w, h);
      game.scale.refresh();
    };

    /**
     * Reaplica resize con delay para estabilizar orientación en móviles.
     * No requiere parámetros.
     */
    const handleOrientationChange = () => {
      // En móviles/devtools el viewport final se estabiliza unos ms después de rotar.
      setTimeout(forceResize, 60);
      setTimeout(forceResize, 180);
    };

    /**
     * Reaplica resize al entrar/salir de fullscreen en móviles.
     * No requiere parámetros.
     */
    const handleFullscreenChange = () => {
      setTimeout(forceResize, 40);
      setTimeout(forceResize, 140);
    };

    // Asegurarse de que la fuente esté lista antes de iniciar Phaser
    if (window.WebFont) {
        window.WebFont.load({
            google: { families: ['Luckiest Guy'] },
            active: function() {
                if (!gameRef.current) {
                    const config = {
                        type: window.Phaser.AUTO,
                        resolution: getRenderResolution(),
                        autoRound: false,
                        antialias: true,
                        pixelArt: false,
                        roundPixels: false,
                        render: {
                          antialias: true,
                          pixelArt: false,
                          roundPixels: false,
                          powerPreference: 'high-performance'
                        },
                        scale: { mode: window.Phaser.Scale.RESIZE, parent: 'phaser-container', width: '100%', height: '100%' },
                        backgroundColor: '#000000',
                        scene: [BootScene, LoadingScene, MainScene]
                    };
                    gameRef.current = new window.Phaser.Game(config);
                    forceResize();
                }
            }
        });
    }

    const vv = window.visualViewport;
    window.addEventListener('resize', forceResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    if (vv) {
      vv.addEventListener('resize', forceResize);
      vv.addEventListener('scroll', forceResize);
    }

    return () => {
      window.removeEventListener('resize', forceResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      if (vv) {
        vv.removeEventListener('resize', forceResize);
        vv.removeEventListener('scroll', forceResize);
      }
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      id="phaser-container"
      style={{
        width: '100vw',
        height: '100dvh',
        minHeight: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1
      }}
    />
  );
}
