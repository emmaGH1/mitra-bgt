import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  // Position of the real mouse
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Trailing position with spring physics for the heavy grey orb & block
  const trailX = useSpring(mouseX, { damping: 25, stiffness: 100 });
  const trailY = useSpring(mouseY, { damping: 25, stiffness: 100 });

  // Native state for real-time line rendering between points to avoid coordinate lag
  const [coords, setCoords] = useState({ mx: -100, my: -100, tx: -100, ty: -100 });

  useEffect(() => {
    // Only disable custom cursor on touch-only (mobile/tablet) devices.
    // Laptops with touchscreens will also support pointer: fine (mouse), so they shouldn't be disabled.
    const isTouchOnly = window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(pointer: fine)").matches;
    if (isTouchOnly) {
      return;
    }

    setEnabled(true);

    // Hide default cursor on body when CustomCursor is active
    document.body.classList.add("custom-cursor-active");

    const onMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const onMouseDown = () => setIsClicked(true);
    const onMouseUp = () => setIsClicked(false);

    // Add listeners to track hovers over buttons/links
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "BUTTON" ||
          target.tagName === "A" ||
          target.closest("button") ||
          target.closest("a") ||
          target.getAttribute("role") === "button" ||
          target.classList.contains("cursor-pointer"))
      ) {
        setIsHovered(true);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "BUTTON" ||
          target.tagName === "A" ||
          target.closest("button") ||
          target.closest("a") ||
          target.getAttribute("role") === "button" ||
          target.classList.contains("cursor-pointer"))
      ) {
        setIsHovered(false);
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);

    // Dynamic frame loop to extract spring coordinates for the SVG line connector
    let rAFId: number;
    const updateLine = () => {
      setCoords({
        mx: mouseX.get(),
        my: mouseY.get(),
        tx: trailX.get(),
        ty: trailY.get(),
      });
      rAFId = requestAnimationFrame(updateLine);
    };
    rAFId = requestAnimationFrame(updateLine);

    return () => {
      document.body.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      cancelAnimationFrame(rAFId);
    };
  }, [mouseX, mouseY, trailX, trailY]);

  if (!enabled) return null;

  // Render a hidden style injector to make sure the normal cursor disappears cleanly
  return (
    <>
      <style>{`
        .custom-cursor-active,
        .custom-cursor-active * {
          cursor: none !important;
        }
      `}</style>

      <div 
        className="fixed inset-0 pointer-events-none z-[999999] overflow-hidden text-ink/40 dark:text-cream/40"
        id="custom-tethered-cursor"
      >
        {/* SVG overlay to render the physical tether line between mouse tip and trailing orb */}
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            {/* Radial gradient to mimic the exact 3D sphere volume shading in the reference image */}
            <radialGradient id="sphereGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#b5b5b5" />
              <stop offset="45%" stopColor="#7a7a7a" />
              <stop offset="100%" stopColor="#3d3d3d" />
            </radialGradient>
            
            {/* Soft glow filter for the active white target dot */}
            <filter id="whiteGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Connected tether line (with animated dash/glowing stroke) */}
          {coords.mx !== -100 && coords.tx !== -100 && (
            <line
              x1={coords.mx}
              y1={coords.my}
              x2={coords.tx}
              y2={coords.ty}
              stroke="currentColor"
              className="text-ink/25 dark:text-cream/25"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
          )}
        </svg>

        {/* 1. Leading White Dot (Actual Mouse Coordinates) */}
        <motion.div
          style={{ x: mouseX, y: mouseY }}
          className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2"
        >
          <motion.div
            animate={{
              scale: isClicked ? 0.7 : isHovered ? 1.5 : 1,
              backgroundColor: isHovered ? "var(--color-yellow, #f43f5e)" : "#ffffff",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="w-3.5 h-3.5 rounded-full border border-black/30 shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            style={{ filter: "url(#whiteGlow)" }}
          />
        </motion.div>

        {/* 2. Trailing Physics Group: Grey Orb resting on a flat block platform */}
        <motion.div
          style={{ x: trailX, y: trailY }}
          className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center"
        >
          <motion.div
            animate={{
              scale: isClicked ? 0.85 : isHovered ? 1.15 : 1,
              rotate: isHovered ? 15 : 0,
            }}
            transition={{ type: "spring", stiffness: 250, damping: 15 }}
            className="relative flex flex-col items-center justify-center"
          >
            {/* Grey Orb (3D styled circle using the radial gradient definition) */}
            <svg width="46" height="58" viewBox="0 0 46 58" className="drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]">
              {/* Spherical circle */}
              <circle cx="23" cy="23" r="18" fill="url(#sphereGrad)" stroke="#1a1a1a" strokeWidth="1.5" />
              
              {/* Flat rectangular base platform beneath the circle exactly like the image */}
              <rect x="7" y="38" width="32" height="10" rx="1.5" fill="#5a5a5a" stroke="#1a1a1a" strokeWidth="1.5" />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
