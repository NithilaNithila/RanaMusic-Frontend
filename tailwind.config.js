/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    // Device ladder: mobile (<sm) / tablet (sm-md) / laptop (lg-xl) / TV (tv)
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      tv: "1800px",
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Arial", "sans-serif"],
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
      },
      colors: {
        // Sky-blue identity — DEFAULT/dark/surface/light-bg are the original,
        // load-bearing tokens referenced across the app. The 50–950 ramp is
        // new: several steps intentionally equal hex values that were already
        // hand-picked and scattered through components (200/300/600), so
        // consolidating onto the scale is a no-visual-diff cleanup for most
        // call sites, not a re-theme.
        brand: {
          DEFAULT: "#87CEEB",
          50: "#eaf6fb",
          100: "#d9f1fb",
          200: "#a9def4",
          300: "#7cc9e8",
          400: "#5fb3d9",
          500: "#4aa0c9",
          600: "#4a90b8",
          700: "#3a7292",
          800: "#2c5670",
          900: "#1f3d4f",
          950: "#142a37",
          dark: "#0f1319",
          surface: "#171c24",
          "light-bg": "#f4f7fb",
        },
        // Azure-to-violet spectrum used for the "premium" now-playing glass
        // UI and gradient accents — replaces ~15 one-off purples/blues that
        // had drifted out of sync across the player components.
        accent: {
          50: "#f5f2ff",
          100: "#e6ddff",
          200: "#c9b8ff",
          300: "#a58bff",
          400: "#8b6bff",
          500: "#7c5cff",
          600: "#7c3aed",
          700: "#6027c4",
          800: "#4a1d99",
          900: "#351572",
          950: "#200d47",
        },
        // Small dedicated scale for the like/heart burst + live indicators.
        rose: {
          DEFAULT: "#ff5a7a",
          400: "#ff85a0",
          500: "#ff5a7a",
          600: "#e14567",
        },
        // Near-black cinematic surfaces (Now Playing sheets/backgrounds) —
        // consolidates ~9 near-duplicate near-blacks onto 3 clean steps.
        ink: {
          800: "#1c222c",
          900: "#12141a",
          950: "#08090b",
        },
        premium: {
          primary: "#4F9CF9",
          secondary: "#7C3AED",
          bg: "#0B0F17",
        },
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        floatY: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        eq: {
          "0%, 100%": { transform: "scaleY(0.3)" },
          "50%": { transform: "scaleY(1)" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        playingPulse: {
          "0%": { boxShadow: "0 0 0 0 rgba(135,206,235,0.45)" },
          "70%": { boxShadow: "0 0 0 12px rgba(135,206,235,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(135,206,235,0)" },
        },
        ripple: {
          "0%": { transform: "scale(0)", opacity: "0.5" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
      },
      animation: {
        fadeInUp: "fadeInUp 0.7s ease-out forwards",
        fadeIn: "fadeIn 1s ease-out forwards",
        floatY: "floatY 4s ease-in-out infinite",
        eq1: "eq 1.1s ease-in-out infinite",
        eq2: "eq 0.9s ease-in-out infinite 0.15s",
        eq3: "eq 1.3s ease-in-out infinite 0.3s",
        eq4: "eq 0.8s ease-in-out infinite 0.1s",
        gradientShift: "gradientShift 8s ease infinite",
        marquee: "marquee 30s linear infinite",
        playingPulse: "playingPulse 2.2s ease-out infinite",
        ripple: "ripple 0.6s ease-out forwards",
      },
      backgroundSize: {
        "300%": "300% 300%",
      },
    },
  },

  plugins: [],
};
