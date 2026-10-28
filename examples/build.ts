import { writeFileSync } from 'node:fs'
import { pitchSvg } from '../src/index.ts'

const out = new URL('./', import.meta.url)
const files: Record<string, string> = {
  '1-full-pitch-light.svg': pitchSvg('full', { width: 840 }),
  '2-half-pitch-portrait-dark.svg': pitchSvg('half', { orientation: 'portrait', theme: 'dark', width: 400 }),
  '3-small-sided-custom-colours.svg': pitchSvg('small-sided', { grass: '#2f6b3a', line: '#ffd84d', width: 640 }),
}
for (const [name, svg] of Object.entries(files)) writeFileSync(new URL(name, out), svg)
console.log(`wrote ${Object.keys(files).length} examples`)
