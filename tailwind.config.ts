import type { Config } from "tailwindcss";

// Design tokens for Aisle — an editorial, precision-planning aesthetic.
// Deliberately avoiding blush/script-font wedding cliches: this is a
// production tool a coordinator runs a business on, not an invitation suite.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FAF7F1",      // page background — warm ivory paper
        ink: "#20222B",        // primary text — near-black navy ink
        "ink-soft": "#585B68", // secondary text
        line: "#E4DFD3",       // hairline rules / borders
        brass: "#A6793F",      // primary accent — stationery brass foil
        "brass-dark": "#8A6330",
        sage: "#5F6E52",       // secondary accent — success / confirmed
        rust: "#A94A3B",       // alerts / overdue / over-budget
        cloud: "#F1EEE5"       // card surface, one step off paper
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"]
      },
      borderRadius: {
        sm: "2px",
        DEFAULT: "3px",
        md: "4px"
      }
    }
  },
  plugins: []
};

export default config;
