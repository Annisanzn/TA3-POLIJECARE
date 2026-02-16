"use client";;
import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOnClickOutside } from "usehooks-ts";
import { cn } from "@/lib/utils";

const buttonVariants = {
  initial: {
    gap: 0,
    paddingLeft: ".5rem",
    paddingRight: ".5rem",
  },
  animate: (isExpanded) => ({
    gap: isExpanded ? ".5rem" : 0,
    paddingLeft: isExpanded ? "2rem" : "1rem",
    paddingRight: isExpanded ? "2rem" : "1rem",
  }),
};

const spanVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: "auto", opacity: 1 },
  exit: { width: 0, opacity: 0 },
};

const transition = { type: "spring", bounce: 0, duration: 0.3 };

export function ExpandableTabs({
  tabs,
  className,
  activeColor = "text-primary",
  onChange,
  activeTab,
  trailingElement
}) {
  const [selected, setSelected] = React.useState(null);
  const [hovered, setHovered] = React.useState(null);
  const outsideClickRef = React.useRef(null);

  React.useEffect(() => {
    if (activeTab !== undefined && activeTab !== null) {
      setSelected(activeTab);
    }
  }, [activeTab]);

  useOnClickOutside(outsideClickRef, () => {
    setSelected(null);
    onChange?.(null);
  });

  const handleSelect = (index) => {
    setSelected(index);
    onChange?.(index);
  };

  const Separator = () => (
    <div className="mx-1 h-[24px] w-[1.2px] bg-border" aria-hidden="true" />
  );

  return (
    <div
      ref={outsideClickRef}
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-full border border-white/20 bg-white/80 backdrop-blur-md p-1 shadow-lg",
        className
      )}>
      {tabs.map((tab, index) => {
        if (tab.type === "separator") {
          return <Separator key={`separator-${index}`} />;
        }

        const Icon = tab.icon;
        const isExpanded = selected === index || hovered === index;
        return (
          <motion.button
            key={tab.title}
            layout
            variants={buttonVariants}
            initial={false}
            animate="animate"
            custom={isExpanded}
            onClick={() => handleSelect(index)}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
            transition={transition}
            className={cn(
              "relative flex items-center rounded-full py-3 text-base font-medium transition-colors duration-300",
              selected === index
                ? "bg-[#191970] text-white shadow-[0_4px_15px_rgba(25,25,112,0.4)]"
                : hovered === index
                  ? "bg-gray-200 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
            )}>
            <Icon size={24} />
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.span
                  variants={spanVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transition}
                  className="overflow-hidden whitespace-nowrap">
                  {tab.title}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
      {trailingElement && (
        <>
          <Separator />
          <div className="pl-1">
            {trailingElement}
          </div>
        </>
      )}
    </div>
  );
}