const round = (num) =>
  num
    .toFixed(7)
    .replace(/(\.[0-9]+?)0+$/, "$1")
    .replace(/\.0$/, "");
const rem = (px) => `${round(px / 16)}rem`;
const em = (px, base) => `${round(px / base)}em`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{njk,md,html,js}", ".eleventy.js"],
  theme: {
    // Apply default styles to container (centre and add padding)
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: '80ch',
            a: {
              color: theme("colors.blue.600"),
              textDecoration: "none",
              fontWeight: "inherit",
              textDecorationThickness: "3px",
            },
            "a::hover": {
              textDecoration: "underline",
              textUnderlineOffset: "5px",
            },
            "code::before": {
              content: "none",
            },
            "code::after": {
              content: "none",
            },
            code: {
              color: "#e2777a",
            },
            "* code": {
              color: "#e2777a",
            },
            "blockquote p:first-of-type::before": {
              content: "none",
            },
            "blockquote p:last-of-type::after": {
              content: "none",
            },
          },
        },
      }),
    },
  },
  // use typography plugin for markdown content
  plugins: [require("@tailwindcss/typography")],
};
