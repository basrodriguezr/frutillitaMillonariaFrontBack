import { HISTORY_MAX_ITEMS, HISTORY_STORAGE_KEY } from '../constants';

/**
 * Intenta parsear una fecha legacy (`dd/mm/yyyy hh:mm`) a timestamp.
 * Parámetros:
 * - `value` (string): Fecha en formato histórico o string parseable por `Date`.
 */
function parseLegacyDate(value) {
  if (!value || typeof value !== 'string') return 0;

  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);
  if (match) {
    const [, day, month, year, hour, minute] = match;
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute)
    ).getTime();
  }

  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Normaliza una entrada de historial asegurando shape consistente y tipos numéricos.
 * Parámetros:
 * - `item` (object): Registro crudo proveniente de storage o backend.
 */
export function normalizeHistoryEntry(item) {
  const now = Date.now();
  const timestamp = Number(item?.timestamp) || parseLegacyDate(item?.date) || now;

  return {
    id: String(item?.id ?? item?.ticketId ?? Math.floor(1000000 + Math.random() * 9000000)),
    timestamp,
    date: item?.date ?? new Date(timestamp).toISOString(),
    bet: Number(item?.bet) || 0,
    win: Number(item?.win) || 0,
    mode: item?.mode ?? 'single'
  };
}

/**
 * Ordena entradas de historial de más reciente a más antigua.
 * Parámetros:
 * - `items` (Array<object>): Lista de entradas a ordenar.
 */
export function sortHistoryDesc(items) {
  return [...items].sort((a, b) => {
    const tsDiff = (Number(b?.timestamp) || 0) - (Number(a?.timestamp) || 0);
    if (tsDiff !== 0) return tsDiff;
    return String(b?.id ?? '').localeCompare(String(a?.id ?? ''));
  });
}

/**
 * Carga historial desde `localStorage`, normaliza y limita cantidad máxima.
 * No requiere parámetros.
 */
export function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return sortHistoryDesc(parsed.map(normalizeHistoryEntry)).slice(0, HISTORY_MAX_ITEMS);
  } catch {
    return [];
  }
}

/**
 * Persiste el historial completo en `localStorage`.
 * Parámetros:
 * - `entries` (Array<object>): Entradas de historial a guardar.
 */
export function saveHistory(entries) {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Ignore localStorage write errors.
  }
}
