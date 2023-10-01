module.exports = {
  purge: ["./public/index.html", "./src/**/*.{vue, js}"],
  darkMode: false,
  content: ["./src/**/*.{vue,html,js}"],
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography")],
};
