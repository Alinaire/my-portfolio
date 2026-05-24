import { useEffect, useRef, useState } from 'react';

export default function Cursor({ hidden = false }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const updateScreenSize = () => setIsLargeScreen(window.innerWidth >= 768);

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);

    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  useEffect(() => {
    if (!isLargeScreen) return;

    const handleMove = (event) => setPosition({ x: event.clientX, y: event.clientY });
    const handleMouseDown = () => {
      setClicking(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        setClicking(false);
        timeoutRef.current = null;
      }, 220);
    };

    const handleEnter = () => setHovering(true);
    const handleLeave = () => setHovering(false);
    const interactiveElements = document.querySelectorAll('a, button, [role="button"], .cursor-hover');

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mousedown', handleMouseDown);

    interactiveElements.forEach((element) => {
      element.addEventListener('mouseenter', handleEnter);
      element.addEventListener('mouseleave', handleLeave);
    });

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mousedown', handleMouseDown);

      interactiveElements.forEach((element) => {
        element.removeEventListener('mouseenter', handleEnter);
        element.removeEventListener('mouseleave', handleLeave);
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLargeScreen]);

  if (!isLargeScreen) return null;

  return (
    <>
      <style>{`
        @keyframes cursorPulse {
          0%   { transform: scale(1); opacity: 0.9; }
          55%  { transform: scale(1.5); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
      `}</style>

      <div
        className={`fixed inset-0 z-[9999] pointer-events-none transition-opacity duration-200 ${
          hidden ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div
          className={`absolute h-10 w-10 rounded-full border transition-colors duration-150 ${
            hovering ? 'border-[var(--accent-strong)]' : 'border-[var(--accent)]'
          }`}
          style={{
            left: `${position.x - 20}px`,
            top: `${position.y - 20}px`,
            animation: clicking ? 'cursorPulse 220ms ease-out forwards' : 'none',
            opacity: clicking ? 1 : 0.7,
          }}
        />

        <div
          className={`absolute h-3 w-3 rounded-full transition-colors duration-150 ${
            hovering ? 'bg-[var(--accent-strong)]' : 'bg-[var(--accent)]'
          }`}
          style={{
            transform: `translate(${position.x - 6}px, ${position.y - 6}px)`,
          }}
        />
      </div>
    </>
  );
}
