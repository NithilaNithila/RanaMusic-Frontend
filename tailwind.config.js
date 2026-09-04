/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#87CEEB",
          50: "#f0f9ff",
          100: "#bdeaf7",
          200: "#a8dfed",
          300: "#6bc4e6",
          400: "#4ab8df",
          500: "#38a6d3",
          600: "#2d8ab3",
          dark: "#0f1319",
          surface: "#161c24",
          "light-bg": "#f4f7fb",
        },
        ink: {
          800: "#1e2530",
          900: "#141921",
          950: "#0c1017",
        },
        premium: {
          primary: "#7c5bf5",
          secondary: "#b794f6",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", '"Segoe UI"', "Arial", "sans-serif"],
        display: [
          '"Playfair Display"',
          "Georgia",
          "ui-serif",
          "serif",
        ],
        premium: [
          '"Playfair Display"',
          "Georgia",
          "ui-serif",
          "serif",
        ],
      },
      screens: {
        tv: "1680px",
      },
      animation: {
        floatY: "floatY 3s ease-in-out infinite",
        fadeIn: "fadeIn 0.5s ease-out forwards",
        fadeInUp: "fadeInUp 0.6s ease-out forwards",
        ripple: "ripple 0.6s ease-out",
        gradientShift: "gradientShift 4s ease infinite",
        playingPulse: "playingPulse 1.8s ease-in-out infinite",
      },
      keyframes: {
        floatY: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        ripple: {
          to: { transform: "scale(4)", opacity: "0" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        playingPulse: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.08)" },
        },
      },
      backgroundSize: {
        "300%": "300% 300%",
      },
    },
  },
  plugins: [],
};
