import React, { useEffect, useRef } from 'react';
import { MainScene } from './MainScene';
import { BootScene, LoadingScene } from './LoadingScene';

export default function PhaserGame() {
  const gameRef = useRef(null);

  useEffect(() => {
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

    const forceResize = () => {
      const game = gameRef.current;
      if (!game) return;

      const { w, h } = getViewportSize();
      game.scale.resize(w, h);
      game.scale.refresh();
    };

    const handleOrientationChange = () => {
      // En móviles/devtools el viewport final se estabiliza unos ms después de rotar.
      setTimeout(forceResize, 60);
      setTimeout(forceResize, 180);
    };

    // Asegurarse de que la fuente esté lista antes de iniciar Phaser
    if (window.WebFont) {
        window.WebFont.load({
            google: { families: ['Luckiest Guy'] },
            active: function() {
                if (!gameRef.current) {
                    const config = {
                        type: window.Phaser.AUTO,
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
    if (vv) {
      vv.addEventListener('resize', forceResize);
      vv.addEventListener('scroll', forceResize);
    }

    return () => {
      window.removeEventListener('resize', forceResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
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
