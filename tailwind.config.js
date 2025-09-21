const colors = require('./src/constants/colors.json');

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.primary,
        secondary: colors.secondary,
        tColor: colors.text,
        primaryLight: '#D1BB8B',
        merunRed: '#BB4141',
        lightGreen: '#A1FAC8',
        lightBlue: '#00A3FF'
      },
      height: {
        'screen-16px': 'calc(100vh - 16px)',
        'screen-80px': 'calc(100vh - 80px)'
      }
    },
  },
  plugins: [],
};
