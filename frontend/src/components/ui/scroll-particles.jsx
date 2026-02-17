import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Plus, Heart, Star } from "lucide-react";

export function ScrollParticles() {
    const { scrollY } = useScroll();
    const [particles, setParticles] = useState([]);
    const [windowHeight, setWindowHeight] = useState(0);
    const lastY = useRef(0);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setWindowHeight(window.innerHeight);
            const handleResize = () => setWindowHeight(window.innerHeight);
            window.addEventListener("resize", handleResize);
            return () => window.removeEventListener("resize", handleResize);
        }
    }, []);

    useMotionValueEvent(scrollY, "change", (latest) => {
        const diff = Math.abs(latest - lastY.current);
        const direction = latest > lastY.current ? 1 : -1;

        // Spawn particles if scrolling fast enough
        if (diff > 5 && windowHeight > 0) {
            const scrollHeight = document.documentElement.scrollHeight - windowHeight;
            const progress = latest / scrollHeight;

            // Calculate approximate scrollbar thumb position (center of thumb)
            const thumbY = progress * (windowHeight - 40);

            const shapes = ["plus", "heart", "star"];
            const randomShape = shapes[Math.floor(Math.random() * shapes.length)];

            const newParticle = {
                id: Date.now() + Math.random(),
                top: thumbY + (Math.random() * 40 - 20), // Wider spread
                left: -Math.random() * 20 - 10,
                size: Math.random() * 14 + 10, // Larger size: 10px - 24px
                color: Math.random() > 0.5 ? "#191970" : "#4C6EF5",
                shape: randomShape,
                rotation: Math.random() * 360,
                velocity: {
                    x: -Math.random() * 30 - 20, // Faster drift left
                    y: (Math.random() * 30 - 15) + (direction * 8)
                }
            };

            setParticles(prev => [...prev.slice(-20), newParticle]);
        }

        lastY.current = latest;
    });

    return (
        <div className="fixed top-0 right-0 w-4 h-full pointer-events-none z-[9999]">
            <AnimatePresence>
                {particles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        initial={{
                            opacity: 1,
                            x: 0,
                            y: particle.top,
                            scale: 0,
                            rotate: particle.rotation
                        }}
                        animate={{
                            opacity: 0,
                            x: particle.velocity.x,
                            y: particle.top + particle.velocity.y,
                            scale: 1,
                            rotate: particle.rotation + 180
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute right-1 flex items-center justify-center"
                        style={{
                            width: particle.size,
                            height: particle.size,
                            color: particle.color,
                        }}
                    >
                        {particle.shape === "plus" && <Plus size={particle.size} strokeWidth={3} />}
                        {particle.shape === "heart" && <Heart size={particle.size} fill={particle.color} strokeWidth={0} />}
                        {particle.shape === "star" && <Star size={particle.size} fill={particle.color} strokeWidth={0} />}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
