/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Serif Display"','Georgia','serif'],
        body: ['"DM Sans"','system-ui','sans-serif'],
      },
    },
  },
  plugins: [],
}
