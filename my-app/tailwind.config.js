/** @type {import('tailwindcss').Config} */
export default {
  content: ["./public/index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        popi: "Poppins, sans-serif",
        meri: "Merriweather, serif",
      },
      borderWidth: {
        1: "1px",
      },
      boxShadow: {
        'custom-white': '0 0 3px rgba(255, 255, 255, 0.5)',
      },
    },
  },
  plugins: [],
};
