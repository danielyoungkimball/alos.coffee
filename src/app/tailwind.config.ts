import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sansita: ["Sansita", "sans-serif"],
        nunito: ["Nunito Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
