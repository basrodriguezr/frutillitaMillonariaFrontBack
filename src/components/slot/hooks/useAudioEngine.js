import { useEffect, useRef } from 'react';

/**
 * Hook de audio global para UI y Phaser.
 * Genera música de fondo y efectos simples (botón/premio) usando Web Audio API.
 * Parámetros:
 * - `config` (object): Estado de mute y volúmenes de música/efectos.
 */
export function useAudioEngine({ isMuted, musicVolume, sfxVolume }) {
  const audioContextRef = useRef(null);
  const musicTimerRef = useRef(null);
  const musicStepRef = useRef(0);
  const mutedRef = useRef(isMuted);
  const musicVolumeRef = useRef(musicVolume);
  const sfxVolumeRef = useRef(sfxVolume);

  useEffect(() => {
    mutedRef.current = isMuted;
    musicVolumeRef.current = musicVolume;
    sfxVolumeRef.current = sfxVolume;
  }, [isMuted, musicVolume, sfxVolume]);

  useEffect(() => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return undefined;

    /**
     * Limita un valor numérico al rango `[0, 1]`.
     * Parámetros:
     * - `value` (number): Valor a normalizar.
     */
    const clamp01 = (value) => Math.max(0, Math.min(1, Number(value) || 0));

    /**
     * Obtiene o inicializa `AudioContext` y lo reanuda si está suspendido.
     * No requiere parámetros.
     */
    const ensureContext = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(() => {});
      }
      return audioContextRef.current;
    };

    /**
     * Reproduce un tono simple con envolvente de entrada/salida.
     * Parámetros:
     * - `frequency` (number): Frecuencia base del oscilador en Hz.
     * - `duration` (number): Duración del sonido en segundos.
     * - `gain` (number): Ganancia objetivo normalizada.
     * - `type` (string, opcional): Tipo de onda del oscilador.
     * - `when` (number, opcional): Delay de inicio relativo en segundos.
     */
    const playTone = ({ frequency, duration, gain, type = 'sine', when = 0 }) => {
      if (mutedRef.current) return;
      const ctx = ensureContext();
      if (!ctx) return;

      const startAt = ctx.currentTime + when;
      const osc = ctx.createOscillator();
      const amp = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, startAt);

      const finalGain = clamp01(gain);
      amp.gain.setValueAtTime(0.0001, startAt);
      amp.gain.exponentialRampToValueAtTime(Math.max(0.0001, finalGain), startAt + 0.01);
      amp.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

      osc.connect(amp);
      amp.connect(ctx.destination);
      osc.start(startAt);
      osc.stop(startAt + duration + 0.03);
    };

    /**
     * Reproduce un barrido de frecuencia (sweep) con envolvente.
     * Parámetros:
     * - `from` (number): Frecuencia inicial del barrido en Hz.
     * - `to` (number): Frecuencia final del barrido en Hz.
     * - `duration` (number): Duración total del sweep en segundos.
     * - `gain` (number): Ganancia objetivo normalizada.
     * - `type` (string, opcional): Tipo de onda del oscilador.
     * - `when` (number, opcional): Delay de inicio relativo en segundos.
     */
    const playSweep = ({ from, to, duration, gain, type = 'sine', when = 0 }) => {
      if (mutedRef.current) return;
      const ctx = ensureContext();
      if (!ctx) return;

      const startAt = ctx.currentTime + when;
      const osc = ctx.createOscillator();
      const amp = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(from, startAt);
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), startAt + duration);

      const finalGain = clamp01(gain);
      amp.gain.setValueAtTime(0.0001, startAt);
      amp.gain.exponentialRampToValueAtTime(Math.max(0.0001, finalGain), startAt + 0.008);
      amp.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

      osc.connect(amp);
      amp.connect(ctx.destination);
      osc.start(startAt);
      osc.stop(startAt + duration + 0.03);
    };

    /**
     * Reproduce el efecto de botón para interacciones de UI.
     * No requiere parámetros.
     */
    const playButtonSfx = () => {
      const sfx = clamp01((sfxVolumeRef.current || 0) / 100);
      if (sfx <= 0) return;
      playTone({ frequency: 760, duration: 0.07, gain: 0.08 * sfx, type: 'triangle' });
    };

    /**
     * Reproduce el efecto de victoria base usado en juego individual.
     * No requiere parámetros.
     */
    const playWinSfx = () => {
      const sfx = clamp01((sfxVolumeRef.current || 0) / 100);
      if (sfx <= 0) return;
      playTone({ frequency: 660, duration: 0.12, gain: 0.10 * sfx, type: 'sine' });
      playTone({ frequency: 880, duration: 0.14, gain: 0.11 * sfx, type: 'sine', when: 0.08 });
      playTone({ frequency: 1180, duration: 0.16, gain: 0.09 * sfx, type: 'triangle', when: 0.16 });
    };

    /**
     * Reproduce el efecto de ticket sin premio en apertura de packs.
     * No requiere parámetros.
     */
    const playPackLoseSfx = () => {
      const sfx = clamp01((sfxVolumeRef.current || 0) / 100);
      if (sfx <= 0) return;
      // Tono corto y grave para ticket sin premio.
      playTone({ frequency: 130, duration: 0.18, gain: 0.08 * sfx, type: 'sawtooth' });
      playTone({ frequency: 98, duration: 0.22, gain: 0.06 * sfx, type: 'triangle', when: 0.03 });
    };

    /**
     * Reproduce el efecto de ticket con premio en apertura de packs.
     * No requiere parámetros.
     */
    const playPackWinSfx = () => {
      const sfx = clamp01((sfxVolumeRef.current || 0) / 100);
      if (sfx <= 0) return;
      // Motivo brillante y ascendente para ticket con premio.
      playTone({ frequency: 523.25, duration: 0.10, gain: 0.09 * sfx, type: 'triangle' });
      playTone({ frequency: 659.25, duration: 0.12, gain: 0.10 * sfx, type: 'sine', when: 0.06 });
      playTone({ frequency: 783.99, duration: 0.14, gain: 0.11 * sfx, type: 'sine', when: 0.12 });
      playTone({ frequency: 987.77, duration: 0.16, gain: 0.09 * sfx, type: 'triangle', when: 0.18 });
    };

    /**
     * Reproduce efecto de match en juego individual.
     * No requiere parámetros.
     */
    const playMatchSfx = () => {
      const sfx = clamp01((sfxVolumeRef.current || 0) / 100);
      if (sfx <= 0) return;
      // Golpe tipo explosión suave para clusters ganadores.
      playSweep({ from: 240, to: 72, duration: 0.22, gain: 0.10 * sfx, type: 'sawtooth' });
      playTone({ frequency: 58, duration: 0.24, gain: 0.07 * sfx, type: 'triangle', when: 0.01 });
      playTone({ frequency: 980, duration: 0.05, gain: 0.03 * sfx, type: 'square', when: 0.015 });
    };

    /**
     * Reproduce efecto de derrota para tirada sin premio en juego individual.
     * No requiere parámetros.
     */
    const playLoseSfx = () => {
      const sfx = clamp01((sfxVolumeRef.current || 0) / 100);
      if (sfx <= 0) return;
      // Sello corto descendente para distinguir derrota.
      playTone({ frequency: 392, duration: 0.12, gain: 0.08 * sfx, type: 'triangle' });
      playTone({ frequency: 293.66, duration: 0.16, gain: 0.09 * sfx, type: 'sine', when: 0.09 });
      playSweep({ from: 220, to: 110, duration: 0.20, gain: 0.06 * sfx, type: 'square', when: 0.10 });
    };

    /**
     * Reproduce efecto final de monedas al mostrar "GANASTE".
     * No requiere parámetros.
     */
    const playCoinsSfx = () => {
      const sfx = clamp01((sfxVolumeRef.current || 0) / 100);
      if (sfx <= 0) return;
      // Cascada corta de "monedas" para el GANASTE final.
      playTone({ frequency: 1318.51, duration: 0.07, gain: 0.09 * sfx, type: 'triangle' });
      playTone({ frequency: 1567.98, duration: 0.07, gain: 0.09 * sfx, type: 'sine', when: 0.05 });
      playTone({ frequency: 1975.53, duration: 0.08, gain: 0.08 * sfx, type: 'triangle', when: 0.11 });
      playTone({ frequency: 1760.0, duration: 0.07, gain: 0.07 * sfx, type: 'square', when: 0.16 });
    };

    /**
     * Detiene el loop de música de fondo si está activo.
     * No requiere parámetros.
     */
    const stopMusicLoop = () => {
      if (musicTimerRef.current) {
        clearInterval(musicTimerRef.current);
        musicTimerRef.current = null;
      }
    };

    /**
     * Inicia el loop de música de fondo (si no está corriendo).
     * No requiere parámetros.
     */
    const startMusicLoop = () => {
      if (musicTimerRef.current) return;

      /**
       * Ejecuta un paso melódico del loop continuo.
       * No requiere parámetros.
       */
      const runStep = () => {
        if (mutedRef.current) return;
        const music = clamp01((musicVolumeRef.current || 0) / 100);
        if (music <= 0) return;

        // Progresión corta y suave para loop continuo de fondo.
        const melody = [261.63, 293.66, 329.63, 392.0, 329.63, 293.66];
        const step = musicStepRef.current % melody.length;
        const lead = melody[step];
        const harmony = lead * 0.5;
        musicStepRef.current += 1;

        playTone({ frequency: lead, duration: 0.58, gain: 0.04 * music, type: 'triangle' });
        playTone({ frequency: harmony, duration: 0.52, gain: 0.024 * music, type: 'sine', when: 0.02 });
      };

      runStep();
      musicTimerRef.current = setInterval(runStep, 620);
    };

    /**
     * Activa contexto de audio e intenta iniciar música de fondo.
     * No requiere parámetros.
     */
    const bootstrapAudio = () => {
      ensureContext();
      startMusicLoop();
    };

    /**
     * Escucha clicks de documento para reforzar SFX en botones HTML.
     * Parámetros:
     * - `event` (MouseEvent): Evento click capturado en fase de captura.
     */
    const onDocumentClick = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest('button')) {
        playButtonSfx();
      }
    };

    window.playButtonSfx = playButtonSfx;
    window.playWinSfx = playWinSfx;
    window.playPackLoseSfx = playPackLoseSfx;
    window.playPackWinSfx = playPackWinSfx;
    window.playMatchSfx = playMatchSfx;
    window.playLoseSfx = playLoseSfx;
    window.playCoinsSfx = playCoinsSfx;

    window.addEventListener('pointerdown', bootstrapAudio, { passive: true });
    window.addEventListener('keydown', bootstrapAudio);
    document.addEventListener('click', onDocumentClick, true);

    // Si el usuario quita mute, asegurar loop activo.
    if (!mutedRef.current) {
      bootstrapAudio();
    }

    return () => {
      stopMusicLoop();
      window.removeEventListener('pointerdown', bootstrapAudio);
      window.removeEventListener('keydown', bootstrapAudio);
      document.removeEventListener('click', onDocumentClick, true);
      if (window.playButtonSfx === playButtonSfx) delete window.playButtonSfx;
      if (window.playWinSfx === playWinSfx) delete window.playWinSfx;
      if (window.playPackLoseSfx === playPackLoseSfx) delete window.playPackLoseSfx;
      if (window.playPackWinSfx === playPackWinSfx) delete window.playPackWinSfx;
      if (window.playMatchSfx === playMatchSfx) delete window.playMatchSfx;
      if (window.playLoseSfx === playLoseSfx) delete window.playLoseSfx;
      if (window.playCoinsSfx === playCoinsSfx) delete window.playCoinsSfx;
    };
  }, []);
}
