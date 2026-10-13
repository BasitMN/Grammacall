// Colours and type from the UI mockup ("GrammaCall-UI-mockup.html").
export const colors = {
  background: '#ECEDEF',
  surface: '#FFFFFF',
  ink: '#16181D',
  muted: '#4A4F58',
  onInk: '#FFFFFF',
  danger: '#B3261E',
  dangerPressed: '#8C1D17',
  success: '#0B6E3C',
};

// Nephew-facing screens (PIN, settings): denser, smaller, still high contrast.
export const settingsColors = {
  background: '#F4F5F7',
  card: '#FFFFFF',
  border: '#DCDFE4',
  divider: '#E8EAEE',
  subtle: '#5B626E',
  faint: '#868D97',
  buttonBorder: '#C3C8D0',
  pinBackground: '#16181D',
  pinKey: '#23262E',
  pinKeyBorder: '#343842',
  pinMuted: '#A2A9B4',
  pinEmpty: '#5B626E',
};

// Custom fonts carry their own weight; don't combine with fontWeight on Android.
export const fonts = {
  regular: 'AtkinsonHyperlegible_400Regular',
  bold: 'AtkinsonHyperlegible_700Bold',
};

export type TilePalette = { background: string; figure: string };

// Picked by tile position, so each person keeps their colour.
export const tilePalettes: TilePalette[] = [
  { background: '#C9DCEF', figure: '#2C4F75' },
  { background: '#F4DCC3', figure: '#7A4A1E' },
  { background: '#D2E7D1', figure: '#2E5B38' },
  { background: '#E1D5ED', figure: '#4B3A66' },
];

export function paletteFor(position: number): TilePalette {
  return tilePalettes[position % tilePalettes.length];
}
