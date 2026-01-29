/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        steam: {
          blue: '#1b2838',
          accent: '#66c0f4',
          light: '#2a475e',
          gray: '#c7d5e0'
        }
      }
    },
  },
  plugins: [],
}