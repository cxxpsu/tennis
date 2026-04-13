import { useEffect, useRef, useCallback } from 'react'
import './RacquetVisualizer.css'

const RacquetVisualizer = ({ mainStringColor, crossStringColor, frameColor }) => {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)

  const drawRacquet = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')

    // Responsive canvas size: fit container width, maintain aspect ratio
    const dpr = window.devicePixelRatio || 1
    const containerWidth = container.clientWidth
    const width = Math.min(500, containerWidth)
    const height = width * 1.4

    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Racquet dimensions scale proportionally to canvas size
    const scale = width / 500
    const centerX = width / 2
    const centerY = 255 * scale
    const headWidth = 230 * scale
    const headHeight = 310 * scale
    const frameThickness = 20 * scale
    const throatDepth = 65 * scale

    // Draw shadow
    drawShadow(ctx, centerX, centerY, headWidth, headHeight, throatDepth)

    // Draw back frame layer
    drawRacquetFrame(ctx, centerX, centerY, headWidth, headHeight, frameThickness, throatDepth, frameColor, true)

    // Draw throat bridge (back layer)
    drawThroatBridge(ctx, centerX, centerY, headWidth, headHeight, frameThickness, throatDepth, frameColor, true)

    // Draw string bed
    drawStringBed(ctx, centerX, centerY, headWidth, headHeight, frameThickness, throatDepth, mainStringColor, crossStringColor)

    // Draw front frame layer
    drawRacquetFrame(ctx, centerX, centerY, headWidth, headHeight, frameThickness, throatDepth, frameColor, false)

    // Draw throat bridge (front layer)
    drawThroatBridge(ctx, centerX, centerY, headWidth, headHeight, frameThickness, throatDepth, frameColor, false)

    // Draw handle
    drawHandle(ctx, centerX, centerY, headHeight, throatDepth)

  }, [mainStringColor, crossStringColor, frameColor])

  useEffect(() => {
    drawRacquet()

    const handleResize = () => drawRacquet()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [drawRacquet])

  return (
    <div className="racquet-visualizer" ref={containerRef}>
      <canvas
        ref={canvasRef}
        className="racquet-canvas"
        role="img"
        aria-label={`Tennis racquet with ${frameColor} frame, ${mainStringColor} main strings, and ${crossStringColor} cross strings`}
      />
    </div>
  )
}

// Generate the egg-shaped head path (wider at top, narrower at bottom)
// Uses 2 bezier segments per side. Key: lower control points stay wide
// to maintain roundness, only curving in near the very bottom.
function getHeadShapePath(cx, cy, w, h) {
  const path = new Path2D()
  const topW = w / 2         // half-width at widest (upper) point
  const bottomW = w * 0.40   // half-width at bottom (narrower)

  // Start at the top center
  path.moveTo(cx, cy - h / 2)

  // Right upper: top center to widest point
  path.bezierCurveTo(
    cx + topW * 1.12, cy - h / 2,
    cx + topW * 1.05, cy - h * 0.1,
    cx + topW, cy + h * 0.02
  )
  // Right lower: widest point to bottom-right — control points pushed
  // lower than before so the curve stays round, but x values stay < topW
  path.bezierCurveTo(
    cx + topW * 0.92, cy + h * 0.28,
    cx + bottomW * 1.3, cy + h * 0.44,
    cx + bottomW, cy + h * 0.48
  )

  // Bottom curve
  path.bezierCurveTo(
    cx + bottomW * 0.55, cy + h * 0.54,
    cx - bottomW * 0.55, cy + h * 0.54,
    cx - bottomW, cy + h * 0.48
  )

  // Left lower: bottom-left up to widest point
  path.bezierCurveTo(
    cx - bottomW * 1.3, cy + h * 0.44,
    cx - topW * 0.92, cy + h * 0.28,
    cx - topW, cy + h * 0.02
  )
  // Left upper: widest point to top center
  path.bezierCurveTo(
    cx - topW * 1.05, cy - h * 0.1,
    cx - topW * 1.12, cy - h / 2,
    cx, cy - h / 2
  )

  path.closePath()
  return path
}

// Get inner head shape (for the string bed opening)
function getInnerHeadShapePath(cx, cy, w, h, thickness) {
  const innerW = w - thickness * 2
  const innerH = h - thickness * 2
  const topW = innerW / 2
  const bottomW = innerW * 0.40

  const path = new Path2D()
  path.moveTo(cx, cy - innerH / 2)

  // Right upper
  path.bezierCurveTo(
    cx + topW * 1.12, cy - innerH / 2,
    cx + topW * 1.05, cy - innerH * 0.1,
    cx + topW, cy + innerH * 0.02
  )
  // Right lower
  path.bezierCurveTo(
    cx + topW * 0.92, cy + innerH * 0.28,
    cx + bottomW * 1.3, cy + innerH * 0.44,
    cx + bottomW, cy + innerH * 0.48
  )

  // Bottom curve
  path.bezierCurveTo(
    cx + bottomW * 0.55, cy + innerH * 0.54,
    cx - bottomW * 0.55, cy + innerH * 0.54,
    cx - bottomW, cy + innerH * 0.48
  )

  // Left lower
  path.bezierCurveTo(
    cx - bottomW * 1.3, cy + innerH * 0.44,
    cx - topW * 0.92, cy + innerH * 0.28,
    cx - topW, cy + innerH * 0.02
  )
  // Left upper
  path.bezierCurveTo(
    cx - topW * 1.05, cy - innerH * 0.1,
    cx - topW * 1.12, cy - innerH / 2,
    cx, cy - innerH / 2
  )

  path.closePath()
  return path
}

// Draw shadow for the entire racquet
function drawShadow(ctx, cx, cy, headWidth, headHeight, throatDepth) {
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
  ctx.shadowBlur = 40
  ctx.shadowOffsetX = 12
  ctx.shadowOffsetY = 15

  // Head shadow
  const headPath = getHeadShapePath(cx, cy, headWidth, headHeight)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
  ctx.fill(headPath)

  // Throat + handle shadow (approximate as rectangle)
  const handleTop = cy + headHeight / 2 - 10
  ctx.fillRect(cx - 30, handleTop, 60, 160)

  ctx.restore()
}

// Draw the racquet frame head
function drawRacquetFrame(ctx, cx, cy, width, height, thickness, throatDepth, frameColor, isBack) {
  const outerPath = getHeadShapePath(cx, cy, width, height)
  const innerPath = getInnerHeadShapePath(cx, cy, width, height, thickness)

  const lightColor = shadeColor(frameColor, 30)
  const darkColor = shadeColor(frameColor, -40)
  const darkerBackColor = shadeColor(frameColor, -60)

  if (isBack) {
    // Back layer: fill outer shape dark, then inner shape with string bg
    ctx.fillStyle = darkerBackColor
    ctx.fill(outerPath)

    // Gradient for depth
    const gradient = ctx.createRadialGradient(
      cx - width * 0.15, cy - height * 0.15, 0,
      cx, cy, width / 2
    )
    gradient.addColorStop(0, shadeColor(frameColor, 10))
    gradient.addColorStop(0.7, darkerBackColor)
    gradient.addColorStop(1, shadeColor(frameColor, -70))
    ctx.fillStyle = gradient
    ctx.fill(outerPath)

    // Inner string bed background
    ctx.fillStyle = '#1a1a1a'
    ctx.fill(innerPath)
  } else {
    // Front layer: draw only the frame ring using evenodd fill
    ctx.save()

    // Create a combined path: outer + inner = frame ring via evenodd
    const ringPath = new Path2D()
    ringPath.addPath(outerPath)
    ringPath.addPath(innerPath)

    // Fill with gradient using evenodd (fills only the ring between outer and inner)
    const gradient = ctx.createRadialGradient(
      cx - width * 0.15, cy - height * 0.15, 0,
      cx, cy, width / 2
    )
    gradient.addColorStop(0, lightColor)
    gradient.addColorStop(0.7, frameColor)
    gradient.addColorStop(1, darkColor)

    ctx.fillStyle = gradient
    ctx.fill(ringPath, 'evenodd')

    // Metallic sheen highlight
    const highlightGradient = ctx.createLinearGradient(
      cx - width / 2, cy - height / 2,
      cx + width / 2, cy + height / 2
    )
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.25)')
    highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)')
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)')
    ctx.fillStyle = highlightGradient
    ctx.fill(ringPath, 'evenodd')

    // Frame edge highlight (inner edge)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
    ctx.lineWidth = 1
    ctx.stroke(innerPath)

    ctx.restore()
  }
}

// Draw the throat bridge (Y-shape connecting head to handle)
function drawThroatBridge(ctx, cx, cy, frameWidth, headHeight, frameThickness, throatDepth, frameColor, isBack) {
  const innerW = frameWidth - frameThickness * 2
  const bottomHalfW = innerW * 0.38  // matches the bottom width of inner head shape
  const throatTopY = cy + headHeight / 2 - throatDepth * 0.2
  const throatBottomY = cy + headHeight / 2 + 15
  const shaftWidth = 22

  const baseColor = isBack ? shadeColor(frameColor, -50) : frameColor
  const lightColor = shadeColor(frameColor, isBack ? -20 : 30)
  const darkColor = shadeColor(frameColor, isBack ? -70 : -40)

  ctx.save()

  // Left bridge arm
  ctx.beginPath()
  ctx.moveTo(cx - bottomHalfW, throatTopY)
  ctx.bezierCurveTo(
    cx - bottomHalfW - 3, throatTopY + throatDepth * 0.3,
    cx - bottomHalfW * 0.7, throatTopY + throatDepth * 0.5,
    cx - shaftWidth / 2, throatBottomY
  )
  ctx.lineTo(cx - shaftWidth / 2 - 5, throatBottomY)
  ctx.bezierCurveTo(
    cx - bottomHalfW * 0.8, throatTopY + throatDepth * 0.45,
    cx - bottomHalfW - 10, throatTopY + throatDepth * 0.2,
    cx - bottomHalfW - 6, throatTopY
  )
  ctx.closePath()

  const leftGrad = ctx.createLinearGradient(cx - bottomHalfW, throatTopY, cx - shaftWidth / 2, throatBottomY)
  leftGrad.addColorStop(0, lightColor)
  leftGrad.addColorStop(0.5, baseColor)
  leftGrad.addColorStop(1, darkColor)
  ctx.fillStyle = leftGrad
  ctx.fill()

  // Right bridge arm
  ctx.beginPath()
  ctx.moveTo(cx + bottomHalfW, throatTopY)
  ctx.bezierCurveTo(
    cx + bottomHalfW + 3, throatTopY + throatDepth * 0.3,
    cx + bottomHalfW * 0.7, throatTopY + throatDepth * 0.5,
    cx + shaftWidth / 2, throatBottomY
  )
  ctx.lineTo(cx + shaftWidth / 2 + 5, throatBottomY)
  ctx.bezierCurveTo(
    cx + bottomHalfW * 0.8, throatTopY + throatDepth * 0.45,
    cx + bottomHalfW + 10, throatTopY + throatDepth * 0.2,
    cx + bottomHalfW + 6, throatTopY
  )
  ctx.closePath()

  const rightGrad = ctx.createLinearGradient(cx + bottomHalfW, throatTopY, cx + shaftWidth / 2, throatBottomY)
  rightGrad.addColorStop(0, lightColor)
  rightGrad.addColorStop(0.5, baseColor)
  rightGrad.addColorStop(1, darkColor)
  ctx.fillStyle = rightGrad
  ctx.fill()

  // Highlight on bridge arms (front layer only)
  if (!isBack) {
    ctx.beginPath()
    ctx.moveTo(cx - bottomHalfW - 3, throatTopY + 3)
    ctx.bezierCurveTo(
      cx - bottomHalfW - 6, throatTopY + throatDepth * 0.25,
      cx - bottomHalfW * 0.7, throatTopY + throatDepth * 0.45,
      cx - shaftWidth / 2 + 1, throatBottomY - 3
    )
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(cx + bottomHalfW + 3, throatTopY + 3)
    ctx.bezierCurveTo(
      cx + bottomHalfW + 6, throatTopY + throatDepth * 0.25,
      cx + bottomHalfW * 0.7, throatTopY + throatDepth * 0.45,
      cx + shaftWidth / 2 - 1, throatBottomY - 3
    )
    ctx.stroke()
  }

  ctx.restore()
}

// Draw strings within the string bed
function drawStringBed(ctx, cx, cy, headWidth, headHeight, frameThickness, throatDepth, mainColor, crossColor) {
  const innerPath = getInnerHeadShapePath(cx, cy, headWidth, headHeight, frameThickness)

  // Clip strings to the inner head shape
  ctx.save()
  ctx.clip(innerPath)

  // String bed dimensions
  const innerW = headWidth - frameThickness * 2
  const innerH = headHeight - frameThickness * 2
  const stringBedTop = cy - innerH / 2
  const stringBedHeight = innerH

  // Draw cross strings (back layer - under main strings)
  drawCrossStrings(ctx, cx, stringBedTop, innerW, stringBedHeight, crossColor, true)

  // Draw main strings (vertical)
  drawMainStrings(ctx, cx, stringBedTop, innerW, stringBedHeight, mainColor)

  // Draw cross strings (front layer - over main strings)
  drawCrossStrings(ctx, cx, stringBedTop, innerW, stringBedHeight, crossColor, false)

  ctx.restore()
}

// Draw main strings (vertical)
function drawMainStrings(ctx, cx, top, width, height, color) {
  const stringCount = 16
  const startX = cx - width / 2
  const spacing = width / (stringCount - 1)
  const stringThickness = 2.5

  for (let i = 0; i < stringCount; i++) {
    const x = startX + i * spacing

    const gradient = ctx.createLinearGradient(x, top, x + stringThickness, top)
    gradient.addColorStop(0, shadeColor(color, -30))
    gradient.addColorStop(0.3, color)
    gradient.addColorStop(0.7, color)
    gradient.addColorStop(1, shadeColor(color, -30))

    ctx.beginPath()
    ctx.moveTo(x, top)
    ctx.lineTo(x, top + height)
    ctx.strokeStyle = gradient
    ctx.lineWidth = stringThickness
    ctx.lineCap = 'round'
    ctx.stroke()

    // Highlight
    ctx.beginPath()
    ctx.moveTo(x - 0.5, top)
    ctx.lineTo(x - 0.5, top + height)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 0.5
    ctx.stroke()
  }
}

// Draw cross strings (horizontal) with weaving effect
function drawCrossStrings(ctx, cx, top, width, height, color, isBack) {
  const stringCount = 19
  const spacing = height / (stringCount - 1)
  const stringThickness = 2.5
  const mainStringSpacing = width / 15

  for (let i = 0; i < stringCount; i++) {
    const y = top + i * spacing
    const startX = cx - width / 2

    if (isBack) {
      // Back segments (cross strings under main strings)
      for (let j = 0; j <= 15; j++) {
        const segmentStart = startX + j * mainStringSpacing
        const segmentWidth = mainStringSpacing / 2
        const offset = (j % 2 === 0) ? 0 : segmentWidth

        ctx.beginPath()
        ctx.moveTo(segmentStart + offset, y)
        ctx.lineTo(segmentStart + offset + segmentWidth, y)
        ctx.strokeStyle = shadeColor(color, -40)
        ctx.lineWidth = stringThickness
        ctx.lineCap = 'round'
        ctx.stroke()
      }
    } else {
      // Front segments (cross strings over main strings)
      for (let j = 0; j <= 15; j++) {
        const segmentStart = startX + j * mainStringSpacing
        const segmentWidth = mainStringSpacing / 2
        const offset = (j % 2 === 0) ? segmentWidth : 0

        const gradient = ctx.createLinearGradient(segmentStart + offset, y, segmentStart + offset, y + stringThickness)
        gradient.addColorStop(0, shadeColor(color, -30))
        gradient.addColorStop(0.5, color)
        gradient.addColorStop(1, shadeColor(color, -30))

        ctx.beginPath()
        ctx.moveTo(segmentStart + offset, y)
        ctx.lineTo(segmentStart + offset + segmentWidth, y)
        ctx.strokeStyle = gradient
        ctx.lineWidth = stringThickness
        ctx.lineCap = 'round'
        ctx.stroke()

        // Highlight
        ctx.beginPath()
        ctx.moveTo(segmentStart + offset, y - 0.5)
        ctx.lineTo(segmentStart + offset + segmentWidth, y - 0.5)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.lineWidth = 0.5
        ctx.stroke()
      }
    }
  }
}

// Draw handle with tapered octagonal shape and realistic grip
function drawHandle(ctx, cx, cy, headHeight, throatDepth) {
  const shaftTop = cy + headHeight / 2 + 15
  const shaftWidth = 22
  const shaftLength = 20

  const handleTop = shaftTop + shaftLength
  const handleTopWidth = 28
  const handleBottomWidth = 32
  const handleLength = 130
  const buttcapHeight = 20

  ctx.save()

  // Shaft (connects throat bridge to handle)
  const shaftGrad = ctx.createLinearGradient(cx - shaftWidth / 2, shaftTop, cx + shaftWidth / 2, shaftTop)
  shaftGrad.addColorStop(0, '#1a1a1a')
  shaftGrad.addColorStop(0.3, '#333333')
  shaftGrad.addColorStop(0.7, '#333333')
  shaftGrad.addColorStop(1, '#1a1a1a')

  ctx.fillStyle = shaftGrad
  ctx.beginPath()
  ctx.moveTo(cx - shaftWidth / 2, shaftTop)
  ctx.lineTo(cx + shaftWidth / 2, shaftTop)
  ctx.lineTo(cx + handleTopWidth / 2, handleTop)
  ctx.lineTo(cx - handleTopWidth / 2, handleTop)
  ctx.closePath()
  ctx.fill()

  // Handle shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)'
  ctx.shadowBlur = 10
  ctx.shadowOffsetX = 5
  ctx.shadowOffsetY = 5

  // Main handle - tapered shape
  const handleGrad = ctx.createLinearGradient(
    cx - handleBottomWidth / 2, handleTop,
    cx + handleBottomWidth / 2, handleTop
  )
  handleGrad.addColorStop(0, '#1e100a')
  handleGrad.addColorStop(0.15, '#3d2013')
  handleGrad.addColorStop(0.4, '#5a3420')
  handleGrad.addColorStop(0.6, '#5a3420')
  handleGrad.addColorStop(0.85, '#3d2013')
  handleGrad.addColorStop(1, '#1e100a')

  ctx.fillStyle = handleGrad
  ctx.beginPath()
  ctx.moveTo(cx - handleTopWidth / 2, handleTop)
  ctx.lineTo(cx + handleTopWidth / 2, handleTop)
  ctx.lineTo(cx + handleBottomWidth / 2, handleTop + handleLength)
  ctx.lineTo(cx - handleBottomWidth / 2, handleTop + handleLength)
  ctx.closePath()
  ctx.fill()

  ctx.shadowColor = 'transparent'

  // Grip wrap pattern - diagonal lines
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)'
  ctx.lineWidth = 1.5
  const gripSpacing = 6
  for (let i = -handleLength; i < handleLength + handleBottomWidth; i += gripSpacing) {
    ctx.beginPath()
    const y1 = handleTop + i
    const y2 = y1 + handleBottomWidth
    if (y1 < handleTop && y2 < handleTop) continue
    if (y1 > handleTop + handleLength) continue

    // Calculate width at this y position (tapered)
    const clampY1 = Math.max(handleTop, y1)
    const clampY2 = Math.min(handleTop + handleLength, y2)
    const t1 = (clampY1 - handleTop) / handleLength
    const t2 = (clampY2 - handleTop) / handleLength
    const w1 = handleTopWidth + (handleBottomWidth - handleTopWidth) * t1
    const w2 = handleTopWidth + (handleBottomWidth - handleTopWidth) * t2

    ctx.moveTo(cx - w1 / 2, clampY1)
    ctx.lineTo(cx + w2 / 2, clampY2)
    ctx.stroke()
  }

  // Grip edge highlight
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cx - handleTopWidth / 2 + 1, handleTop)
  ctx.lineTo(cx - handleBottomWidth / 2 + 1, handleTop + handleLength)
  ctx.stroke()

  // Buttcap
  const buttcapGrad = ctx.createLinearGradient(
    cx, handleTop + handleLength,
    cx, handleTop + handleLength + buttcapHeight
  )
  buttcapGrad.addColorStop(0, '#1a1a1a')
  buttcapGrad.addColorStop(0.5, '#2a2a2a')
  buttcapGrad.addColorStop(1, '#111111')

  ctx.fillStyle = buttcapGrad
  ctx.beginPath()
  ctx.moveTo(cx - handleBottomWidth / 2 - 2, handleTop + handleLength)
  ctx.lineTo(cx + handleBottomWidth / 2 + 2, handleTop + handleLength)
  ctx.lineTo(cx + handleBottomWidth / 2 + 4, handleTop + handleLength + buttcapHeight)
  ctx.quadraticCurveTo(cx, handleTop + handleLength + buttcapHeight + 6, cx - handleBottomWidth / 2 - 4, handleTop + handleLength + buttcapHeight)
  ctx.closePath()
  ctx.fill()

  // Buttcap edge
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 1
  ctx.stroke()

  // Buttcap highlight line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cx - handleBottomWidth / 2, handleTop + handleLength + 2)
  ctx.lineTo(cx + handleBottomWidth / 2, handleTop + handleLength + 2)
  ctx.stroke()

  ctx.restore()
}

// Utility function to shade colors
function shadeColor(color, percent) {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = (num >> 8 & 0x00FF) + amt
  const B = (num & 0x0000FF) + amt
  return '#' + (0x1000000 +
    (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)
  ).toString(16).slice(1)
}

export default RacquetVisualizer
