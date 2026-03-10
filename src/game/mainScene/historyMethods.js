import Phaser from 'phaser';
import { HISTORY_STORAGE_KEY } from './constants';

/**
 * Genera un identificador único para una jugada o ticket.
 * No requiere parámetros.
 */
export function generateTicketId() {
        return String(Phaser.Math.Between(1, 9999999)).padStart(7, '0');
    }

/**
 * Registra una jugada en historial y dispara su persistencia/exposición externa.
 * Parámetros:
 * - `ticketId` (string): Identificador único del ticket.
 * - `bet` (number): Monto apostado para generar/ejecutar la tirada.
 * - `win` (number): Monto ganado en la jugada.
 * - `mode` (string, opcional): Modo de juego asociado a la jugada.
 */
export function addHistoryEntry({ ticketId, bet, win, mode = 'single' }) {
        const safeBet = Number.isFinite(Number(bet)) ? Number(bet) : 0;
        const safeWin = Number.isFinite(Number(win)) ? Number(win) : 0;
        const timestamp = Date.now();
        const entry = {
            id: String(ticketId || this.generateTicketId()),
            timestamp,
            date: new Date(timestamp).toISOString(),
            bet: safeBet,
            win: safeWin,
            mode
        };

        if (window.addHistoryEntry && typeof window.addHistoryEntry === 'function') {
            window.addHistoryEntry(entry);
            return;
        }

        // Fallback: persist directly if React UI bridge is not ready yet.
        try {
            const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
            const list = raw ? JSON.parse(raw) : [];
            const safeList = Array.isArray(list) ? list : [];
            const merged = [entry, ...safeList]
                .map((item) => ({
                    ...item,
                    timestamp: Number(item?.timestamp) || timestamp
                }))
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 500);
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(merged));
        } catch (error) {
            console.warn('No se pudo guardar historial:', error);
        }
    }
