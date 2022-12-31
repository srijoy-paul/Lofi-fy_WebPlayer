/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        "primary": "#1DB954",
        "light": "#FFF",
        "dark": "#191414",
        "light-dark": "#282828",
        "dark-base": "#121212",
        "dark-primary": "#191414",
        "dark-secondry": "#171818",
        "primary-gray": "#535353",
      },
      gridTemplateColumns: {
        "auto-fill-cards": "repeat(auto-fill,minmax(200px,1fr))"
      }
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
}
