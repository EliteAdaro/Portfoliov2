// =============================================
// Snake Draw Helpers — all rendering functions
// =============================================

// Direction angle from one segment to another
export function getAngle(from, to) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  if (dx === 1) return 0
  if (dx === -1) return Math.PI
  if (dy === 1) return Math.PI / 2
  return -Math.PI / 2
}

// Parse a hex color to { r, g, b }
function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

// Get body color with gradient + alternating brightness
export function getBodyColor(index, total, snakeColor, snakeAltColor) {
  const mainRgb = hexToRgb(snakeColor.startsWith('#') ? snakeColor : '#64ffda')
  const t = total > 1 ? index / (total - 1) : 0
  const isEven = index % 2 === 0
  const shift = isEven ? 10 : -10
  const darken = t * 50
  const r = Math.round(Math.min(255, Math.max(0, mainRgb.r - darken + shift)))
  const g = Math.round(Math.min(255, Math.max(0, mainRgb.g - darken + shift)))
  const b = Math.round(Math.min(255, Math.max(0, mainRgb.b - darken + shift)))
  return `rgb(${r}, ${g}, ${b})`
}

// =============================================
// FOOD — dispatcher based on settings.foodStyle
// =============================================
export function drawFood(ctx, x, y, size, settings) {
  const style = settings?.foodStyle || 'apple'

  if (style === 'simple') return drawFoodSimple(ctx, x, y, size)
  if (style === 'apple') return drawFoodApple(ctx, x, y, size)
  if (style === 'cherry') return drawFoodCherry(ctx, x, y, size)
  if (style === 'orange') return drawFoodOrange(ctx, x, y, size)
  if (style === 'grape') return drawFoodGrape(ctx, x, y, size)
  if (style === 'watermelon') return drawFoodWatermelon(ctx, x, y, size)
  if (style === 'lemon') return drawFoodLemon(ctx, x, y, size)
  if (style === 'random') {
    // Pick a random fruit per position (deterministic based on x,y so it doesn't flicker)
    const fruits = ['apple', 'cherry', 'orange', 'grape', 'watermelon', 'lemon']
    const idx = ((x * 7 + y * 13) & 0xffff) % fruits.length
    return drawFood(ctx, x, y, size, { foodStyle: fruits[idx] })
  }

  return drawFoodApple(ctx, x, y, size)
}

// Simple: just a glowing red circle
function drawFoodSimple(ctx, x, y, size) {
  const cx = x + size / 2
  const cy = y + size / 2

  ctx.save()
  ctx.shadowColor = '#ff6b6b'
  ctx.shadowBlur = 10
  ctx.fillStyle = '#e74c3c'
  ctx.beginPath()
  ctx.arc(cx, cy, size / 2 - 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0
  // Highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.beginPath()
  ctx.arc(cx - 2, cy - 2, size / 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

// Apple
function drawFoodApple(ctx, x, y, size) {
  const cx = x + size / 2
  const cy = y + size / 2
  const r = size / 2 - 3

  ctx.save()
  ctx.shadowColor = '#ff6b6b'
  ctx.shadowBlur = 8

  ctx.fillStyle = '#e74c3c'
  ctx.beginPath()
  ctx.arc(cx - r * 0.2, cy + r * 0.1, r * 0.85, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#c0392b'
  ctx.beginPath()
  ctx.arc(cx + r * 0.2, cy + r * 0.1, r * 0.85, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
  ctx.beginPath()
  ctx.arc(cx - r * 0.3, cy - r * 0.2, r * 0.3, 0, Math.PI * 2)
  ctx.fill()

  ctx.shadowBlur = 0
  ctx.strokeStyle = '#5d4037'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(cx, cy - r * 0.6)
  ctx.lineTo(cx + 1, cy - r * 1.1)
  ctx.stroke()

  ctx.fillStyle = '#27ae60'
  ctx.beginPath()
  ctx.ellipse(cx + 3, cy - r * 0.9, 3, 1.5, Math.PI / 4, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

// Cherry — two small circles with a stem
function drawFoodCherry(ctx, x, y, size) {
  const cx = x + size / 2
  const cy = y + size / 2
  const r = size / 2 - 3

  ctx.save()
  ctx.shadowColor = '#dc2626'
  ctx.shadowBlur = 8

  // Left cherry
  ctx.fillStyle = '#dc2626'
  ctx.beginPath()
  ctx.arc(cx - r * 0.35, cy + r * 0.2, r * 0.55, 0, Math.PI * 2)
  ctx.fill()

  // Right cherry
  ctx.fillStyle = '#b91c1c'
  ctx.beginPath()
  ctx.arc(cx + r * 0.35, cy + r * 0.2, r * 0.55, 0, Math.PI * 2)
  ctx.fill()

  // Highlights
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.beginPath()
  ctx.arc(cx - r * 0.45, cy + r * 0.05, r * 0.15, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(cx + r * 0.25, cy + r * 0.05, r * 0.15, 0, Math.PI * 2)
  ctx.fill()

  ctx.shadowBlur = 0

  // Stems
  ctx.strokeStyle = '#5d4037'
  ctx.lineWidth = 1.5
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(cx - r * 0.35, cy - r * 0.1)
  ctx.quadraticCurveTo(cx - r * 0.1, cy - r * 1.0, cx + r * 0.1, cy - r * 0.8)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx + r * 0.35, cy - r * 0.1)
  ctx.quadraticCurveTo(cx + r * 0.1, cy - r * 0.9, cx + r * 0.1, cy - r * 0.8)
  ctx.stroke()

  // Leaf
  ctx.fillStyle = '#22c55e'
  ctx.beginPath()
  ctx.ellipse(cx + r * 0.3, cy - r * 0.8, 3, 1.5, -Math.PI / 6, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

// Orange — round with dimpled texture
function drawFoodOrange(ctx, x, y, size) {
  const cx = x + size / 2
  const cy = y + size / 2
  const r = size / 2 - 3

  ctx.save()
  ctx.shadowColor = '#f97316'
  ctx.shadowBlur = 8

  // Main body
  ctx.fillStyle = '#f97316'
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()

  // Darker edge
  ctx.fillStyle = '#ea580c'
  ctx.beginPath()
  ctx.arc(cx + r * 0.15, cy + r * 0.15, r * 0.85, 0, Math.PI * 2)
  ctx.fill()

  // Fill back with lighter
  ctx.fillStyle = '#fb923c'
  ctx.beginPath()
  ctx.arc(cx - r * 0.1, cy - r * 0.1, r * 0.7, 0, Math.PI * 2)
  ctx.fill()

  ctx.shadowBlur = 0

  // Highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.beginPath()
  ctx.arc(cx - r * 0.3, cy - r * 0.3, r * 0.25, 0, Math.PI * 2)
  ctx.fill()

  // Navel dot
  ctx.fillStyle = '#c2410c'
  ctx.beginPath()
  ctx.arc(cx, cy - r * 0.65, r * 0.15, 0, Math.PI * 2)
  ctx.fill()

  // Small leaf
  ctx.fillStyle = '#22c55e'
  ctx.beginPath()
  ctx.ellipse(cx + 2, cy - r * 0.85, 2.5, 1.2, Math.PI / 5, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

// Grape — cluster of small purple circles
function drawFoodGrape(ctx, x, y, size) {
  const cx = x + size / 2
  const cy = y + size / 2
  const gr = size / 2 - 4
  const dotR = gr * 0.35

  ctx.save()
  ctx.shadowColor = '#8b5cf6'
  ctx.shadowBlur = 6

  const positions = [
    [-0.3, -0.3], [0.3, -0.3],
    [-0.5, 0.2], [0, 0.15], [0.5, 0.2],
    [-0.3, 0.6], [0.3, 0.6],
  ]

  positions.forEach(([dx, dy], i) => {
    ctx.fillStyle = i % 2 === 0 ? '#8b5cf6' : '#7c3aed'
    ctx.beginPath()
    ctx.arc(cx + dx * gr, cy + dy * gr, dotR, 0, Math.PI * 2)
    ctx.fill()
  })

  // Highlights
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
  positions.forEach(([dx, dy]) => {
    ctx.beginPath()
    ctx.arc(cx + dx * gr - 1, cy + dy * gr - 1, dotR * 0.3, 0, Math.PI * 2)
    ctx.fill()
  })

  ctx.shadowBlur = 0

  // Stem
  ctx.strokeStyle = '#5d4037'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(cx, cy - gr * 0.5)
  ctx.lineTo(cx, cy - gr * 1.0)
  ctx.stroke()

  // Leaf
  ctx.fillStyle = '#22c55e'
  ctx.beginPath()
  ctx.ellipse(cx + 2, cy - gr * 0.9, 3, 1.5, Math.PI / 4, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

// Watermelon — half slice
function drawFoodWatermelon(ctx, x, y, size) {
  const cx = x + size / 2
  const cy = y + size / 2
  const r = size / 2 - 3

  ctx.save()
  ctx.shadowColor = '#22c55e'
  ctx.shadowBlur = 6

  // Green rind (full semicircle at bottom)
  ctx.fillStyle = '#16a34a'
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI)
  ctx.fill()

  // Red flesh (inner semicircle)
  ctx.fillStyle = '#ef4444'
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.8, 0, Math.PI)
  ctx.fill()

  // Lighter red center
  ctx.fillStyle = '#f87171'
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.5, 0, Math.PI)
  ctx.fill()

  ctx.shadowBlur = 0

  // Seeds
  ctx.fillStyle = '#1a1a1a'
  const seeds = [[-0.35, 0.25], [0, 0.35], [0.35, 0.25], [-0.15, 0.15], [0.15, 0.15]]
  seeds.forEach(([dx, dy]) => {
    ctx.beginPath()
    ctx.ellipse(cx + dx * r, cy + dy * r, 1.2, 0.8, Math.PI / 4, 0, Math.PI * 2)
    ctx.fill()
  })

  // Flat top edge
  ctx.strokeStyle = '#15803d'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cx - r, cy)
  ctx.lineTo(cx + r, cy)
  ctx.stroke()

  ctx.restore()
}

// Lemon — oval yellow shape
function drawFoodLemon(ctx, x, y, size) {
  const cx = x + size / 2
  const cy = y + size / 2
  const r = size / 2 - 3

  ctx.save()
  ctx.shadowColor = '#facc15'
  ctx.shadowBlur = 8

  // Main body (oval)
  ctx.fillStyle = '#facc15'
  ctx.beginPath()
  ctx.ellipse(cx, cy, r * 0.95, r * 0.75, Math.PI / 12, 0, Math.PI * 2)
  ctx.fill()

  // Darker shade
  ctx.fillStyle = '#eab308'
  ctx.beginPath()
  ctx.ellipse(cx + r * 0.1, cy + r * 0.1, r * 0.7, r * 0.55, Math.PI / 12, 0, Math.PI * 2)
  ctx.fill()

  // Lighter fill
  ctx.fillStyle = '#fde047'
  ctx.beginPath()
  ctx.ellipse(cx - r * 0.1, cy - r * 0.1, r * 0.55, r * 0.4, Math.PI / 12, 0, Math.PI * 2)
  ctx.fill()

  ctx.shadowBlur = 0

  // Highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'
  ctx.beginPath()
  ctx.arc(cx - r * 0.3, cy - r * 0.2, r * 0.2, 0, Math.PI * 2)
  ctx.fill()

  // Tip bumps
  ctx.fillStyle = '#d9a406'
  ctx.beginPath()
  ctx.arc(cx - r * 0.85, cy - r * 0.15, r * 0.15, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(cx + r * 0.9, cy + r * 0.1, r * 0.12, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

// =============================================
// BODY SEGMENT
// =============================================
export function drawBodySegment(ctx, seg, prev, next, index, total, size, settings) {
  const color = getBodyColor(index, total, settings.snakeColor, settings.snakeAltColor)

  ctx.fillStyle = color

  // Main body cell
  ctx.beginPath()
  ctx.roundRect(seg.x * size + 2, seg.y * size + 2, size - 4, size - 4, 4)
  ctx.fill()

  // Connector to previous segment (fills gap)
  if (prev) {
    const dx = prev.x - seg.x
    const dy = prev.y - seg.y
    if (dx !== 0) {
      const connX = dx > 0 ? seg.x * size + size - 2 : seg.x * size - size + 6
      ctx.fillRect(connX, seg.y * size + 3, size - 4, size - 6)
    } else if (dy !== 0) {
      const connY = dy > 0 ? seg.y * size + size - 2 : seg.y * size - size + 6
      ctx.fillRect(seg.x * size + 3, connY, size - 6, size - 4)
    }
  }

  // Scale highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
  ctx.beginPath()
  ctx.arc(seg.x * size + size / 2 - 1, seg.y * size + size / 2 - 1, size / 4, 0, Math.PI * 2)
  ctx.fill()
}

// =============================================
// HEAD — Simple / Medium / Advanced
// =============================================
export function drawHead(ctx, seg, nextSeg, size, settings) {
  const style = settings.headStyle || 'advanced'

  if (style === 'simple') return drawHeadSimple(ctx, seg, size, settings)
  if (style === 'medium') return drawHeadMedium(ctx, seg, nextSeg, size, settings)
  return drawHeadAdvanced(ctx, seg, nextSeg, size, settings)
}

// Simple: just a rounded square in the snake color, slightly brighter
function drawHeadSimple(ctx, seg, size, settings) {
  ctx.fillStyle = settings.snakeColor
  ctx.shadowColor = settings.snakeColor
  ctx.shadowBlur = 8
  ctx.beginPath()
  ctx.roundRect(seg.x * size + 1, seg.y * size + 1, size - 2, size - 2, 5)
  ctx.fill()
  ctx.shadowBlur = 0
}

// Medium: rounded square with eyes
function drawHeadMedium(ctx, seg, nextSeg, size, settings) {
  const s = size - 2
  const cx = seg.x * size + size / 2
  const cy = seg.y * size + size / 2
  const angle = nextSeg ? getAngle(nextSeg, seg) : 0

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(angle)

  // Head shape
  ctx.fillStyle = settings.snakeColor
  ctx.shadowColor = settings.snakeColor
  ctx.shadowBlur = 10
  ctx.beginPath()
  ctx.roundRect(-s / 2, -s / 2, s, s, 5)
  ctx.fill()
  ctx.shadowBlur = 0

  // Eyes
  const eyeOffX = s * 0.15
  const eyeOffY = s * 0.25
  const eyeR = s * 0.14

  // Whites
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(eyeOffX, -eyeOffY, eyeR, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(eyeOffX, eyeOffY, eyeR, 0, Math.PI * 2)
  ctx.fill()

  // Pupils
  ctx.fillStyle = '#0a192f'
  const pR = eyeR * 0.6
  ctx.beginPath()
  ctx.arc(eyeOffX + pR * 0.4, -eyeOffY, pR, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(eyeOffX + pR * 0.4, eyeOffY, pR, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

// Advanced: eyes + tongue + scale pattern + glow
function drawHeadAdvanced(ctx, seg, nextSeg, size, settings) {
  const s = size - 2
  const cx = seg.x * size + size / 2
  const cy = seg.y * size + size / 2
  const angle = nextSeg ? getAngle(nextSeg, seg) : 0

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(angle)

  // Glow
  ctx.shadowColor = settings.snakeColor
  ctx.shadowBlur = 12

  // Head shape — rounded front
  ctx.fillStyle = settings.snakeColor
  ctx.beginPath()
  ctx.roundRect(-s / 2, -s / 2, s, s, [3, 6, 6, 3])
  ctx.fill()
  ctx.shadowBlur = 0

  // Scale pattern
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
  ctx.beginPath()
  ctx.roundRect(-s / 2 + 1, -s / 2 + 1, s / 2, s - 2, [2, 0, 0, 2])
  ctx.fill()

  // Tongue
  ctx.strokeStyle = '#e74c3c'
  ctx.lineWidth = 1.5
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(s / 2, 0)
  ctx.lineTo(s / 2 + 5, 0)
  ctx.moveTo(s / 2 + 4, 0)
  ctx.lineTo(s / 2 + 7, -2)
  ctx.moveTo(s / 2 + 4, 0)
  ctx.lineTo(s / 2 + 7, 2)
  ctx.stroke()

  // Eyes
  const eyeOffX = s * 0.15
  const eyeOffY = s * 0.25
  const eyeR = s * 0.14

  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(eyeOffX, -eyeOffY, eyeR, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(eyeOffX, eyeOffY, eyeR, 0, Math.PI * 2)
  ctx.fill()

  // Pupils
  ctx.fillStyle = '#0a192f'
  const pR = eyeR * 0.6
  ctx.beginPath()
  ctx.arc(eyeOffX + pR * 0.4, -eyeOffY, pR, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(eyeOffX + pR * 0.4, eyeOffY, pR, 0, Math.PI * 2)
  ctx.fill()

  // Eye shine
  ctx.fillStyle = '#fff'
  const shineR = pR * 0.35
  ctx.beginPath()
  ctx.arc(eyeOffX + pR * 0.5, -eyeOffY - pR * 0.3, shineR, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(eyeOffX + pR * 0.5, eyeOffY - pR * 0.3, shineR, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

// =============================================
// TAIL — Simple / Medium / Advanced
// =============================================
export function drawTail(ctx, seg, prevSeg, total, size, settings) {
  const style = settings.tailStyle || 'advanced'

  if (style === 'simple') return drawTailSimple(ctx, seg, total, size, settings)
  if (style === 'medium') return drawTailMedium(ctx, seg, prevSeg, total, size, settings)
  return drawTailAdvanced(ctx, seg, prevSeg, total, size, settings)
}

// Simple: just a rounded square
function drawTailSimple(ctx, seg, total, size, settings) {
  const color = getBodyColor(total - 1, total, settings.snakeColor, settings.snakeAltColor)
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.roundRect(seg.x * size + 2, seg.y * size + 2, size - 4, size - 4, 4)
  ctx.fill()
}

// Medium: rounded end that connects smoothly
function drawTailMedium(ctx, seg, prevSeg, total, size, settings) {
  const s = size - 2
  const cx = seg.x * size + size / 2
  const cy = seg.y * size + size / 2
  const color = getBodyColor(total - 1, total, settings.snakeColor, settings.snakeAltColor)
  const angle = prevSeg ? getAngle(seg, prevSeg) : 0

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(angle)

  ctx.fillStyle = color
  ctx.beginPath()
  // Rounded at back, square at front (connects to body)
  ctx.roundRect(-s / 2, -s / 2, s, s, [8, 3, 3, 8])
  ctx.fill()

  ctx.restore()
}

// Advanced: tapered smooth shape
function drawTailAdvanced(ctx, seg, prevSeg, total, size, settings) {
  const s = size - 2
  const cx = seg.x * size + size / 2
  const cy = seg.y * size + size / 2
  const color = getBodyColor(total - 1, total, settings.snakeColor, settings.snakeAltColor)
  const angle = prevSeg ? getAngle(seg, prevSeg) : 0

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(angle)

  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(-s / 2 - 2, 0)
  ctx.quadraticCurveTo(-s / 4, -s / 2.5, s / 3, -s / 2)
  ctx.lineTo(s / 2, -s / 2)
  ctx.lineTo(s / 2, s / 2)
  ctx.lineTo(s / 3, s / 2)
  ctx.quadraticCurveTo(-s / 4, s / 2.5, -s / 2 - 2, 0)
  ctx.fill()

  // Highlight stripe
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.beginPath()
  ctx.moveTo(-s / 4, 0)
  ctx.quadraticCurveTo(0, -s / 4, s / 3, -s / 3)
  ctx.lineTo(s / 3, -s / 6)
  ctx.quadraticCurveTo(0, -s / 6, -s / 4, 0)
  ctx.fill()

  ctx.restore()
}

// =============================================
// BOARD (background + grid)
// =============================================
export function drawBoard(ctx, gridSize, cellSize, settings) {
  ctx.fillStyle = settings.boardBg
  ctx.fillRect(0, 0, gridSize * cellSize, gridSize * cellSize)

  ctx.strokeStyle = settings.boardGrid
  ctx.lineWidth = 0.5
  for (let i = 0; i <= gridSize; i++) {
    ctx.beginPath()
    ctx.moveTo(i * cellSize, 0)
    ctx.lineTo(i * cellSize, gridSize * cellSize)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, i * cellSize)
    ctx.lineTo(gridSize * cellSize, i * cellSize)
    ctx.stroke()
  }
}
