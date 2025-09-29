/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          light: "#ffffff",
          dark: "#1e1e1e",
        },
        text: {
          light: "#2271c0",
          dark: "#4cafef",
        },
        text2: {
          light: "#3a3a3a",
          dark: "#e0e0e0",
        },
        hover: {
          light: "#897878",
          dark: "#555555",
        },
        hover2: {
          light: "rgb(53, 95, 143)",
          dark: "#3a7bd5",
        }
      }
    },
  },
  plugins: [],
}

