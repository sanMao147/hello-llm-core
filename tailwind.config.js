/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "chat-bg": "#343541",
        "chat-sidebar": "#171717",
        "chat-input": "#40414F",
        "chat-hover": "#2A2B32",
        "gpt-green": "#10A37F",
      },
      fontFamily: {
        sans: [
          "Söhne",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Ubuntu",
          "Cantarell",
          "Noto Sans",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
