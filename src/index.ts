export type PitchKind = 'full' | 'half' | 'penalty-area' | 'small-sided' | 'centre-circle'
export type Orientation = 'landscape' | 'portrait'

export interface PitchOptions {
  /** Output width in px. Height follows the pitch ratio. Default 600. */
  width?: number
  orientation?: Orientation
  /** Grass fill. Default depends on theme. */
  grass?: string
  /** Line colour. Default depends on theme. */
  line?: string
  theme?: 'light' | 'dark'
  /** Line width in metres. Default 0.12. */
  lineWidth?: number
}

interface Dim { w: number; h: number }

// Metres, landscape. Full pitch uses the common 105 x 68 size.
const SIZE: Record<PitchKind, Dim> = {
  full: { w: 105, h: 68 },
  half: { w: 52.5, h: 68 },
  'penalty-area': { w: 24, h: 41 },
  'small-sided': { w: 40, h: 25 },
  'centre-circle': { w: 25, h: 25 },
}

const THEMES = {
  light: { grass: '#3b8f4a', line: '#ffffff' },
  dark: { grass: '#14301c', line: '#8fd6a0' },
}

/** Pitch size in metres for a kind, landscape. */
export function pitchSize(kind: PitchKind): Dim {
  return { ...SIZE[kind] }
}

function esc(v: string): string {
  return v.replace(/[^#a-zA-Z0-9(),.%\s-]/g, '')
}

function round(n: number): number {
  return Math.round(n * 100) / 100
}

/** Draw a pitch. Returns a standalone SVG string. Units in the viewBox are metres. */
export function pitchSvg(kind: PitchKind, opts: PitchOptions = {}): string {
  const size = SIZE[kind]
  if (!size) throw new Error(`Unknown pitch kind: ${String(kind)}`)
  const theme = THEMES[opts.theme ?? 'light']
  const grass = esc(opts.grass ?? theme.grass)
  const line = esc(opts.line ?? theme.line)
  const lw = opts.lineWidth ?? 0.12
  const portrait = opts.orientation === 'portrait'
  const { w, h } = size
  const vbW = portrait ? h : w
  const vbH = portrait ? w : h
  const px = opts.width ?? 600
  const pxH = Math.round((px * vbH) / vbW)
  const m = 1 // margin in metres
  const parts: string[] = []
  const stroke = `fill="none" stroke="${line}" stroke-width="${lw * 2}"`

  parts.push(`<rect x="0" y="0" width="${w}" height="${h}" fill="${grass}"/>`)
  parts.push(`<rect x="${m}" y="${m}" width="${w - 2 * m}" height="${h - 2 * m}" ${stroke}/>`)

  const x0 = m, x1 = w - m, y0 = m, y1 = h - m
  const cy = h / 2

  const box = (side: 'l' | 'r', depth: number, span: number) => {
    const x = side === 'l' ? x0 : x1 - depth
    return `<rect x="${round(x)}" y="${round(cy - span / 2)}" width="${depth}" height="${span}" ${stroke}/>`
  }
  const spot = (x: number) => `<circle cx="${round(x)}" cy="${cy}" r="0.25" fill="${line}"/>`
  const arc = (side: 'l' | 'r', spotX: number) => {
    // 9.15 m arc outside a 16.5 m box. Chord intersection at box edge.
    const r = 9.15
    const boxEdge = side === 'l' ? x0 + 16.5 : x1 - 16.5
    const dx = Math.abs(boxEdge - spotX)
    const dy = Math.sqrt(Math.max(r * r - dx * dx, 0))
    const sweep = side === 'l' ? 1 : 0
    return `<path d="M ${round(boxEdge)} ${round(cy - dy)} A ${r} ${r} 0 0 ${sweep} ${round(boxEdge)} ${round(cy + dy)}" ${stroke}/>`
  }
  const goal = (side: 'l' | 'r') => {
    const x = side === 'l' ? x0 - 0.6 : x1
    return `<rect x="${round(x)}" y="${round(cy - 3.66)}" width="0.6" height="7.32" ${stroke}/>`
  }

  if (kind === 'full') {
    parts.push(`<line x1="${w / 2}" y1="${y0}" x2="${w / 2}" y2="${y1}" ${stroke}/>`)
    parts.push(`<circle cx="${w / 2}" cy="${cy}" r="9.15" ${stroke}/>`, spot(w / 2))
    for (const s of ['l', 'r'] as const) {
      parts.push(box(s, 16.5, 40.32), box(s, 5.5, 18.32), goal(s))
      const sx = s === 'l' ? x0 + 11 : x1 - 11
      parts.push(spot(sx), arc(s, sx))
    }
  } else if (kind === 'half') {
    parts.push(`<path d="M ${x1} ${y0} L ${x1} ${y1}" ${stroke}/>`)
    parts.push(`<path d="M ${x1} ${cy - 9.15} A 9.15 9.15 0 0 0 ${x1} ${cy + 9.15}" ${stroke}/>`)
    parts.push(box('l', 16.5, 40.32), box('l', 5.5, 18.32), goal('l'), spot(x0 + 11), arc('l', x0 + 11))
  } else if (kind === 'penalty-area') {
    parts.push(box('l', 16.5, 40.32), box('l', 5.5, 18.32), goal('l'), spot(x0 + 11), arc('l', x0 + 11))
  } else if (kind === 'small-sided') {
    parts.push(`<line x1="${w / 2}" y1="${y0}" x2="${w / 2}" y2="${y1}" ${stroke}/>`)
    parts.push(`<circle cx="${w / 2}" cy="${cy}" r="3" ${stroke}/>`, spot(w / 2))
    for (const s of ['l', 'r'] as const) parts.push(box(s, 6, 14), goal(s))
  } else {
    parts.push(`<circle cx="${w / 2}" cy="${cy}" r="9.15" ${stroke}/>`, spot(w / 2))
  }

  const inner = parts.join('')
  const body = portrait
    ? `<g transform="translate(${h} 0) rotate(90)">${inner}</g>`
    : inner
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${pxH}" viewBox="0 0 ${vbW} ${vbH}" role="img" aria-label="Football pitch: ${kind}">${body}</svg>`
}
