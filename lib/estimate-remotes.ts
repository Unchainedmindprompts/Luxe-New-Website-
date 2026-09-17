import { type Shade } from './estimate';

// Customer prices in cents. Keep categories separate until cross-product
// compatibility is confirmed. Cellular standard and TDBU are not interchangeable.
const systems = {
  cellular: { label: 'Cellular shades', single: 6402, multi: 6402, multiOnly: true },
  'cellular-tdbu': { label: 'Top-down / bottom-up cellular shades', single: 8372, multi: 8372, multiOnly: true },
  zebra: { label: 'Banded shades', single: 3805, multi: 7476, multiOnly: false },
  roman: { label: 'Roman shades', single: 3716, multi: 7297, multiOnly: false },
  roller: { label: 'Roller shades', single: 3805, multi: 7476, multiOnly: false },
} as const;
export type RemoteSystem = keyof typeof systems;
export type AdditionalRemotes = Partial<Record<RemoteSystem, string>>;

export function remoteSystem(shade: Shade): RemoteSystem | undefined {
  if (shade.product === 'faux' || !shade.operation.startsWith('motor')) return;
  const product = shade.product ?? 'cellular';
  return product === 'cellular' && shade.operation === 'motor-tdbu' ? 'cellular-tdbu' : product;
}

export function estimateRemotes(shades: Shade[], additional: AdditionalRemotes = {}) {
  const counts = new Map<RemoteSystem, number>();
  for (const shade of shades) {
    const system = remoteSystem(shade);
    const quantity = Number(shade.quantity);
    if (system && Number.isInteger(quantity) && quantity >= 1 && quantity <= 50) {
      counts.set(system, (counts.get(system) ?? 0) + quantity);
    }
  }
  return [...counts].map(([system, count]) => {
    const config = systems[system];
    const multi = config.multiOnly || count > 1;
    // Reserve one channel per shade for individual control.
    const included = Math.ceil(count / 15);
    const unitCents = multi ? config.multi : config.single;
    const raw = additional[system] ?? '0';
    const extra = Number(raw);
    const error = raw.trim() === '' || !Number.isInteger(extra) || extra < 0 || extra > 50
      ? 'Choose 0–50 additional remotes.' : undefined;
    return { system, label: config.label, count, included, unitCents,
      type: multi ? '15-channel remote' : 'single-channel remote',
      extra: error ? 0 : extra, error,
      cents: (included + (error ? 0 : extra)) * unitCents };
  });
}
