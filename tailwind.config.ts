import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Typography scale based on 8px base unit
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],      // Caption
        'sm': ['14px', { lineHeight: '20px' }],      // Small text
        'base': ['16px', { lineHeight: '24px' }],    // Body (default)
        'lg': ['18px', { lineHeight: '28px' }],      // Body large
        'xl': ['20px', { lineHeight: '28px' }],      // H4
        '2xl': ['24px', { lineHeight: '32px' }],     // H3
        '3xl': ['30px', { lineHeight: '36px' }],     // H2
        '4xl': ['36px', { lineHeight: '40px' }],     // H1
        '5xl': ['48px', { lineHeight: '1' }],
        '6xl': ['60px', { lineHeight: '1' }],
        '7xl': ['72px', { lineHeight: '1' }],
      },
      // Spacing based on 8px base unit
      spacing: {
        '0.5': '4px',
        '1': '8px',
        '1.5': '12px',
        '2': '16px',
        '2.5': '20px',
        '3': '24px',
        '4': '32px',
        '5': '40px',
        '6': '48px',
        '7': '56px',
        '8': '64px',
        '9': '72px',
        '10': '80px',
        '12': '96px',
        '16': '128px',
        '20': '160px',
        '24': '192px',
      },
      // Border radius
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        'full': '9999px',
      },
      // Font weights
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
  },
  plugins: [],
};
export default config;
