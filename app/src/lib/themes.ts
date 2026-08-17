export const THEME_STORAGE_KEY = 'solveiq-theme';

export const themes = [
  { id: 'onyx', label: 'Onyx', swatch: '#0a0a0a' },
  { id: 'slate', label: 'Slate', swatch: '#7c8fa8' },
  { id: 'snow', label: 'Snow', swatch: '#ffffff' },
  { id: 'forest', label: 'Forest', swatch: '#729a80' },
  { id: 'abyss', label: 'Abyss', swatch: '#6b939c' },
  { id: 'ember', label: 'Ember', swatch: '#ab8955' },
] as const;

export type ThemeId = (typeof themes)[number]['id'];
