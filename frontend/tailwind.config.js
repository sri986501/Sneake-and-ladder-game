/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#1C120C", // Rich dark leather/wood background
        neonBlue: "#D4AF37", // Ornate gold / brass accents
        neonPurple: "#8C2B2B", // Antique crimson/rust accent
        electricPurple: "#2E5A44", // Vintage hunter/forest green
        accentGold: "#C5A059", // Aged bronze / gold
        accentCyan: "#F4ECD8", // Antique paper / parchment cream
        cardBg: "rgba(40, 27, 18, 0.85)", // Mahogany card background
      },
      boxShadow: {
        neonBlue: '0 0 10px rgba(212, 175, 55, 0.5), 0 0 20px rgba(212, 175, 55, 0.25)',
        neonPurple: '0 0 10px rgba(140, 43, 43, 0.5), 0 0 20px rgba(140, 43, 43, 0.25)',
        neonGold: '0 0 10px rgba(197, 160, 89, 0.5), 0 0 20px rgba(197, 160, 89, 0.25)',
        neonCyan: '0 0 10px rgba(244, 236, 216, 0.5), 0 0 20px rgba(244, 236, 216, 0.25)',
      },
      fontFamily: {
        sans: ['"IM Fell English"', 'Georgia', 'serif'],
        serif: ['"Cinzel"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
