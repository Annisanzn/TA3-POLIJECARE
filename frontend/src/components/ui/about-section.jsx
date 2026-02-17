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
        <section className="min-h-screen py-16 bg-[#f9f9f9] flex items-center" ref={heroRef} id="about">
            <div className="max-w-[90rem] mx-auto w-full px-8 lg:px-12">
                <div className="relative">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8 w-[85%] absolute lg:top-4 md:top-0 sm:-top-2 -top-3 z-10">
                        <div className="flex items-center gap-2 text-xl">
                            <span className="text-[#191970] animate-spin">✱</span>
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
                                <Shield className="w-4 h-4 text-[#191970]" />
                            </TimelineContent>
                            <TimelineContent
                                as="div"
                                animationNum={1}
                                timelineRef={heroRef}
                                customVariants={revealVariants}
                                className="md:w-8 md:h-8 sm:w-6 w-5 sm:h-6 h-5 border border-indigo-200 bg-indigo-50 rounded-lg flex items-center justify-center"
                            >
                                <Heart className="w-4 h-4 text-[#191970]" />
                            </TimelineContent>
                            <TimelineContent
                                as="div"
                                animationNum={2}
                                timelineRef={heroRef}
                                customVariants={revealVariants}
                                className="md:w-8 md:h-8 sm:w-6 w-5 sm:h-6 h-5 border border-indigo-200 bg-indigo-50 rounded-lg flex items-center justify-center"
                            >
                                <Lock className="w-4 h-4 text-[#191970]" />
                            </TimelineContent>
                            <TimelineContent
                                as="div"
                                animationNum={3}
                                timelineRef={heroRef}
                                customVariants={revealVariants}
                                className="md:w-8 md:h-8 sm:w-6 w-5 sm:h-6 h-5 border border-indigo-200 bg-indigo-50 rounded-lg flex items-center justify-center"
                            >
                                <Scale className="w-4 h-4 text-[#191970]" />
                            </TimelineContent>
                        </div>
                    </div>

                    {/* Hero Image with clip path */}
                    <TimelineContent
                        as="figure"
                        animationNum={4}
                        timelineRef={heroRef}
                        customVariants={scaleVariants}
                        className="relative group"
                    >
                        <svg
                            className="w-full"
                            width={"100%"}
                            height={"100%"}
                            viewBox="0 0 100 40"
                        >
                            <defs>
                                <clipPath
                                    id="clip-inverted"
                                    clipPathUnits={"userSpaceOnUse"}
                                >
                                    <path
                                        transform="scale(100, 40)"
                                        d="M0.0998072 1H0.422076H0.749756C0.767072 1 0.774207 0.961783 0.77561 0.942675V0.807325C0.777053 0.743631 0.791844 0.731953 0.799059 0.734076H0.969813C0.996268 0.730255 1.00088 0.693206 0.999875 0.675159V0.0700637C0.999875 0.0254777 0.985045 0.00477707 0.977629 0H0.902473C0.854975 0 0.890448 0.138535 0.850165 0.138535H0.0204424C0.00408849 0.142357 0 0.180467 0 0.199045V0.410828C0 0.449045 0.0136283 0.46603 0.0204424 0.469745H0.0523086C0.0696245 0.471019 0.0735527 0.497877 0.0733523 0.511146V0.915605C0.0723903 0.983121 0.090588 1 0.0998072 1Z"
                                        fill="#D9D9D9"
                                    />
                                </clipPath>
                            </defs>
                            <g clipPath="url(#clip-inverted)">
                                <AnimatePresence>
                                    <motion.image
                                        key={slideIndex}
                                        preserveAspectRatio="xMidYMid slice"
                                        width={"100%"}
                                        height={"100%"}
                                        xlinkHref={heroImages[slideIndex]}
                                        initial={{ x: 100 }}
                                        animate={{ x: 0 }}
                                        exit={{ x: -100 }}
                                        transition={{ duration: 0.6, ease: "easeInOut" }}
                                    />
                                </AnimatePresence>
                            </g>
                        </svg>
                        {/* Slide progress indicators */}
                        <div className="absolute bottom-[3%] left-[10%] flex gap-3 items-center z-10">
                            {heroImages.map((_, i) => (
                                <div
                                    key={i}
                                    className="h-[6px] rounded-full overflow-hidden cursor-pointer shadow-sm transition-all duration-300"
                                    style={{
                                        width: i === slideIndex ? '3rem' : '1.5rem',
                                        backgroundColor: 'rgba(255,255,255,0.4)'
                                    }}
                                    onClick={() => { setSlideIndex(i); setProgress(0); }}
                                >
                                    <div
                                        className="h-full rounded-full transition-all duration-100 ease-linear"
                                        style={{
                                            width: i === slideIndex ? `${progress}%` : i < slideIndex ? '100%' : '0%',
                                            backgroundColor: '#fff',
                                            boxShadow: '0 0 4px rgba(0,0,0,0.2)'
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                        {/* 100% stat in the white cutout */}
                        <TimelineContent
                            as="div"
                            animationNum={5}
                            timelineRef={heroRef}
                            customVariants={revealVariants}
                            className="absolute bottom-[10%] right-[0.5%] text-right"
                        >
                            <div className="flex items-baseline gap-2 justify-end" ref={counterRef}>
                                <span className="text-[#191970] font-extrabold text-2xl sm:text-3xl lg:text-4xl leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>{count}%</span>
                                <span className="text-gray-500 text-2xl sm:text-3xl lg:text-4xl uppercase tracking-wider font-normal leading-none">Rahasia</span>
                            </div>
                            <span className="text-gray-400 text-xs sm:text-sm mt-0.5 block text-left">kerahasiaan terjamin</span>
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
                            <span className="text-[#191970] font-bold">24/7</span>
                            <span className="text-gray-600">layanan aktif</span>
                        </TimelineContent>
                        <span className="text-gray-300">|</span>
                        <TimelineContent
                            as="div"
                            animationNum={7}
                            timelineRef={heroRef}
                            customVariants={revealVariants}
                            className="flex items-center gap-2 sm:text-base text-xs"
                        >
                            <span className="text-[#191970] font-bold">Gratis</span>
                            <span className="text-gray-600">tanpa biaya</span>
                        </TimelineContent>
                        <span className="text-gray-300">|</span>
                        <TimelineContent
                            as="div"
                            animationNum={8}
                            timelineRef={heroRef}
                            customVariants={revealVariants}
                            className="flex items-center gap-2 sm:text-base text-xs"
                        >
                            <span className="text-[#191970] font-bold">Cepat</span>
                            <span className="text-gray-600">respon tanggap</span>
                        </TimelineContent>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <h2 className="sm:text-4xl md:text-5xl text-2xl !leading-[110%] font-semibold text-gray-900 mb-8">
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
                            className="grid md:grid-cols-2 gap-8 text-gray-600"
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
                                className="text-[#191970] text-2xl font-bold mb-2"
                            >
                                SATGAS PPKPT
                            </TimelineContent>
                            <TimelineContent
                                as="div"
                                animationNum={13}
                                timelineRef={heroRef}
                                customVariants={revealVariants}
                                className="text-gray-600 text-sm mb-8"
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
                                <p className="text-gray-900 font-medium mb-4">
                                    Siap untuk melaporkan atau butuh bantuan? Kami siap mendengarkan Anda.
                                </p>
                            </TimelineContent>

                            <TimelineContent
                                as="a"
                                animationNum={15}
                                timelineRef={heroRef}
                                customVariants={revealVariants}
                                href="#contact"
                                className="group relative inline-flex w-fit ml-auto items-center gap-2 px-7 py-3 bg-[#191970] text-white rounded-full font-semibold text-sm cursor-pointer transition-all duration-300 hover:bg-[#1a237e] hover:text-white hover:shadow-[0_4px_20px_rgba(26,35,126,0.5)] hover:gap-3"
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
