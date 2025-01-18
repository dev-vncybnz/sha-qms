/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true
    },
    screens: {
      "sm": "480px",
      "md": "768px",
      "lg": "976px",
      "xl": "1440px",
      "2xl": "2000px",
    },
    extend: {
      colors: {
        orange: "#ff8906"
      }
    },
  },
  plugins: [],
}

