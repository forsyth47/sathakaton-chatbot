"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  color: string
}

export default function SplashScreen() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = useState(true)

  // Animation to slide up after loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
      setTimeout(() => {
        router.push("/login")
      }, 1000) // Wait for exit animation to complete
    }, 3000) // Show splash screen for 3 seconds

    return () => clearTimeout(timer)
  }, [router])

  // Particle animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Create particles
    const particles: Particle[] = []
    const colors = ["#3498db", "#9b59b6", "#1abc9c", "#f39c12", "#e74c3c"]

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 5 + 1,
        speedX: (Math.random() - 0.5) * 2,
        speedY: (Math.random() - 0.5) * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particles.forEach((particle) => {
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Bounce off edges
        if (particle.x > canvas.width || particle.x < 0) {
          particle.speedX = -particle.speedX
        }

        if (particle.y > canvas.height || particle.y < 0) {
          particle.speedY = -particle.speedY
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    const animationId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-gray-900 to-black z-50 flex items-center justify-center"
      initial={{ y: 0 }}
      animate={{ y: loading ? 0 : "-100%" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="relative z-10 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">GlitchNet'25</h1>
          <p className="text-gray-300 text-lg">Enpowering Under Privileged Students</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center"
        >
          <div className="w-12 h-12 relative">
            <div className="absolute top-0 w-full h-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
