import React from 'react';
import { motion } from 'framer-motion';

/**
 * PageTransition – wraps page content with a smooth fade + subtle slide animation.
 * Applied at the route level for seamless page transitions.
 * 
 * The animation is tuned to feel natural:
 * - Fast opacity crossfade (no jarring white flash)
 * - Very subtle upward slide (just enough to convey direction)
 * - Spring-like easing for organic feel
 */
const pageVariants = {
  initial: {
    opacity: 0,
    y: 18,
    filter: 'blur(4px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1], // easeOutQuint – buttery smooth deceleration
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: 'blur(2px)',
    transition: {
      duration: 0.25,
      ease: [0.55, 0, 1, 0.45], // easeInQuint
    },
  },
};

const PageTransition = ({ children, className = '' }) => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
      style={{ width: '100%', minHeight: '100vh' }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
