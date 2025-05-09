/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-white": "#f7f8ff", // Main Background
        "overlay-white": "#fefeff", // Overlay for panels/components
        "field-white": "#edeef8", // White for entry fields
        "button": "#2c3fc5", // Button Color
        "button-hover": "#3d4fd6", // Button Hover Color
        "text-primary": "#000101", // Primary Text
        "text-secondary": "#1a1415", // Secondary Text
      },
    },
  },
  plugins: [],
};
