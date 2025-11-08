// This file defines the app-wide color palette and typography
// based on the screenshots in the design document.

export const COLORS = {
  // Primary
  primary: '#3B82F6', // Blue (FABs, buttons, budget header)
  primary_light: '#E0F2FE', // Light Blue (Dashboard widgets, active pills)

  // Widget Colors
  green: '#10B981',
  green_light: '#D1FAE5',
  orange: '#F97316',
  orange_light: '#FFF7ED',
  purple: '#8B5CF6',
  purple_light: '#EDE9FE',
  
  // Meal Plan Colors
  meal_breakfast: '#FFF7ED',
  meal_breakfast_text: '#F97316',
  meal_lunch: '#FEFDE8',
  meal_lunch_text: '#EAB308',
  meal_dinner: '#F0FDF4',
  meal_dinner_text: '#22C55E',

  // Text
  text_dark: '#1C1917', // Near Black
  text: '#374151', // Dark Gray
  text_light: '#6B7280', // Medium Gray
  text_danger: '#EF4444', // Red (due dates, expenses)

  // Backgrounds - Light Mode
  background_light: '#FAF9F6', // Soft Off-white (Dashboard bg)
  background_white: '#FFFFFF', // White (Hub bg, cards, nav bar)
  background_modal: '#F5F3FF', // Very Light Purple (Add Item bg)
  
  // Backgrounds - Dark Mode
  background_dark: '#18181B', // Near Black (Calendar bg)
  background_dark_secondary: '#27272A', // Dark Gray (Calendar header)

  // Other
  border: '#E5E7EB', // Light Gray border
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const FONT_SIZES = {
  // Based on "Good morning, Daphne"
  xxl: 28,
  // Based on "Shopping", "Today's Events"
  xl: 22,
  // Based on list item text "Apples"
  lg: 18,
  // Body text, subtitles "2 entries"
  md: 16,
  // Default body text
  base: 14,
  // Meta text "9 h ago"
  sm: 12,
  // Extra small
  xs: 10,
};

export const FONTS = {
  // We can define font families here if we import custom fonts
  // For now, we'll rely on the system default sans-serif
  regular: 'System',
  medium: 'System', // We'd map this to Inter-Medium
  semibold: 'System', // We'd map this to Inter-SemiBold
  bold: 'System', // We'd map this to Inter-Bold
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const RADII = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  full: 999,
};

const theme = {
  COLORS,
  FONT_SIZES,
  FONTS,
  SPACING,
  RADII,
};

export default theme;