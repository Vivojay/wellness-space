// ==========================================
// CENTRALIZED THEME CONFIGURATION
// ==========================================
// Edit colors here to change the entire website theme

export const colorPalettes = {
  // Light mode palette
  light: {
    // Background colors
    bg: {
      primary: '#f5f1e9',
      secondary: '#e5ddd0',
      card: 'rgba(255, 255, 255, 0.88)',
      sidebar: 'rgba(251, 252, 248, 0.92)',
      gallery: '#e7ede2',
    },
    
    // Text colors
    text: {
      primary: '#1b251d',
      secondary: '#4f5f54',
      muted: '#758377',
      light: 'rgba(19, 33, 24, 0.62)',
      headingSecondary: '#2f6f61',
    },
    
    // Border colors
    border: {
      primary: 'rgba(40, 62, 48, 0.15)',
      secondary: 'rgba(40, 62, 48, 0.22)',
      strong: 'rgba(40, 62, 48, 0.34)',
      light: 'rgba(40, 62, 48, 0.08)',
    },
    
    // Accent colors
    accent: {
      primary: '#32796f',
      hover: '#295f58',
      secondary: '#8b6c49',
      tertiary: '#479a8e',
    },
    
    // Social media colors (muted, professional)
    social: {
      instagram: '#a57784',
      facebook: '#6c8793',
      youtube: '#b48174',
      x: '#7f877f',
    },
  },
  
  // Dark mode palette
  dark: {
    // Background colors
    bg: {
      primary: '#0f1411',
      secondary: '#1e1814',
      card: 'rgba(20, 28, 23, 0.88)',
      sidebar: 'rgba(16, 23, 19, 0.92)',
      gallery: '#151d18',
    },
    
    // Text colors
    text: {
      primary: '#eef3ef',
      secondary: '#bcc8bf',
      muted: '#8e9a90',
      light: 'rgba(236, 245, 239, 0.72)',
      headingSecondary: '#aad8ce',
    },
    
    // Border colors
    border: {
      primary: 'rgba(210, 226, 214, 0.16)',
      secondary: 'rgba(210, 226, 214, 0.24)',
      strong: 'rgba(210, 226, 214, 0.34)',
      light: 'rgba(210, 226, 214, 0.1)',
    },
    
    // Accent colors
    accent: {
      primary: '#4b958a',
      hover: '#5daca0',
      secondary: '#a48662',
      tertiary: '#60b2a5',
    },
    
    // Social media colors (muted for dark mode, slightly brighter than light)
    social: {
      instagram: '#b08d97',
      facebook: '#87a2ad',
      youtube: '#c09283',
      x: '#9ba89f',
    },
  },
};

// Generate Tailwind-compatible theme object
export function getTheme(isDark) {
  const palette = isDark ? colorPalettes.dark : colorPalettes.light;
  
  return {
    // Background classes - using inline styles for dynamic values
    bg: palette.bg.primary,
    bgSecondary: palette.bg.secondary,
    cardBg: palette.bg.card,
    sidebarBg: palette.bg.sidebar,
    galleryBg: palette.bg.gallery,
    
    // Text classes
    text: palette.text.primary,
    textSecondary: palette.text.secondary,
    textMuted: palette.text.muted,
    textLight: palette.text.light,
    headingSecondary: palette.text.headingSecondary,
    
    // Border classes
    border: palette.border.primary,
    borderSecondary: palette.border.secondary,
    borderStrong: palette.border.strong,
    borderLight: palette.border.light,
    
    // Accent classes
    accent: palette.accent.primary,
    accentHover: palette.accent.hover,
    accentSecondary: palette.accent.secondary,
    accentTertiary: palette.accent.tertiary,
    
    // Social colors
    social: palette.social,
    
    // Raw color values (for inline styles)
    colors: palette,
  };
}

// CSS custom properties for dynamic theming
export function getThemeCSSVars(isDark) {
  const palette = isDark ? colorPalettes.dark : colorPalettes.light;
  
  return {
    '--color-bg-primary': palette.bg.primary,
    '--color-bg-secondary': palette.bg.secondary,
    '--color-bg-card': palette.bg.card,
    '--color-bg-sidebar': palette.bg.sidebar,
    '--color-bg-gallery': palette.bg.gallery,
    '--color-text-primary': palette.text.primary,
    '--color-text-secondary': palette.text.secondary,
    '--color-text-muted': palette.text.muted,
    '--color-text-light': palette.text.light,
    '--color-text-heading-secondary': palette.text.headingSecondary,
    '--color-border-primary': palette.border.primary,
    '--color-border-secondary': palette.border.secondary,
    '--color-border-strong': palette.border.strong,
    '--color-border-light': palette.border.light,
    '--color-accent-primary': palette.accent.primary,
    '--color-accent-hover': palette.accent.hover,
    '--color-accent-secondary': palette.accent.secondary,
    '--color-accent-tertiary': palette.accent.tertiary,
    '--color-social-instagram': palette.social.instagram,
    '--color-social-facebook': palette.social.facebook,
    '--color-social-youtube': palette.social.youtube,
    '--color-social-x': palette.social.x,
  };
}

export default { colorPalettes, getTheme, getThemeCSSVars };
