'use client'

import React, { useEffect, useRef } from 'react'

export const ParticleGalaxy = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width: number, height: number
    let animationFrameId: number

    const config = {
      particleCount: 1500,     // Total number of particles
      baseRadius: 1.5,        // Base size of particles
      depth: 1000,            // Simulated 3D depth
      rotationSpeed: 0.002,   // Speed of the galaxy rotation
      color: '255, 255, 255'  // White particles (opacity for depth)
    }

    const resize = () => {
      // Use parent element dimensions instead of window to fit the section
      const parent = canvas.parentElement
      if (parent) {
        width = canvas.width = parent.clientWidth
        height = canvas.height = parent.clientHeight
      } else {
        width = canvas.width = window.innerWidth
        height = canvas.height = window.innerHeight
      }
    }

    window.addEventListener('resize', resize)
    resize()

    class Particle {
      x3d: number
      y3d: number
      z3d: number
      size: number
      isGlowing: boolean
      x: number = 0
      y: number = 0
      currentSize: number = 0
      alpha: number = 0
      tempZ: number = 0

      constructor() {
        const theta = Math.random() * Math.PI * 2
        const distance = Math.pow(Math.random(), 0.5) * (width / 2 * 1.5)
        const yOffset = (Math.random() - 0.5) * 150 * (1 - (distance / (width / 2)))

        this.x3d = Math.cos(theta) * distance
        this.y3d = yOffset
        this.z3d = Math.sin(theta) * distance
        this.size = Math.random() * config.baseRadius + 0.5
        this.isGlowing = Math.random() > 0.8
      }

      update(rotationAngle: number) {
        const cosA = Math.cos(rotationAngle)
        const sinA = Math.sin(rotationAngle)

        const rotatedX = this.x3d * cosA - this.z3d * sinA
        const rotatedZ = this.z3d * cosA + this.x3d * sinA

        const scale = config.depth / (config.depth + rotatedZ)
        
        this.x = (width / 2) + (rotatedX * scale)
        this.y = (height / 2) + (this.y3d * scale) + (rotatedZ * scale * 0.2) 
        
        this.currentSize = this.size * scale
        
        let alpha = scale * 0.8 
        if (rotatedZ > 300) alpha *= 0.5 
        if (rotatedZ < -300) alpha *= 0.5 
        
        this.alpha = Math.max(0.1, Math.min(1, alpha))
      }

      draw() {
        if (this.currentSize < 0.1 || this.alpha < 0.05) return

        if (!ctx) return
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.currentSize, 0, Math.PI * 2)
        
        if (this.isGlowing) {
          ctx.fillStyle = `rgba(${config.color}, ${this.alpha})`
          ctx.shadowBlur = this.currentSize * 4
          ctx.shadowColor = `rgba(${config.color}, ${this.alpha})`
        } else {
          ctx.fillStyle = `rgba(${config.color}, ${this.alpha * 0.7})`
          ctx.shadowBlur = 0
        }
        
        ctx.fill()
      }
    }

    const particles: Particle[] = []
    for (let i = 0; i < config.particleCount; i++) {
      particles.push(new Particle())
    }

    let angle = 0

    const animate = () => {
      if (!ctx) return
      ctx.clearRect(0, 0, width, height)
      angle += config.rotationSpeed

      particles.forEach(p => {
        p.tempZ = p.z3d * Math.cos(angle) + p.x3d * Math.sin(angle)
      })
      
      particles.sort((a, b) => b.tempZ - a.tempZ)

      particles.forEach(p => {
        p.update(angle)
        p.draw()
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="absolute inset-0 w-full h-full bg-[#111] z-0 overflow-hidden">
      {/* Optional: Radial gradient overlay for depth as in the original file */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none" 
        style={{ background: 'radial-gradient(circle at center, transparent 0%, #111 80%)' }}
      ></div>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-0"
      />
    </div>
  )
}
