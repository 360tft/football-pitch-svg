# football-pitch-svg

Tiny, dependency-free functions that draw football pitches as SVG strings.

Five pitch kinds: `full`, `half`, `penalty-area`, `small-sided`, `centre-circle`.
Landscape or portrait. Light or dark theme. Your own colours.

```ts
import { pitchSvg } from './src/index.ts'

const svg = pitchSvg('half', { orientation: 'portrait', theme: 'dark', width: 400 })
```

The viewBox is in metres, so you can place players and cones on top in real units.
Colour options are sanitised, so user input cannot inject markup.

## Examples

| File | What it shows |
| --- | --- |
| [examples/1-full-pitch-light.svg](examples/1-full-pitch-light.svg) | Full 105 x 68 m pitch, light theme |
| [examples/2-half-pitch-portrait-dark.svg](examples/2-half-pitch-portrait-dark.svg) | Half pitch, portrait, dark theme |
| [examples/3-small-sided-custom-colours.svg](examples/3-small-sided-custom-colours.svg) | Small-sided pitch, custom colours |

Rebuild them with `npm run examples`.

## Test

Needs Node 22.6 or newer (runs TypeScript directly).

```
npm test
```

## Want to put players, cones and arrows on a pitch?

Use the [FootballGPT Practice Designer](https://footballgpt.co/features/drill-creator?utm_source=github&utm_medium=open_source&utm_campaign=football-pitch-svg).
It draws full practices from a plain-English description.

## Licence

MIT. See [LICENSE](LICENSE). Pitch markings follow common 105 x 68 m
proportions. No third-party artwork, fonts or Laws wording is included.
