/** @type {import('tailwindcss').Config} */
export default {
  darkMode: true, // or 'media' or 'class'
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js"
],
  theme: {
    extend: {},
  },
  plugins: [],
}

