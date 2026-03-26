// =============================================
// Snake Input Handler — keyboard direction queue
// =============================================

const KEY_MAP = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 }, W: { x: 0, y: -1 },
  s: { x: 0, y: 1 }, S: { x: 0, y: 1 },
  a: { x: -1, y: 0 }, A: { x: -1, y: 0 },
  d: { x: 1, y: 0 }, D: { x: 1, y: 0 },
}

/**
 * Create a keydown handler for the snake game.
 * @param {object} refs - { dirRef, dirQueueRef }
 * @param {object} callbacks - { onStart }
 * @returns {function} keydown event handler
 */
export function createKeyHandler(refs, callbacks) {
  return (e) => {
    // Don't capture when typing in form fields
    const tag = e.target.tagName.toLowerCase()
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return

    const dir = KEY_MAP[e.key]
    if (!dir) return
    e.preventDefault()

    const queue = refs.dirQueueRef.current
    if (queue.length >= 2) return

    const lastDir = queue.length > 0 ? queue[queue.length - 1] : refs.dirRef.current
    const isReverse = dir.x + lastDir.x === 0 && dir.y + lastDir.y === 0
    const isSame = dir.x === lastDir.x && dir.y === lastDir.y

    if (!isReverse && !isSame) {
      queue.push(dir)
    }

    if (callbacks.onStart) callbacks.onStart()
  }
}

/**
 * Dequeue one direction from the queue and apply it.
 * @param {object} dirRef - current direction ref
 * @param {object} dirQueueRef - direction queue ref
 * @returns {object} current direction after dequeue
 */
export function dequeueDirection(dirRef, dirQueueRef) {
  const queue = dirQueueRef.current
  if (queue.length > 0) {
    dirRef.current = queue.shift()
  }
  return dirRef.current
}
