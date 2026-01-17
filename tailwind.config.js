/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'obsidian-primary': 'var(--background-primary)',
        'obsidian-secondary': 'var(--background-secondary)',
        'obsidian-text': 'var(--text-normal)',
        'obsidian-text-muted': 'var(--text-muted)',
        'obsidian-accent': 'var(--interactive-accent)',
        'obsidian-border': 'var(--background-modifier-border)',
      }
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Disable Tailwind's reset to avoid conflicts with Obsidian
  }
}