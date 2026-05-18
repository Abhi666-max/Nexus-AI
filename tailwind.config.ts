import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        geist: ["Inter", "sans-serif"],
      },
      colors: {
        background: "#09090B",
        surface: "#111113",
        "surface-2": "#18181B",
        border: "#27272A",
        "border-glow": "#3B82F680",
        accent: {
          DEFAULT: "#3B82F6",
          muted: "#1D4ED8",
          glow: "#3B82F620",
        },
        purple: {
          accent: "#8B5CF6",
          glow: "#8B5CF620",
        },
        text: {
          primary: "#FAFAFA",
          secondary: "#A1A1AA",
          muted: "#71717A",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-gradient":
          "radial-gradient(ellipse 80% 50% at 50% -10%, #3B82F620 0%, transparent 60%)",
        "card-gradient":
          "linear-gradient(135deg, #111113 0%, #18181B 100%)",
        "border-gradient":
          "linear-gradient(135deg, #3B82F640, #8B5CF640)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "fade-up": "fadeUp 0.7s ease-out forwards",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px #3B82F630" },
          "50%": { boxShadow: "0 0 40px #3B82F660" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      boxShadow: {
        "glow-blue": "0 0 30px #3B82F630, 0 0 60px #3B82F610",
        "glow-purple": "0 0 30px #8B5CF630, 0 0 60px #8B5CF610",
        "card": "0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px #27272A",
        "card-hover": "0 4px 20px rgba(0,0,0,0.6), 0 0 0 1px #3B82F640",
      },
    },
  },
  plugins: [],
};

export default config;
