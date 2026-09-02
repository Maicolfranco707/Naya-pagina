import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        naya: {
          green: '#1F3A34',      /* Verde Bosque */
          terracotta: '#BE5B4C', /* Terracota */
          salmon: '#DDAA88',     /* Tono Piel / Salmón */
          cream: '#E9E7D7',      /* Hueso / Crema */
          sage: '#C5D2B1',       /* Verde Salvia */
          sand: '#CECCBF',       /* Gris Cálido */
          rose: '#D2C6C6',       /* Rosa Pálido */
        }
      },
      fontFamily: {
        sans: ['var(--font-manrope)', 'sans-serif'],
        serif: ['var(--font-against)', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;