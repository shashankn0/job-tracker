/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          bg: '#0D0D0F',
          sidebar: '#111114',
          content: '#18181C',
          card: '#202026',
        },
        accent: {
          primary: '#E0344A',
          hover: '#C42B3F',
          subtle: 'rgba(224, 52, 74, 0.08)',
        },
        text: {
          primary: '#F2F2F5',
          secondary: '#8B8B9E',
          muted: '#55556A',
        },
        border: '#2A2A35',
        success: '#3DB87A',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
