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
  const isActivatedRef = useRef(false);
  const canPlayMusicRef = useRef(window.__audioPhase === 'main');
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
      if (!isActivatedRef.current) return;
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
      if (!isActivatedRef.current) return;
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
     * Reproduce efecto de llenado cuando las frutas entran al tablero.
     * No requiere parámetros.
     */
    const playFillSfx = () => {
      const sfx = clamp01((sfxVolumeRef.current || 0) / 100);
      if (sfx <= 0) return;
      // Efecto más contundente: ataque brillante + cuerpo grave + caída marcada.
      playSweep({ from: 1200, to: 180, duration: 0.34, gain: 0.13 * sfx, type: 'sawtooth' });
      playSweep({ from: 520, to: 90, duration: 0.26, gain: 0.11 * sfx, type: 'triangle', when: 0.02 });
      playTone({ frequency: 92, duration: 0.24, gain: 0.10 * sfx, type: 'sine', when: 0.015 });
      playTone({ frequency: 1480, duration: 0.06, gain: 0.06 * sfx, type: 'square', when: 0.0 });
    };

    /**
     * Reproduce un efecto de llenado para la pantalla de carga inicial.
     * Parámetros:
     * - `progress` (number, opcional): Progreso normalizado entre `0` y `1`.
     */
    const playLoadingFillSfx = (progress = 0) => {
      const sfx = clamp01((sfxVolumeRef.current || 0) / 100);
      if (sfx <= 0) return;
      const p = clamp01(progress);
      const base = 180 + (260 * p);
      // "Burbujeo" ascendente corto para acompañar la barra de carga.
      playSweep({ from: base * 0.9, to: base * 1.9, duration: 0.11, gain: 0.09 * sfx, type: 'triangle' });
      playTone({ frequency: base * 0.75, duration: 0.12, gain: 0.06 * sfx, type: 'sine', when: 0.01 });
      playTone({ frequency: base * 2.1, duration: 0.05, gain: 0.04 * sfx, type: 'square', when: 0.045 });
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
     * Sincroniza el loop de música según activación, fase de juego y estado de mute.
     * No requiere parámetros.
     */
    const syncMusicLoop = () => {
      // Mantener el loop vivo en fase principal permite recuperar sonido al desmutear
      // sin requerir reinicializaciones adicionales del timer.
      const shouldPlayMusic = isActivatedRef.current && canPlayMusicRef.current;
      if (shouldPlayMusic) {
        startMusicLoop();
      } else {
        stopMusicLoop();
      }
    };

    /**
     * Activa contexto de audio e intenta iniciar música de fondo.
     * No requiere parámetros.
     */
    const bootstrapAudio = () => {
      isActivatedRef.current = true;
      ensureContext();
      syncMusicLoop();
    };

    /**
     * Actualiza la fase de audio global (`loading` o `main`) y reevalúa música.
     * Parámetros:
     * - `event` (CustomEvent): Evento con `detail.phase` para habilitar o pausar BGM.
     */
    const onAudioPhaseChanged = (event) => {
      const phase = event?.detail?.phase;
      canPlayMusicRef.current = phase === 'main';
      syncMusicLoop();
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
    window.playFillSfx = playFillSfx;
    window.playLoadingFillSfx = playLoadingFillSfx;
    window.bootstrapAudioEngine = bootstrapAudio;

    document.addEventListener('click', onDocumentClick, true);
    window.addEventListener('audio-phase-changed', onAudioPhaseChanged);

    return () => {
      stopMusicLoop();
      document.removeEventListener('click', onDocumentClick, true);
      window.removeEventListener('audio-phase-changed', onAudioPhaseChanged);
      if (window.playButtonSfx === playButtonSfx) delete window.playButtonSfx;
      if (window.playWinSfx === playWinSfx) delete window.playWinSfx;
      if (window.playPackLoseSfx === playPackLoseSfx) delete window.playPackLoseSfx;
      if (window.playPackWinSfx === playPackWinSfx) delete window.playPackWinSfx;
      if (window.playMatchSfx === playMatchSfx) delete window.playMatchSfx;
      if (window.playLoseSfx === playLoseSfx) delete window.playLoseSfx;
      if (window.playCoinsSfx === playCoinsSfx) delete window.playCoinsSfx;
      if (window.playFillSfx === playFillSfx) delete window.playFillSfx;
      if (window.playLoadingFillSfx === playLoadingFillSfx) delete window.playLoadingFillSfx;
      if (window.bootstrapAudioEngine === bootstrapAudio) delete window.bootstrapAudioEngine;
    };
  }, []);
}
