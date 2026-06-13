/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#FF6B35",
        secondary: "#2D3748",
        success: "#38A169",
        bg: "#F7F8FA",
        card: "#FFFFFF",
        "text-primary": "#1A202C",
        "text-secondary": "#718096",
      },
      fontFamily: {
        sans: ["Inter_400Regular"],
        semibold: ["Inter_600SemiBold"],
        bold: ["Inter_700Bold"],
      },
    },
  },
  plugins: [],
};
