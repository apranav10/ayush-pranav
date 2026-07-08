import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:           "rgb(var(--c-bg) / <alpha-value>)",
        "bg-alt":     "rgb(var(--c-bg-alt) / <alpha-value>)",
        fg:           "rgb(var(--c-fg) / <alpha-value>)",
        "fg-muted":   "rgb(var(--c-fg-muted) / <alpha-value>)",
        "fg-faint":   "rgb(var(--c-fg-faint) / <alpha-value>)",
        primary:      "rgb(var(--c-primary) / <alpha-value>)",
        secondary:    "rgb(var(--c-secondary) / <alpha-value>)",
        metric:       "rgb(var(--c-metric) / <alpha-value>)",
        surface:      "rgb(var(--c-surface) / <alpha-value>)",
        border:       "var(--c-border)",
        "border-mid": "var(--c-border-mid)",
        "border-soft": "var(--c-border-soft)",
      },
      fontFamily: {
        display: ["var(--font-active-display)", "Georgia", "serif"],
        body:    ["var(--font-active-body)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card:  "12px",
        tag:   "20px",
        modal: "16px",
      },
      boxShadow: {
        card:  "var(--shadow-card)",
        hover: "var(--shadow-hover)",
        modal: "var(--shadow-modal)",
      },
      spacing: {
        nav:     "64px",
        section: "80px",
      },
    },
  },
  plugins: [],
};

export default config;
