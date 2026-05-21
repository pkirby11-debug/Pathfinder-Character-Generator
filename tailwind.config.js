/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: "#fdfaf3",
          100: "#f7efd9",
          200: "#ecdcb0",
          300: "#d9be7e",
          400: "#b89455",
          500: "#8c6a33",
        },
        ink: {
          900: "#1a1410",
          800: "#2b211b",
          700: "#3d2f25",
        },
        rust: {
          500: "#a23a1f",
          600: "#822f19",
          700: "#5c2112",
        },
      },
      fontFamily: {
        serif: ["'IM Fell English'", "Georgia", "serif"],
        display: ["'Cinzel'", "Georgia", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
