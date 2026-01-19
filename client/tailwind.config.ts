import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {},
      spacing: {}
    }
  },
  plugins: []
} satisfies Config;
