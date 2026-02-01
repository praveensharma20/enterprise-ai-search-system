/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class', // Enables the manual 'light-theme' / 'dark' toggle logic
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          studio: {
            ink: '#1a1a1a',
            paper: '#fdfdfc',
            sand: '#f4f3ef',
            muted: '#8c8c8c',
          }
        },
        fontFamily: {
          serif: ['Georgia', 'serif'],
          sans: ['Inter', 'system-ui', 'sans-serif'],
        },
      },
    },
    plugins: [],
  }