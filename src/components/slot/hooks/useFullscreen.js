import { useCallback, useEffect, useState } from 'react';

/**
 * Hook para controlar estado y toggle de pantalla completa del documento.
 * No requiere parámetros.
 */
export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  /**
   * Obtiene el elemento actualmente en fullscreen considerando prefijos.
   * No requiere parámetros.
   */
  const getFullscreenElement = useCallback(
    () => document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement || null,
    []
  );

  const toggleFullscreen = useCallback(() => {
    if (!getFullscreenElement()) {
      const root = document.documentElement;
      const requestFullscreen =
        root.requestFullscreen || root.webkitRequestFullscreen || root.msRequestFullscreen;
      if (!requestFullscreen) return;

      Promise.resolve(requestFullscreen.call(root)).catch((err) => console.warn(err));
      return;
    }

    const exitFullscreen =
      document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
    if (exitFullscreen) {
      exitFullscreen.call(document);
    }
  }, [getFullscreenElement]);

  useEffect(() => {
    /**
     * Sincroniza estado local con el estado real de fullscreen del documento.
     * No requiere parámetros.
     */
    const handleFullscreenChange = () => setIsFullscreen(Boolean(getFullscreenElement()));
    handleFullscreenChange();
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [getFullscreenElement]);

  return { isFullscreen, toggleFullscreen };
}
