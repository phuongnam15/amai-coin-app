/** @type {import('tailwindcss').Config} */
export default {
  content: ["./public/index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        popi: "Poppins, sans-serif",
        meri: "Merriweather, serif",
        nutito: "Nunito, sans-serif",
      },
      borderWidth: {
        1: "1px",
      },
      boxShadow: {
        'custom-white': '0 0 3px rgba(255, 255, 255, 0.5)',
        'custom-inset': 'inset 0 -4px 20px rgba(111, 65, 210, 0.5)',
        'custom-inset-pink': 'inset 0 -4px 20px rgba(219, 112, 147, 0.5)',
        'custom-inset-2': '0 4px 20px rgba(111, 65, 210, 0.5)',
      },
      backgroundColor: {
        'custom-hover': 'rgba(111, 65, 210, 0.25)',
        'custom-hover2': 'rgba(219, 112, 147, 0.25)'
      },
      letterSpacing: {
        wider1: '0.07em',
      }
    },
  },
  plugins: [],
};
