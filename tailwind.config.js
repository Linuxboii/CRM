import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "on-tertiary-fixed-variant": "#564427",
        "surface-dim": "#cbdbf5",
        "on-error": "#ffffff",
        "outline-variant": "#c5c6cd",
        "tertiary": "#1e1200",
        "surface-tint": "#545f73",
        "inverse-primary": "#bcc7de",
        "on-primary-fixed": "#111c2d",
        "on-error-container": "#93000a",
        "error-container": "#ffdad6",
        "secondary-fixed-dim": "#c0c1ff",
        "surface-variant": "#d3e4fe",
        "on-tertiary-fixed": "#271902",
        "tertiary-container": "#35260c",
        "on-tertiary": "#ffffff",
        "primary-fixed": "#d8e3fb",
        "surface-container-high": "#dce9ff",
        "on-secondary-fixed-variant": "#2f2ebe",
        "surface": "#f8f9ff",
        "on-surface": "#0b1c30",
        "primary": "#091426",
        "on-primary": "#ffffff",
        "on-secondary-container": "#fffbff",
        "surface-container-lowest": "#ffffff",
        "surface-bright": "#f8f9ff",
        "surface-container-low": "#eff4ff",
        "on-background": "#0b1c30",
        "on-surface-variant": "#45474c",
        "primary-fixed-dim": "#bcc7de",
        "on-primary-container": "#8590a6",
        "on-tertiary-container": "#a38c6a",
        "tertiary-fixed-dim": "#ddc39d",
        "on-primary-fixed-variant": "#3c475a",
        "tertiary-fixed": "#fadfb8",
        "secondary-container": "#6063ee",
        "outline": "#75777d",
        "inverse-surface": "#213145",
        "inverse-on-surface": "#eaf1ff",
        "on-secondary": "#ffffff",
        "primary-container": "#1e293b",
        "secondary-fixed": "#e1e0ff",
        "surface-container": "#e5eeff",
        "on-secondary-fixed": "#07006c",
        "surface-container-highest": "#d3e4fe",
        "background": "#f8f9ff",
        "error": "#ba1a1a",
        "secondary": "#4648d4"
      },
      borderRadius: {
        "DEFAULT": "0.375rem",
      },
      spacing: {
        "xl": "48px",
        "gutter": "24px",
        "base": "8px",
        "margin": "32px",
        "lg": "32px",
        "grid-columns": "12",
        "sm": "12px",
        "md": "24px",
        "xs": "4px"
      },
      fontFamily: {
        "display-lg": ["Manrope", "sans-serif"],
        "label-md": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "data-tabular": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "headline-md": ["Manrope", "sans-serif"],
        "headline-sm": ["Manrope", "sans-serif"]
      },
      fontSize: {
        "display-lg": ["48px", { "lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "label-md": ["12px", { "lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "500" }],
        "body-lg": ["16px", { "lineHeight": "1.6", "fontWeight": "400" }],
        "data-tabular": ["14px", { "lineHeight": "1", "fontWeight": "500" }],
        "body-md": ["14px", { "lineHeight": "1.5", "fontWeight": "400" }],
        "headline-md": ["24px", { "lineHeight": "1.3", "fontWeight": "600" }],
        "headline-sm": ["18px", { "lineHeight": "1.4", "fontWeight": "600" }]
      }
    },
  },
  plugins: [
    forms,
    containerQueries,
  ],
}
