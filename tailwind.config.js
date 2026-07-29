/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1DB954",
          dark: "#121212",
          surface: "#181818",
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
      },
      backgroundSize: {
        "300%": "300% 300%",
      },
    },
  },

  plugins: [],
};
