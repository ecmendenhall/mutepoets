const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  purge: {
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  },
  darkMode: false,
  theme: {
    extend: {},
    fontFamily: {
      mono: [...defaultTheme.fontFamily.mono],
      display: ["Josefin Sans"],
      body: ["Montserrat"],
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
