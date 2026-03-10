/**
 * Formatea un valor numérico con separador de miles para mostrar montos.
 * Parámetros:
 * - `value` (number|string): Valor a convertir y formatear.
 */
export function formatPoints(value) {
  return Math.round(Number(value) || 0)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Convierte un timestamp a texto de fecha/hora en formato `es-CL`.
 * Parámetros:
 * - `timestamp` (number|string): Marca de tiempo en milisegundos.
 */
export function formatHistoryDate(timestamp) {
  const date = new Date(Number(timestamp) || Date.now());
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
}
