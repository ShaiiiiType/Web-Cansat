/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        keyframes:{
          'border-spin': {
            '100%': {
              transform: 'rotate(-360deg)',
              opacity: '0',
            },
            '0%':{
              opacity: '1',
            }
            
            
          },

          'heartbeat': {
            '100%': {
              backgroundColor: '#3ba7ff', // light blue
            },
            '0%': {
              backgroundColor: '#3ba7ff', // light blue
            },
            '50%': {
              backgroundColor: '#98cefa', // deeper blue
            },
          },

          'popup': {
            '0%': { transform: 'scale(0.5)', opacity: '0' },
            '50%' : { transform: 'scale(1.2)'},
            '70%': { transform: 'scale(0.8)'},
            '100%': { transform: 'scale(1)', opacity: '1' },
          },

          'notpop': {
            '100%': { transform: 'scale(0.95)', opacity: '0' },
            '0%': { transform: 'scale(1)', opacity: '1' },
          },
        },
        animation: {
            'border-spin': 'border-spin 1s linear infinite',
           'heartbeat': 'heartbeat 2s ease-in-out infinite',
           'popup': 'popup 0.7s ease-in-out forwards',
           'notpop': 'notpop 0.3s ease-out forwards',
        },
        colors: {
          'custom-blue': '#3ba7ff',
          'custom-blue1': '#78c2ff',
        }
      },
    },
    plugins: [],
  };
  