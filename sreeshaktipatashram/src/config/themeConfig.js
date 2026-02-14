// ==========================================
// CENTRALIZED THEME CONFIGURATION
// ==========================================
// Edit colors here to change the entire website theme

export const colorPalettes = {
  // Light mode palette
  light: {
    // Background colors
    bg: {
      primary: '#faf8f5',      // Main background
      secondary: '#ebe7e0',    // Alternate sections
      card: 'rgba(255, 255, 255, 0.85)', // Cards/overlays
      sidebar: 'rgba(255, 255, 255, 0.9)',
      gallery: '#f5f5f5',      // Gallery background
    },
    
    // Text colors
    text: {
      primary: '#1a1a1a',      // Main text
      secondary: '#666666',    // Secondary text
      muted: '#999999',        // Muted text
      light: 'rgba(0, 0, 0, 0.6)', // Light text
    },
    
    // Border colors
    border: {
      primary: 'rgba(0, 0, 0, 0.1)',
      secondary: 'rgba(0, 0, 0, 0.15)',
      strong: 'rgba(0, 0, 0, 0.25)',
      light: 'rgba(0, 0, 0, 0.05)',
    },
    
    // Accent colors
    accent: {
      primary: '#15616c',      // Main accent (teal)
      hover: '#0f4f58',        // Accent hover state
      secondary: '#c9a77c',    // Secondary accent (gold)
      tertiary: '#2dd4bf',     // Tertiary accent (bright teal)
    },
    
    // Social media colors (muted, professional)
    social: {
      instagram: '#c77a96',    // Muted pink-purple
      facebook: '#5a8bb8',     // Muted blue
      youtube: '#c86b6b',      // Muted red
      x: '#7a7a7a',           // Muted gray
    },
  },
  
  // Dark mode palette
  dark: {
    // Background colors
    bg: {
      primary: '#0b1013',      // Deep charcoal with subtle teal
      secondary: '#182127',    // Clearer contrast for alternating sections
      card: 'rgba(18, 24, 28, 0.85)',
      sidebar: 'rgba(15, 20, 24, 0.9)',
      gallery: '#0a0f12',      // Soft near-black
    },
    
    // Text colors
    text: {
      primary: '#f5f5f5',      // Near white
      secondary: '#b0b0b0',    // Light gray
      muted: '#808080',        // Medium gray
      light: 'rgba(255, 255, 255, 0.7)',
    },
    
    // Border colors
    border: {
      primary: 'rgba(255, 255, 255, 0.1)',
      secondary: 'rgba(255, 255, 255, 0.15)',
      strong: 'rgba(255, 255, 255, 0.25)',
      light: 'rgba(255, 255, 255, 0.05)',
    },
    
    // Accent colors
    accent: {
      primary: '#2dd4bf',      // Bright teal for dark mode
      hover: '#5eead4',        // Lighter teal on hover
      secondary: '#d4a574',    // Warm gold
      tertiary: '#14b8a6',     // Deep teal
    },
    
    // Social media colors (muted for dark mode, slightly brighter than light)
    social: {
      instagram: '#d98fb5',    // Soft pink-purple
      facebook: '#7aa3c9',     // Soft blue
      youtube: '#d98585',      // Soft red
      x: '#999999',           // Light gray
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
