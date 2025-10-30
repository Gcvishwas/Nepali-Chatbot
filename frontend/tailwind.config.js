// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        rotateOrbital: "rotateOrbital 200s linear infinite",
        ambulanceAnimate: "botAnimate 2s linear infinite alternate",
        slideBg: "slideBg 8s ease-in-out infinite alternate",
        slideDown: "slideDown 0.6s ease-out",
        slideIn: "slideIn 0.3s ease-out forwards",
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
        slideDown: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideIn: {
          "0%": {
            opacity: "0",
            transform: "translateY(-10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
    },
  },
  plugins: [],
};
