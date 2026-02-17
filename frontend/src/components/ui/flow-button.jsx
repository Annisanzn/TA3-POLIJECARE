// This is file of your component

// You can use any dependencies from npm; we import them automatically in package.json
'use client';
import { ArrowRight } from 'lucide-react';

export function FlowButton({
  text = "Button",
  href,
  target,
  rel,
  className = "",
  colorStr = "#111111", // Default text/border color
  hoverColorStr = "#111111", // Circle bg color on hover
}) {
  const Component = href ? 'a' : 'button';

  return (
    <Component
      href={href}
      target={target}
      rel={rel}
      className={`group relative flex items-center justify-center gap-1 overflow-hidden rounded-[100px] border-[1.5px] bg-transparent px-8 py-3 text-sm font-semibold cursor-pointer transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-transparent hover:!text-white hover:rounded-[12px] active:scale-[0.95] ${className}`}
      style={{
        borderColor: `${colorStr}40`, // 40 is hex opacity
        color: colorStr
      }}
    >
      {/* Left arrow */}
      <ArrowRight
        className="absolute w-4 h-4 left-[-25%] fill-none z-[9] group-hover:left-4 group-hover:!stroke-white transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        style={{ stroke: colorStr }}
      />

      {/* Text */}
      <span className="relative z-[1] -translate-x-3 group-hover:translate-x-3 transition-all duration-[800ms] ease-out group-hover:!text-white">
        {text}
      </span>

      {/* Circle Hover Effect */}
      <span
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-[50%] opacity-0 group-hover:w-[1200px] group-hover:h-[1200px] group-hover:opacity-100 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)]"
        style={{ backgroundColor: hoverColorStr }}
      ></span>

      {/* Right arrow */}
      <ArrowRight
        className="absolute w-4 h-4 right-4 fill-none z-[9] group-hover:right-[-25%] group-hover:!stroke-white transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        style={{ stroke: colorStr }}
      />
    </Component>
  );
}
