export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export const slideDown = {
  hidden: { opacity: 0, y: -50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export const slideUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export const slideLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export const slideRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export const cardHover = {
  rest: { scale: 1, boxShadow: "0px 0px 0px rgba(0,0,0,0)" },
  hover: {
    scale: 1.02,
    boxShadow: "0px 10px 30px rgba(0,0,0,0.1)",
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

export const buttonTap = {
  rest: { scale: 1 },
  tap: { scale: 0.95 }
};

export const listItem = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: "easeOut"
    }
  })
};

export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5, ease: "easeInOut" }
};

export const floatingAnimation = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const pulseAnimation = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const shimmerEffect = {
  initial: { backgroundPosition: "-200% 0" },
  animate: {
    backgroundPosition: "200% 0",
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

export const progressBar = {
  initial: { width: "0%" },
  animate: (width) => ({
    width: `${width}%`,
    transition: { duration: 0.8, ease: "easeOut" }
  })
};

export const notificationSlide = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 },
  transition: { duration: 0.3, ease: "easeOut" }
};

// Animasi khusus untuk sistem jadwal konselor
export const scheduleAnimations = {
  // Fade-in untuk jadwal
  fadeInSchedule: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  },
  
  // Scale kecil untuk hover slot
  slotHover: {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    tap: {
      scale: 0.95
    }
  },
  
  // Slide-up untuk modal
  modalSlideUp: {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: 50,
      transition: {
        duration: 0.2
      }
    }
  },
  
  // Stagger untuk daftar slot
  slotStagger: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  },
  
  // Item slot individual
  slotItem: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.2
      }
    }
  },
  
  // Toast notification
  toastSlideIn: {
    hidden: { opacity: 0, x: 100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      x: 100,
      transition: {
        duration: 0.2
      }
    }
  },
  
  // Card hover effect
  cardHover: {
    hover: {
      y: -4,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  },
  
  // Loading spinner
  spinnerRotate: {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }
    }
  },
  
  // Page transition
  pageTransition: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3
      }
    }
  }
};

// Utility function untuk mendapatkan class CSS berdasarkan status slot
export const getSlotStatusClasses = (status, isAvailable = true) => {
  if (!isAvailable) {
    return "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50";
  }
  
  switch (status) {
    case 'available':
      return "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200 hover:border-purple-300 cursor-pointer transition-all duration-200";
    case 'booked':
      return "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed opacity-70";
    case 'pending':
      return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 cursor-pointer transition-all duration-200";
    case 'approved':
      return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200 cursor-pointer transition-all duration-200";
    default:
      return "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed";
  }
};

// Utility function untuk mendapatkan warna status
export const getSlotStatusColor = (status) => {
  const colors = {
    available: {
      bg: "bg-purple-100",
      text: "text-purple-800",
      border: "border-purple-200",
      hover: "hover:bg-purple-200"
    },
    booked: {
      bg: "bg-gray-100",
      text: "text-gray-800",
      border: "border-gray-200",
      hover: "hover:bg-gray-200"
    },
    pending: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      border: "border-yellow-200",
      hover: "hover:bg-yellow-200"
    },
    approved: {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-200",
      hover: "hover:bg-green-200"
    },
    disabled: {
      bg: "bg-gray-50",
      text: "text-gray-400",
      border: "border-gray-100",
      hover: "hover:bg-gray-50 cursor-not-allowed"
    }
  };
  
  return colors[status] || colors.disabled;
};
