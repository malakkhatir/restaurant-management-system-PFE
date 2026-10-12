/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        animation: {
          'fade-in-down': 'fade-in-down 0.5s ease-out',
          'progress': 'progress 3s linear forwards',
        },
        keyframes: {
          'fade-in-down': {
            '0%': {
              opacity: '0',
              transform: 'translateY(-10px) translateX(-50%)'
            },
            '100%': {
              opacity: '1',
              transform: 'translateY(0) translateX(-50%)'
            },
          },
          'progress': {
            '0%': {
              width: '100%'
            },
            '100%': {
              width: '0%'
            },
          },
        },
      },
    },
    plugins: [],
  }
  