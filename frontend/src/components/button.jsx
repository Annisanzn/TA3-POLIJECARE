import React from "react";

export const Component = ({
  icon,
  title,
  subtitle,
  size = "md",
  className = "",
  ...props
}) => {
  const sizes = {
    sm: "px-10 py-4 rounded-full text-base",
    md: "p-4 rounded-2xl",
    lg: "p-6 rounded-3xl",
  };

  return (
    <button
      {...props}
      className={`group relative overflow-hidden cursor-pointer transition-all duration-300 ease-out 
                  shadow-lg hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 active:scale-95
                  border-0 flex items-center justify-between gap-6
                  ${sizes[size]} 
                  ${className}`}>

      {/* Subtle internal glow/shine for depth, but keeping base color solid */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>

      {/* Content - flat structure for perfect alignment */}
      <div className="relative z-10 flex items-center gap-3">
        {icon && React.cloneElement(icon, {
          className: "w-6 h-6 text-white/90 group-hover:text-white transition-colors shrink-0",
        })}
        <span className="text-white font-bold text-base whitespace-nowrap">{title}</span>
      </div>

      {/* Arrow - Re-added as requested */}
      <div className="relative z-10 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
        <svg
          viewBox="0 0 24 24"
          stroke="currentColor"
          fill="none"
          className="w-4 h-4 text-white">
          <path
            d="M9 5l7 7-7 7"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"></path>
        </svg>
      </div>
    </button>
  );
};
