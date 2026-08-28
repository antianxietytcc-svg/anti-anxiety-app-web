/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Paleta sky/blue/cyan já é nativa do Tailwind, mantemos como no site.
      // Adicione aqui tokens de marca se quiser nomes semânticos (ex: "calm-500").
    },
  },
  plugins: [],
};
