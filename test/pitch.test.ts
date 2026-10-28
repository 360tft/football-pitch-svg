import { test } from 'node:test'
import assert from 'node:assert/strict'
import { pitchSvg, pitchSize, type PitchKind } from '../src/index.ts'

const KINDS: PitchKind[] = ['full', 'half', 'penalty-area', 'small-sided', 'centre-circle']

// Minimal well-formedness check: tags balance and attributes are quoted.
function checkSvg(s: string) {
  assert.match(s, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)
  assert.ok(s.endsWith('</svg>'))
  const stack: string[] = []
  for (const m of s.matchAll(/<(\/?)([a-zA-Z]+)([^>]*?)(\/?)>/g)) {
    const [, close, name, attrs, self] = m
    assert.ok(!/=[^"\s]/.test(attrs), `unquoted attribute in <${name}>`)
    if (self) continue
    if (close) assert.equal(stack.pop(), name)
    else stack.push(name)
  }
  assert.equal(stack.length, 0)
  assert.ok(!/NaN|undefined/.test(s))
}

for (const kind of KINDS) {
  for (const orientation of ['landscape', 'portrait'] as const) {
    test(`${kind} ${orientation} is valid SVG`, () => {
      checkSvg(pitchSvg(kind, { orientation }))
    })
  }
}

test('dark theme uses dark grass', () => {
  assert.match(pitchSvg('full', { theme: 'dark' }), /#14301c/)
})

test('width sets height from ratio', () => {
  const s = pitchSvg('full', { width: 1050 })
  assert.match(s, /width="1050" height="680"/)
})

test('portrait swaps the viewBox', () => {
  assert.match(pitchSvg('full', { orientation: 'portrait' }), /viewBox="0 0 68 105"/)
})

test('colour options cannot inject markup', () => {
  const s = pitchSvg('full', { line: '"/><script>x</script>' })
  assert.ok(!s.includes('<script'))
})

test('unknown kind throws', () => {
  assert.throws(() => pitchSvg('nope' as PitchKind))
})

test('pitchSize returns a copy', () => {
  const a = pitchSize('full'); a.w = 1
  assert.equal(pitchSize('full').w, 105)
})
