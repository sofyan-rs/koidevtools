import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [],
  darkMode: 'class',
  plugins: [require('@tailwindcss/typography')],
}
