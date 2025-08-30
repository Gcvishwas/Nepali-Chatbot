// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        rotateOrbital: "rotateOrbital 200s linear infinite",
        ambulanceAnimate: "botAnimate 2s linear infinite alternate",
        slideBg: "slideBg 8s ease-in-out infinite alternate",
      },
      keyframes: {
        rotateOrbital: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        ambulanceAnimate: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.1)" },
        },
        slideBg: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
