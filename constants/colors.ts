export const Colors = {
  light: {
    // Fondos
    background: '#F0EFFF',
    card: '#FFFFFF',
    cardBorder: '#E2E8F0',
    input: '#F7F8FC',
    inputBorder: '#E2E8F0',

    // Textos
    textPrimary: '#1A1A2E',
    textSecondary: '#8892B0',
    textMuted: '#A0AEC0',
    textLabel: '#2D3748',

    // Marca
    primary: '#6B4EFF',
    primaryLight: '#EDE9FF',
    primaryBorder: '#C4B5FD',

    // Estados
    success: '#059669',
    successBg: '#ECFDF5',
    successBorder: '#6EE7B7',
    warning: '#D97706',
    warningBg: '#FFFBEB',
    warningBorder: '#FDE68A',
    danger: '#DC2626',
    dangerBg: '#FEF2F2',
    dangerBorder: '#FECACA',

    // Otros
    divider: '#F0EFFF',
    shadow: '#6B4EFF',
    logoutBorder: '#E2E8F0',
    logoutText: '#8892B0',
  },
  dark: {
    // Fondos
    background: '#0F0E1A',
    card: '#1A1928',
    cardBorder: '#2D2B45',
    input: '#252338',
    inputBorder: '#3D3A5C',

    // Textos
    textPrimary: '#F0EFFF',
    textSecondary: '#9D9BC0',
    textMuted: '#6B6990',
    textLabel: '#C4C2E0',

    // Marca
    primary: '#8B72FF',
    primaryLight: '#1E1A3A',
    primaryBorder: '#4A3F8A',

    // Estados
    success: '#34D399',
    successBg: '#052E16',
    successBorder: '#065F46',
    warning: '#FBBF24',
    warningBg: '#1C1700',
    warningBorder: '#78350F',
    danger: '#F87171',
    dangerBg: '#2D0A0A',
    dangerBorder: '#7F1D1D',

    // Otros
    divider: '#1E1C30',
    shadow: '#000000',
    logoutBorder: '#2D2B45',
    logoutText: '#9D9BC0',
  },
};

export type ColorScheme = typeof Colors.light;