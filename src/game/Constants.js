export const CONFIG_GAME = { reelTotalWidth: 700, reelTotalHeight: 600, reels: 5, rows: 5 };
export const CELL_W = CONFIG_GAME.reelTotalWidth / CONFIG_GAME.reels; 
export const CELL_H = CONFIG_GAME.reelTotalHeight / CONFIG_GAME.rows;
export const BET_VALUES = [100, 200, 300, 400, 500, 1000, 2000, 5000, 10000];

export const PAYTABLE = {
    0: { 3:0.2, 4:0.4, 5:1.0, 6:2, 7:4, 8:10, 9:20 }, 
    3: { 3:0.2, 4:0.4, 5:1.0, 6:2, 7:4, 8:10, 9:20 }, 
    4: { 3:0.2, 4:0.4, 5:1.0, 6:2, 7:4, 8:10, 9:20 }, 
    6: { 3:0.2, 4:0.4, 5:1.0, 6:2, 7:4, 8:10, 9:20 }, 
    1: { 3:0.4, 4:0.8, 5:2, 6:4, 7:8, 8:20, 9:40 },     
    2: { 3:1,   4:2,   5:4, 6:8, 7:20, 8:40, 9:80 },  
    5: { 3:2,   4:4,   5:8, 6:20, 7:40, 8:80, 9:200 } 
};