import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sansita: ["var(--font-sansita)"],
        nunito: ["var(--font-nunito-sans)"],
      },
      colors: {
        verde: "#54683D",
        blanco: "#E3DED9",
        parchment: "#FDF9F0",
        cambridgeBlue: "#69A297",
        teal: "#3E838C",
        ashGray: "#CAD4CB",
      },
    },
  },
  plugins: [],
};

export default config;
