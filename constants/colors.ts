export const Colors = {
  light: {
    background: '#FFFFFF',
    card: '#FFFFFF',
    cardBorder: '#E5E7EB',
    input: '#F9FAFB',
    inputBorder: '#E5E7EB',

    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    textLabel: '#374151',

    primary: '#4F46E5',
    primaryLight: '#EEF2FF',
    primaryBorder: '#C7D2FE',

    success: '#059669',
    successBg: '#ECFDF5',
    successBorder: '#6EE7B7',
    warning: '#D97706',
    warningBg: '#FFFBEB',
    warningBorder: '#FDE68A',
    danger: '#DC2626',
    dangerBg: '#FEF2F2',
    dangerBorder: '#FECACA',

    divider: '#F3F4F6',
    shadow: '#000000',
    logoutBorder: '#E5E7EB',
    logoutText: '#6B7280',
  },
  dark: {
    background: '#000000',
    card: '#0A0A0A',
    cardBorder: '#1F1F1F',
    input: '#111111',
    inputBorder: '#262626',

    textPrimary: '#F5F5F5',
    textSecondary: '#A3A3A3',
    textMuted: '#737373',
    textLabel: '#D4D4D4',

    primary: '#818CF8',
    primaryLight: '#141428',
    primaryBorder: '#3730A3',

    success: '#34D399',
    successBg: '#052E16',
    successBorder: '#065F46',
    warning: '#FBBF24',
    warningBg: '#1C1700',
    warningBorder: '#78350F',
    danger: '#F87171',
    dangerBg: '#2D0A0A',
    dangerBorder: '#7F1D1D',

    divider: '#141414',
    shadow: '#000000',
    logoutBorder: '#1F1F1F',
    logoutText: '#A3A3A3',
  },
};

export type ColorScheme = typeof Colors.light;
