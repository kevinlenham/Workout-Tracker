// One-off icon generator: renders the app's dumbbell glyph to the PNG sizes
// the manifest needs. Sharp isn't a project dependency (only needed to
// regenerate icons) - run `npm install -D sharp` before re-running this.
import sharp from 'sharp'
import { mkdir, writeFile } from 'node:fs/promises'

const BG = '#15171a'
const GLYPH = '#ECEDEE'
const ACCENT = '#4FBDB0'

function dumbbellPaths() {
  return `
    <rect x="176" y="236" width="160" height="40" rx="20" fill="${GLYPH}" />
    <rect x="96" y="176" width="56" height="160" rx="16" fill="${GLYPH}" />
    <rect x="360" y="176" width="56" height="160" rx="16" fill="${GLYPH}" />
    <rect x="160" y="206" width="16" height="100" rx="6" fill="${ACCENT}" />
    <rect x="336" y="206" width="16" height="100" rx="6" fill="${ACCENT}" />
  `
}

const roundedSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="${BG}" />
  ${dumbbellPaths()}
</svg>
`.trim()

const fullBleedSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${BG}" />
  ${dumbbellPaths()}
</svg>
`.trim()

await mkdir('public/icons', { recursive: true })

await writeFile('public/icons/favicon.svg', roundedSvg)

await sharp(Buffer.from(roundedSvg)).resize(192, 192).png().toFile('public/icons/icon-192.png')
await sharp(Buffer.from(roundedSvg)).resize(512, 512).png().toFile('public/icons/icon-512.png')
await sharp(Buffer.from(fullBleedSvg)).resize(512, 512).png().toFile('public/icons/icon-maskable-512.png')
await sharp(Buffer.from(fullBleedSvg)).resize(180, 180).png().toFile('public/icons/apple-touch-icon.png')

console.log('Icons written to public/icons/')
