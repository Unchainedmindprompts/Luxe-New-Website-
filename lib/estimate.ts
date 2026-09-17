import { fauxWidths, fauxHeights, fauxPrices } from './faux-estimate-prices';
import { rollerWidths, rollerHeights, rollerPrices, rollerUpgrades, rollerSmallRound, rollerLargeRound } from './roller-estimate-prices';
import { romanWidths, romanHeights, romanPrices, romanUpgrades } from './roman-estimate-prices';
import { zebraWidths, zebraHeights, zebraPrices, zebraUpgrades, zebraLargeRound } from './zebra-estimate-prices';
import { widths, heights, prices, upgrades } from './estimate-prices';
export type Operation = keyof typeof upgrades;
export type Product = 'cellular' | 'zebra' | 'roman' | 'roller' | 'faux';
export type Shade = { id: number; product?: Product; romanStyle?: 'flat' | 'classic'; room: string; width: string; height: string; quantity: string; light: 'light' | 'dark'; operation: Operation };
export function estimateShade(shade: Shade): { cents: number; error?: never } | { error: string; cents?: never } {
  const w = Number(shade.width), h = Number(shade.height), q = Number(shade.quantity);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return { error: 'Enter your window width and height in inches.' };
  if (!Number.isInteger(q) || q < 1 || q > 50) return { error: 'Enter a quantity from 1 to 50.' };
  if (!(shade.operation in upgrades) || !(shade.light in prices)) return { error: 'Choose your shade options.' };
  if (shade.product && shade.product !== 'cellular' && shade.product !== 'zebra' && shade.product !== 'roman' && shade.product !== 'roller' && shade.product !== 'faux') return { error: 'Choose a shade type.' };
  if (shade.product === 'faux') {
    if (shade.operation !== 'cordless' || shade.light !== 'light') return { error: 'This estimate covers standard white faux wood blinds with cordless lift and wand tilt.' };
    if (w > 78) return { error: 'For windows wider than 78 inches, we recommend multiple blinds. We will help plan the right configuration during your consultation.' };
    if (w < 8 || h < 12 || h > 120) return { error: 'Online faux wood estimates cover widths 8–78 inches and heights 12–120 inches. We can help quote other sizes.' };
    return { cents: fauxPrices[fauxHeights.findIndex(x => x >= h)][fauxWidths.findIndex(x => x >= w)] * q };
  }
  if (shade.product === 'roller') {
    if (shade.operation !== 'cordless' && shade.operation !== 'motor') return { error: 'Roller shades are available with cordless or motorized operation.' };
    const minW = shade.operation === 'motor' ? 16.5 : 17.75;
    if (w < minW || w > 96 || h < 12 || h > 96) return { error: `Online roller estimates cover widths ${minW}–96 inches and heights 12–96 inches. We can help quote other sizes.` };
    if (shade.operation === 'cordless' && w < 23.625 && h > 70) return { error: 'Cordless roller shades under 23⅝ inches wide have a maximum height of 70 inches. Choose motorized or ask us about your window.' };
    const col = rollerWidths.findIndex(x => x >= w);
    const row = rollerHeights.findIndex(x => x >= h);
    const cassette = (w > 78 || h > 78 ? rollerLargeRound : rollerSmallRound)[col];
    return { cents: (rollerPrices[shade.light][row][col] + rollerUpgrades[shade.operation] + cassette) * q };
  }
  if (shade.product === 'roman') {
    if (shade.romanStyle && shade.romanStyle !== 'flat' && shade.romanStyle !== 'classic') return { error: 'Choose Flat or Classic Roman shades.' };
    if (shade.operation === 'motor-tdbu') return { error: 'Roman top-down / bottom-up shades use cordless operation.' };
    const minW = shade.operation === 'motor' ? 22 : shade.operation === 'tdbu' ? 18 : 10;
    const maxW = shade.operation === 'tdbu' ? 66 : 96;
    if (w < minW || w > maxW || h < 24 || h > 96) return { error: `Online Roman estimates for this option cover widths ${minW}–${maxW} inches and heights 24–96 inches. We can help quote other sizes.` };
    if (shade.operation === 'motor' && w * h / 144 > 49.5) return { error: 'This window exceeds the rechargeable Roman motor size limit. Ask us about another option.' };
    const base = romanPrices[shade.light][romanHeights.findIndex(x => x >= h)][romanWidths.findIndex(x => x >= w)];
    return { cents: (base + romanUpgrades[shade.operation]) * q };
  }
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
