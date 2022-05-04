module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      BluePrimary: '#2070bb',
      blueSecondary: '#0b9390',
      black: '#0b0c0c',
      gray: {
        light: '#b1b4b6',
        default: '#505a5f'
      },
      white: '#fff',
      // maxWidth: {
      //   '1/4': '25%',
      //   '1/2': '50%',
      //   '3/4': '75%',
      //  }
    },
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
