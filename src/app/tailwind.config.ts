import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sansita: ["Sansita", "sans-serif"],
        nunito: ["Nunito Sans", "sans-serif"],
      },
      colors: {
        parchment: "#F5F5DC", // Light beige
        richBlack: "#0A192F", // Deep blue-black
        teal: "#008080", // Teal
        cambridgeBlue: "#A3C1AD", // Muted blue-green
        ashGray: "#B2BEB5", // Light gray
      },
    },
  },
  plugins: [],
};

export default config;
