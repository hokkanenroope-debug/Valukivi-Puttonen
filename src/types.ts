export type TombstoneSize = {
  width: number;
  height: number;
  label: string;
};

export type EngravingType = 'text' | 'symbol' | 'cutout' | 'cross';

export type EngravingCategory = 'firstName' | 'lastName' | 'birthDate' | 'deathDate' | 'other';

export type Engraving = {
  id: string;
  type: EngravingType;
  category?: EngravingCategory;
  showSymbol?: boolean;
  text: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize: number;
  fontFamily: string;
  fontStyle?: string;
  color: string;
  stroke?: string;
  strokeWidth?: number;
  letterSpacing?: number;
  isDragging: boolean;
};

export const WIDTH_OPTIONS = [50, 60, 70, 80, 90, 100];
export const HEIGHT_OPTIONS = [50, 60, 70, 80, 90, 100];

export const FIRST_NAME_SIZES = [25, 40, 50, 60]; // in mm
export const LAST_NAME_SIZES = [40, 50, 60, 70, 80]; // in mm
export const DATE_SIZES = [25, 40, 50]; // in mm
export const STONE_COLORS = [
  { label: "Musta", value: "#1a1a1a", texture: "/stone-black.jpg" },
  { label: "Harmaa", value: "#4a4a4a", texture: "/stone-grey.jpg" },
];

export const LETTERING_COLORS = [
  { label: "Kulta", value: "#b08d57" },
  { label: "Hopea", value: "#c0c0c0" },
];

export const FONT_FAMILIES = [
  "Serif",
  "Sans-serif",
  "Cormorant Garamond",
  "Libre Baskerville",
  "Playfair Display",
  "Inter",
];
