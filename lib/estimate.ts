import { zebraWidths, zebraHeights, zebraPrices, zebraUpgrades, zebraLargeRound } from './zebra-estimate-prices';
import { widths, heights, prices, upgrades } from './estimate-prices';
export type Operation = keyof typeof upgrades;
export type Shade = { id: number; product?: 'cellular' | 'zebra'; room: string; width: string; height: string; quantity: string; light: 'light' | 'dark'; operation: Operation };
export function estimateShade(shade: Shade): { cents: number; error?: never } | { error: string; cents?: never } {
  const w = Number(shade.width), h = Number(shade.height), q = Number(shade.quantity);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return { error: 'Enter your window width and height in inches.' };
  if (!Number.isInteger(q) || q < 1 || q > 50) return { error: 'Enter a quantity from 1 to 50.' };
  if (!(shade.operation in upgrades) || !(shade.light in prices)) return { error: 'Choose your shade options.' };
  if (shade.product && shade.product !== 'cellular' && shade.product !== 'zebra') return { error: 'Choose a shade type.' };
  if (shade.product === 'zebra') {
    if (shade.operation !== 'cordless' && shade.operation !== 'motor') return { error: 'Zebra shades are available with cordless or motorized operation.' };
    const minW = shade.operation === 'motor' ? 18 : 17.75;
    if (w < minW || w > 96 || h < 12 || h > 96) return { error: `Online Zebra estimates cover widths ${minW}–96 inches and heights 12–96 inches. We can help quote other sizes.` };
    if (shade.operation === 'cordless' && w < 23.625 && h > 70) return { error: 'Cordless Zebra shades under 23⅝ inches wide have a maximum height of 70 inches. Choose motorized or ask us about your window.' };
    const col = zebraWidths.findIndex(x => x >= w);
    const row = zebraHeights.findIndex(x => x >= h);
    const cassette = w > 78 || h > 78 ? zebraLargeRound[col] : 0;
    return { cents: (zebraPrices[shade.light][row][col] + zebraUpgrades[shade.operation] + cassette) * q };
  }
  const motor = shade.operation.startsWith('motor');
  const top = shade.operation.includes('tdbu');
  const minW = motor ? (top ? 32 : 18) : (top ? 19 : 12);
  const minH = motor ? 12 : 10;
  const maxH = top && !motor ? 84 : 96;
  if (w < minW || h < minH || w > 96 || h > maxH) return { error: `For this option, online estimates cover widths ${minW}–96 inches and heights ${minH}–${maxH} inches. We can help quote other sizes.` };
  const base = prices[shade.light][heights.findIndex(x => x >= h)][widths.findIndex(x => x >= w)];
  return { cents: (base + upgrades[shade.operation]) * q };
}
export const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100);
