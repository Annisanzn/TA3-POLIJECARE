"use client";

import React, { useRef, createElement, forwardRef } from "react";
import {
    motion,
    useInView,
    useScroll,
    useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

const TimelineContent = forwardRef(
    (
        {
            as = "div",
            children,
            className,
            animationNum = 0,
            timelineRef,
            customVariants,
            ...props
        },
        ref
    ) => {
        const defaultVariants = {
            hidden: {
                opacity: 0,
                y: 20,
                filter: "blur(8px)",
            },
            visible: (i) => ({
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: {
                    delay: i * 0.3,
                    duration: 0.5,
                    ease: "easeOut",
                },
            }),
        };

        const variants = customVariants || defaultVariants;
        const isInView = useInView(timelineRef, { once: true, amount: 0.1 });
        const MotionComponent = motion[as] || motion.div;

        return (
            <MotionComponent
                ref={ref}
                className={cn(className)}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={variants}
                custom={animationNum}
                {...props}
            >
                {children}
            </MotionComponent>
        );
    }
);

TimelineContent.displayName = "TimelineContent";

export { TimelineContent };
