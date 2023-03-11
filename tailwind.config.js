/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{njk,md,html,js}"],
  theme: {
    // Apply default styles to container (centre and add padding)
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {},
  },
  // use typography plugin for markdown content
  plugins: [require("@tailwindcss/typography")],
};
