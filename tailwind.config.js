/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Bangers", "sans-serif"],
        display: ["Fredericka the Great", "sans"],
        body: ["Fredericka the Great", "sans"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        neon: "#66D4F6",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "zoom-in-out": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
        },
        load: {
          "0%, 100%": {
            transform: "translateY(0)",
            "animation-timing-function": "cubic-bezier(0, 0, 0.2, 1)",
          },
          "50%": {
            transform: "translateY(-25%)",
            "animation-timing-function": "cubic-bezier(0.8, 0, 1, 1)",
          },
        },
        "neon-pulse": {
          "0%, 100%": {
            textShadow: "0 0 8px #66D4F6, 0 0 12px #66D4F6, 0 0 16px #66D4F6",
          },
          "50%": {
            textShadow: "0 0 12px #66D4F6, 0 0 18px #66D4F6, 0 0 24px #66D4F6",
          },
        },
        glow: {
          "0%, 100%": {
            boxShadow:
              "0 0 10px #00ccb1, 0 0 20px #7b61ff, 0 0 30px #ffc414, 0 0 40px #1ca0fb",
          },
          "50%": {
            boxShadow:
              "0 0 15px #00ccb1, 0 0 30px #7b61ff, 0 0 45px #ffc414, 0 0 60px #1ca0fb",
          },
        },
        pulseOpacity: {
          "0%, 100%": { opacity: "0.7" },
          "50%": { opacity: "1.0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "zoom-in-out": "zoom-in-out 30s ease-in-out infinite",
        "spin-slow": "spin 2s linear infinite",
        load: "load 1s infinite",
        neon: "neon-pulse 3s ease-in-out infinite",
        glow: "glow 3s ease-in-out infinite",
        pulseOpacity: "pulseOpacity 3s ease-in-out infinite",
      },
    },
  },
  plugins: [
    import("tailwindcss-animate"),
    addVariablesForColors,
    function ({ addUtilities }) {
      addUtilities({
        ".text-neon": {
          color: "#66D4F6",
          textShadow: "0 0 5px #66D4F6, 0 0 10px #66D4F6, 0 0 15px #66D4F6",
          willChange: "text-shadow, opacity",
        },
      });
    },
  ],
};

import flattenColorPalette from "tailwindcss/lib/util/flattenColorPalette";

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val]),
  );

  addBase({
    ":root": newVars,
  });
}
