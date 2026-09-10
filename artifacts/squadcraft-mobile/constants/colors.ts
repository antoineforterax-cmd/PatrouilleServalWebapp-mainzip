/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    text: '#19352b',
    tint: '#d49d32',
    background: '#f6f7f3',
    foreground: '#19352b',
    card: '#ffffff',
    cardForeground: '#244b3a',
    primary: '#d49d32',
    primaryForeground: '#ffffff',
    secondary: '#e3eee6',
    secondaryForeground: '#315645',
    muted: '#edf0e9',
    mutedForeground: '#829289',
    accent: '#173e30',
    accentForeground: '#f4f1e8',
    destructive: '#bd6c5e',
    destructiveForeground: '#ffffff',
    border: '#e1e8df',
    input: '#dfe7df',
    goldSoft: '#f4ecd9',
    greenSoft: '#e3eee6',
    blueSoft: '#e4edf0',
    coralSoft: '#f5e6e1',
    success: '#5c916b',
    blue: '#5d89a0',
  },
  radius: 12,
};

export default colors;
