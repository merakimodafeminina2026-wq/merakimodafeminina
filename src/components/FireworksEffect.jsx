import { useEffect, useRef } from 'react'

export default function FireworksEffect({ duration = 5000 }) {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        let animationFrameId
        let startTime = Date.now()

        const resizeCanvas = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        resizeCanvas()
        window.addEventListener('resize', resizeCanvas)

        const colors = [
            '#7A3E4A', '#C6A76A', '#D11A6E', '#FFD700', 
            '#34D399', '#60A5FA', '#F472B6', '#A78BFA'
        ]

        class Particle {
            constructor(x, y, color) {
                this.x = x
                this.y = y
                this.color = color
                const angle = Math.random() * Math.PI * 2
                const speed = Math.random() * 8 + 2
                this.vx = Math.cos(angle) * speed
                this.vy = Math.sin(angle) * speed
                this.alpha = 1
                this.decay = Math.random() * 0.015 + 0.01
                this.gravity = 0.12
                this.size = Math.random() * 4 + 2
                this.shape = Math.random() > 0.5 ? 'circle' : 'square'
                this.rotation = Math.random() * 360
                this.rotSpeed = Math.random() * 10 - 5
            }

            update() {
                this.x += this.vx
                this.y += this.vy
                this.vy += this.gravity
                this.vx *= 0.98
                this.vy *= 0.98
                this.alpha -= this.decay
                this.rotation += this.rotSpeed
            }

            draw(ctx) {
                ctx.save()
                ctx.globalAlpha = Math.max(0, this.alpha)
                ctx.translate(this.x, this.y)
                ctx.rotate((this.rotation * Math.PI) / 180)
                ctx.fillStyle = this.color

                if (this.shape === 'circle') {
                    ctx.beginPath()
                    ctx.arc(0, 0, this.size, 0, Math.PI * 2)
                    ctx.fill()
                } else {
                    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size)
                }
                ctx.restore()
            }
        }

        let particles = []

        const createFirework = (x, y) => {
            const count = 60
            const color = colors[Math.floor(Math.random() * colors.length)]
            for (let i = 0; i < count; i++) {
                particles.push(new Particle(x, y, color))
            }
        }

        // Initial fireworks burst array
        const launchInterval = setInterval(() => {
            if (Date.now() - startTime < duration) {
                const randomX = Math.random() * canvas.width
                const randomY = Math.random() * (canvas.height * 0.5) + (canvas.height * 0.1)
                createFirework(randomX, randomY)
            } else {
                clearInterval(launchInterval)
            }
        }, 350)

        // Immediate bursts on start
        createFirework(canvas.width * 0.3, canvas.height * 0.3)
        createFirework(canvas.width * 0.7, canvas.height * 0.3)

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            particles.forEach((p, index) => {
                p.update()
                p.draw(ctx)
                if (p.alpha <= 0) {
                    particles.splice(index, 1)
                }
            })

            if (particles.length > 0 || Date.now() - startTime < duration) {
                animationFrameId = requestAnimationFrame(render)
            }
        }

        render()

        return () => {
            clearInterval(launchInterval)
            cancelAnimationFrame(animationFrameId)
            window.removeEventListener('resize', resizeCanvas)
        }
    }, [duration])

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[9999]"
        />
    )
}
