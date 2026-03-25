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
// APPLE
// =============================================
export function drawApple(ctx, x, y, size) {
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
