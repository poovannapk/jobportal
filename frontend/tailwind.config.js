/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17202a",
        muted: "#667585",
        brand: "#116d8c",
        accent: "#39c6a3",
        navy: "#10243d",
        coral: {
          500: "#db6b4d",
          600: "#c75c40"
        }
      }
    }
  },
  plugins: []
};
