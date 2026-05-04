"use client";

import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { ArrowRight, Shield, Heart, Lock, Scale, Phone } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { useInView, motion, AnimatePresence } from "framer-motion";

export default function AboutSection() {
    const heroRef = useRef(null);
    const counterRef = useRef(null);
    const isCounterInView = useInView(counterRef, { once: true });
    const [count, setCount] = useState(0);

    // Carousel state
    const heroImages = ["/Gambar1.jpg", "/Gambar2.jpeg", "/Gambar3.jpeg"];
    const [slideIndex, setSlideIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const SLIDE_DURATION = 5000; // 5 seconds

    useEffect(() => {
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) return 0;
                return prev + (100 / (SLIDE_DURATION / 50));
            });
        }, 50);
        const slideTimer = setInterval(() => {
            setSlideIndex((prev) => (prev + 1) % heroImages.length);
            setProgress(0);
        }, SLIDE_DURATION);
        return () => {
            clearInterval(progressInterval);
            clearInterval(slideTimer);
        };
    }, []);

    useEffect(() => {
        if (!isCounterInView) return;
        let start = 0;
        const end = 100;
        const duration = 2000;
        const stepTime = duration / end;
        const timer = setInterval(() => {
            start += 1;
            setCount(start);
            if (start >= end) clearInterval(timer);
        }, stepTime);
        return () => clearInterval(timer);
    }, [isCounterInView]);

    const revealVariants = {
        visible: (i) => ({
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            transition: {
                delay: i * 0.15,
                duration: 0.3,
            },
        }),
        hidden: {
            filter: "blur(10px)",
            y: -20,
            opacity: 0,
        },
    };

    const scaleVariants = {
        visible: (i) => ({
            opacity: 1,
            filter: "blur(0px)",
            transition: {
                delay: i * 0.15,
                duration: 0.3,
            },
        }),
        hidden: {
            filter: "blur(10px)",
            opacity: 0,
        },
    };

    return (
        <section className="min-h-screen py-16 bg-[#f9f9f9] dark:bg-slate-950 flex items-center transition-colors duration-300" ref={heroRef} id="about">
            <div className="max-w-[90rem] mx-auto w-full px-8 lg:px-12">
                <div className="relative">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8 w-[85%] absolute lg:top-4 md:top-0 sm:-top-2 -top-3 z-10">
                        <div className="flex items-center gap-2 text-xl">
                            <span className="text-[#191970] dark:text-indigo-400 animate-spin">✱</span>
                            <TimelineContent
                                as="span"
                                animationNum={0}
                                timelineRef={heroRef}
                                customVariants={revealVariants}
                                className="text-sm font-medium text-gray-600"
                            >
                                TENTANG KAMI
                            </TimelineContent>
                        </div>
                        <div className="flex gap-3">
                            <TimelineContent
                                as="div"
                                animationNum={0}
                                timelineRef={heroRef}
                                customVariants={revealVariants}
                                className="md:w-8 md:h-8 sm:w-6 w-5 sm:h-6 h-5 border border-indigo-200 bg-indigo-50 rounded-lg flex items-center justify-center"
                            >
                                <Shield className="w-4 h-4 text-[#191970] dark:text-indigo-300" />
                            </TimelineContent>
                            <TimelineContent
                                as="div"
                                animationNum={1}
                                timelineRef={heroRef}
                                customVariants={revealVariants}
                                className="md:w-8 md:h-8 sm:w-6 w-5 sm:h-6 h-5 border border-indigo-200 bg-indigo-50 rounded-lg flex items-center justify-center"
                            >
                                <Heart className="w-4 h-4 text-[#191970] dark:!text-indigo-300" />
                            </TimelineContent>
                            <TimelineContent
                                as="div"
                                animationNum={2}
                                timelineRef={heroRef}
                                customVariants={revealVariants}
                                className="md:w-8 md:h-8 sm:w-6 w-5 sm:h-6 h-5 border border-indigo-200 bg-indigo-50 rounded-lg flex items-center justify-center"
                            >
                                <Lock className="w-4 h-4 text-[#191970] dark:!text-indigo-300" />
                            </TimelineContent>
                            <TimelineContent
                                as="div"
                                animationNum={3}
                                timelineRef={heroRef}
                                customVariants={revealVariants}
                                className="md:w-8 md:h-8 sm:w-6 w-5 sm:h-6 h-5 border border-indigo-200 bg-indigo-50 rounded-lg flex items-center justify-center"
                            >
                                <Scale className="w-4 h-4 text-[#191970] dark:!text-indigo-300" />
                            </TimelineContent>
                        </div>
                    </div>

                    {/* Hero Image with clip path */}
                    <TimelineContent
                        as="div"
                        animationNum={4}
                        timelineRef={heroRef}
                        customVariants={scaleVariants}
                        className="relative group overflow-hidden rounded-[2rem] aspect-[16/9] md:aspect-[100/40] shadow-2xl"
                    >
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={slideIndex}
                                src={heroImages[slideIndex]}
                                alt="PolijeCare Hero"
                                className="absolute inset-0 w-full h-full object-cover"
                                initial={{ opacity: 0, scale: 1.1 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                        </AnimatePresence>

                        {/* Overlay Gradient for better text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Slide progress indicators */}
                        <div className="absolute bottom-4 left-4 md:bottom-[5%] md:left-[5%] flex gap-2 md:gap-3 items-center z-10">
                            {heroImages.map((_, i) => (
                                <div
                                    key={i}
                                    className="h-[4px] md:h-[6px] rounded-full overflow-hidden cursor-pointer shadow-sm transition-all duration-300 bg-white/30"
                                    style={{
                                        width: i === slideIndex ? '2.5rem' : '1.2rem',
                                    }}
                                    onClick={() => { setSlideIndex(i); setProgress(0); }}
                                >
                                    <div
                                        className="h-full rounded-full transition-all duration-100 ease-linear bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                                        style={{
                                            width: i === slideIndex ? `${progress}%` : i < slideIndex ? '100%' : '0%',
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* 100% stat - Improved Responsiveness & Visibility */}
                        <TimelineContent
                            as="div"
                            animationNum={5}
                            timelineRef={heroRef}
                            customVariants={revealVariants}
                            className="absolute bottom-4 right-4 md:bottom-[8%] md:right-[5%] text-right z-10 bg-white/10 dark:bg-black/20 backdrop-blur-md p-3 md:p-5 rounded-2xl border border-white/20 shadow-xl"
                        >
                            <div className="flex items-baseline gap-1 md:gap-2 justify-end" ref={counterRef}>
                                <span className="text-[#191970] dark:text-indigo-400 font-extrabold text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>{count}%</span>
                                <span className="text-gray-900 dark:text-white font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl uppercase tracking-tight leading-none">Rahasia</span>
                            </div>
                            <span className="text-gray-600 dark:text-gray-300 text-[10px] sm:text-xs md:text-sm mt-1 block text-right font-medium">kerahasiaan terjamin</span>
                        </TimelineContent>
                    </TimelineContent>


                    {/* Stats */}
                    <div className="flex flex-wrap items-center justify-start gap-6 py-4 text-sm">
                        <TimelineContent
                            as="div"
                            animationNum={5}
                            timelineRef={heroRef}
                            customVariants={revealVariants}
                            className="flex items-center gap-2 sm:text-base text-xs"
                        >
                            <span className="text-[#191970] dark:text-indigo-400 font-bold">24/7</span>
                            <span className="text-gray-600 dark:!text-gray-300">layanan aktif</span>
                        </TimelineContent>
                        <span className="text-gray-300 dark:text-gray-600">|</span>
                        <TimelineContent
                            as="div"
                            animationNum={7}
                            timelineRef={heroRef}
                            customVariants={revealVariants}
                            className="flex items-center gap-2 sm:text-base text-xs"
                        >
                            <span className="text-[#191970] dark:text-indigo-400 font-bold">Gratis</span>
                            <span className="text-gray-600 dark:!text-gray-300">tanpa biaya</span>
                        </TimelineContent>
                        <span className="text-gray-300 dark:text-gray-600">|</span>
                        <TimelineContent
                            as="div"
                            animationNum={8}
                            timelineRef={heroRef}
                            customVariants={revealVariants}
                            className="flex items-center gap-2 sm:text-base text-xs"
                        >
                            <span className="text-[#191970] dark:text-indigo-400 font-bold">Cepat</span>
                            <span className="text-gray-600 dark:!text-gray-300">respon tanggap</span>
                        </TimelineContent>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <h2 className="sm:text-4xl md:text-5xl text-2xl !leading-[110%] font-semibold text-gray-900 dark:!text-white mb-8">
                            <VerticalCutReveal
                                splitBy="words"
                                staggerDuration={0.1}
                                staggerFrom="first"
                                reverse={true}
                                transition={{
                                    type: "spring",
                                    stiffness: 250,
                                    damping: 30,
                                    delay: 1,
                                }}
                            >
                                Menciptakan Kampus Aman & Bermartabat.
                            </VerticalCutReveal>
                        </h2>

                        <TimelineContent
                            as="div"
                            animationNum={9}
                            timelineRef={heroRef}
                            customVariants={revealVariants}
                            className="grid md:grid-cols-2 gap-8 text-gray-600 dark:!text-gray-300"
                        >
                            <TimelineContent
                                as="div"
                                animationNum={10}
                                timelineRef={heroRef}
                                customVariants={revealVariants}
                                className="sm:text-base text-xs"
                            >
                                <p className="leading-relaxed text-justify">
                                    PolijeCare merupakan kanal resmi pengaduan Satgas Pencegahan
                                    dan Penanganan Kekerasan Seksual (PPKPT) Politeknik Negeri
                                    Jember. Kami hadir sebagai garda terdepan dalam melindungi
                                    korban dan memberikan pendampingan profesional.
                                </p>
                            </TimelineContent>
                            <TimelineContent
                                as="div"
                                animationNum={11}
                                timelineRef={heroRef}
                                customVariants={revealVariants}
                                className="sm:text-base text-xs"
                            >
                                <p className="leading-relaxed text-justify">
                                    Setiap laporan ditangani secara empatik, profesional, dan
                                    menjaga kerahasiaan penuh. Kami percaya bahwa setiap individu
                                    berhak mendapat rasa aman dalam menempuh pendidikan tanpa
                                    ancaman kekerasan seksual.
                                </p>
                            </TimelineContent>
                        </TimelineContent>
                    </div>

                    <div className="md:col-span-1">
                        <div className="text-right">
                            <TimelineContent
                                as="div"
                                animationNum={12}
                                timelineRef={heroRef}
                                customVariants={revealVariants}
                                className="text-[#191970] dark:text-indigo-400 text-2xl font-bold mb-2"
                            >
                                SATGAS PPKPT
                            </TimelineContent>
                            <TimelineContent
                                as="div"
                                animationNum={13}
                                timelineRef={heroRef}
                                customVariants={revealVariants}
                                className="text-gray-600 dark:!text-gray-300 text-sm mb-8"
                            >
                                Politeknik Negeri Jember
                            </TimelineContent>

                            <TimelineContent
                                as="div"
                                animationNum={14}
                                timelineRef={heroRef}
                                customVariants={revealVariants}
                                className="mb-6"
                            >
                                <p className="text-gray-900 dark:!text-white font-medium mb-4">
                                    Siap untuk melaporkan atau butuh bantuan? Kami siap mendengarkan Anda.
                                </p>
                            </TimelineContent>

                            <TimelineContent
                                as="a"
                                animationNum={15}
                                timelineRef={heroRef}
                                customVariants={revealVariants}
                                href="#contact"
                                className="group relative inline-flex w-fit ml-auto items-center gap-2 px-7 py-3 bg-[#191970] dark:bg-indigo-600 text-white rounded-full font-semibold text-sm cursor-pointer transition-all duration-300 hover:bg-[#1a237e] dark:hover:bg-indigo-700 hover:text-white hover:shadow-[0_4px_20px_rgba(26,35,126,0.5)] dark:hover:shadow-[0_4px_20px_rgba(79,70,229,0.5)] hover:gap-3"
                            >
                                <Phone className="w-4 h-4 opacity-60" />
                                HUBUNGI KAMI
                                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                            </TimelineContent>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
