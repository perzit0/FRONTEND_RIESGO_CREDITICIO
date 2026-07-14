export const Colors = {
  // ── TEMA CLARO ──
  // Paleta "seca": tonos desaturados, sin pasteles saturados. Las tarjetas
  // se definen por borde (no por sombra), por eso los bordes son algo mas
  // marcados que antes. El fondo es un gris neutro para que las tarjetas
  // blancas resalten sin necesidad de relieve.
  light: {
    background: '#F4F4F5',
    card: '#FFFFFF',
    cardBorder: '#DEDEE2',
    input: '#F1F1F3',
    inputBorder: '#D6D6DB',

    textPrimary: '#1B1B1F',
    textSecondary: '#55555E',
    textMuted: '#9A9AA3',
    textLabel: '#3C3C44',

    primary: '#4C4F8A',
    primaryLight: '#ECECF2',
    primaryBorder: '#C7C7D8',

    success: '#3B7A5A',
    successBg: '#EBF1ED',
    successBorder: '#AEC6B9',
    warning: '#9E7420',
    warningBg: '#F3EEE2',
    warningBorder: '#D6C494',
    danger: '#B14242',
    dangerBg: '#F2E9E9',
    dangerBorder: '#D3ABAB',

    divider: '#E8E8EB',
    shadow: '#000000',
    logoutBorder: '#DEDEE2',
    logoutText: '#55555E',
  },
  // ── TEMA OSCURO ──
  // Mismo criterio: superficies planas, acentos apagados (no neon) pero con
  // contraste suficiente sobre negro.
  dark: {
    background: '#050506',
    card: '#101013',
    cardBorder: '#26262B',
    input: '#161619',
    inputBorder: '#2C2C32',

    textPrimary: '#EDEDEF',
    textSecondary: '#9E9EA6',
    textMuted: '#6C6C74',
    textLabel: '#C9C9CF',

    primary: '#8285BE',
    primaryLight: '#17172A',
    primaryBorder: '#34345A',

    success: '#5EA383',
    successBg: '#0E1F17',
    successBorder: '#2C5541',
    warning: '#C0A052',
    warningBg: '#1E1808',
    warningBorder: '#5E4C1C',
    danger: '#CE7B7B',
    dangerBg: '#241111',
    dangerBorder: '#5A2E2E',

    divider: '#1A1A1E',
    shadow: '#000000',
    logoutBorder: '#26262B',
    logoutText: '#9E9EA6',
  },
};

export type ColorScheme = typeof Colors.light;
