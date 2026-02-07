/**
 * Common TypeScript types shared across the application
 */

// Mode types
export type AppMode = 'home' | 'institution' | null;

// Size types
export type Size = 'small' | 'medium' | 'large';

// Alignment types
export type Alignment = 'left' | 'center' | 'right';

// Variant types
export type Variant = 'horizontal' | 'vertical';

// Form validation result
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Action tile data structure
export interface ActionTileData {
  title: string;
  icon: React.ReactNode;
  tooltip?: string;
}

// Recent item data structure
export interface RecentItemData {
  title: string;
  time: string;
}

// Grid column configuration
export interface GridColumns {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}
