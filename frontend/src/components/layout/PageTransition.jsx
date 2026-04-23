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
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
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
