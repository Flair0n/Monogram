import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface TerminalOption {
  value: string;
  label: string;
}

interface TerminalSelectorProps {
  options: TerminalOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  enableSound?: boolean;
}

export function TerminalSelector({
  options,
  value,
  onChange,
  label,
  className = "",
  enableSound = false,
}: TerminalSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [typedText, setTypedText] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Find current option
  const currentOption = options.find((opt) => opt.value === value);

  // Blinking cursor effect - only when focused and closed
  useEffect(() => {
    if (isFocused && !isOpen) {
      const interval = setInterval(() => {
        setShowCursor((prev) => !prev);
      }, 530);
      return () => clearInterval(interval);
    } else {
      setShowCursor(false); // Hide when not focused
    }
  }, [isFocused, isOpen]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHoveredIndex(-1);
        setIsFocused(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation and typing
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setHoveredIndex(-1);
        setTypedText("");
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setHoveredIndex((prev) => (prev < options.length - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHoveredIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter" && hoveredIndex >= 0) {
        e.preventDefault();
        handleSelect(options[hoveredIndex].value);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        setTypedText((prev) => prev.slice(0, -1));
      } else if (e.key.length === 1 && /[a-zA-Z0-9 ]/.test(e.key)) {
        e.preventDefault();
        setTypedText((prev) => prev + e.key.toLowerCase());
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, hoveredIndex, options]);

  // Auto-select first option when opening
  useEffect(() => {
    if (isOpen && hoveredIndex === -1) {
      const currentIndex = options.findIndex((opt) => opt.value === value);
      setHoveredIndex(currentIndex >= 0 ? currentIndex : 0);
    }
  }, [isOpen, value, options, hoveredIndex]);

  // Filter and select based on typed text
  useEffect(() => {
    if (!isOpen || !typedText) return;

    // Find first matching option
    const matchIndex = options.findIndex((opt) =>
      opt.label.toLowerCase().startsWith(typedText)
    );

    if (matchIndex >= 0) {
      setHoveredIndex(matchIndex);
    }
  }, [typedText, options, isOpen]);

  const playClickSound = () => {
    if (!enableSound) return;
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 400;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.05);
    } catch (error) {
      // Silent fail for audio
    }
  };

  const handleSelect = (newValue: string) => {
    if (newValue !== value) {
      onChange(newValue);
      playClickSound();
    }
    setIsOpen(false);
    setHoveredIndex(-1);
    setTypedText("");
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setTypedText("");
    setIsFocused(true);
    if (!isOpen) {
      playClickSound();
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Terminal Input Line */}
      <button
        onClick={handleToggle}
        onFocus={() => setIsFocused(true)}
        onBlur={() => !isOpen && setIsFocused(false)}
        className="w-full text-left font-mono text-sm tracking-wide transition-all duration-200 focus:outline-none group"
        style={{
          color: "#2b2a28",
          background: "transparent",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[#b7a97a] select-none">&gt;</span>
          {label && <span className="text-[#2b2a28]/50">{label}:</span>}
          <span className="text-[#2b2a28] font-medium">
            {isOpen && typedText ? typedText : (currentOption?.label || "Select...")}
          </span>
          {isFocused && !isOpen && showCursor && (
            <span
              className="inline-block w-2 h-4 ml-0.5"
              style={{ background: "#2b2a28" }}
            >
              ▉
            </span>
          )}
          {isOpen && (
            <span
              className="inline-block w-2 h-4 ml-0.5 cursor-blink"
              style={{ background: "#2b2a28" }}
            >
              ▉
            </span>
          )}
        </div>
        <div
          className="h-px mt-1 transition-all duration-200"
          style={{
            background: isOpen ? "#b7a97a" : "#2b2a28/10",
            boxShadow: isOpen ? "0 0 8px rgba(183, 169, 122, 0.3)" : "none",
          }}
        />
      </button>

      {/* Dropdown List - Terminal Output Style */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 mt-2 w-full"
            style={{
              background: "#fffdf8",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05)",
              borderRadius: "2px",
            }}
          >
            <div className="p-2">
              {options.map((option, index) => {
                const isHovered = hoveredIndex === index;
                const isSelected = option.value === value;
                
                return (
                  <button
                    key={option.value}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onClick={() => handleSelect(option.value)}
                    className="w-full text-left font-mono text-sm tracking-wide py-2 px-3 transition-all duration-150 rounded-sm flex items-center"
                    style={{
                      color: isHovered ? "#2b2a28" : "#2b2a28/70",
                      background: isHovered ? "#fdfaf5" : "transparent",
                      fontWeight: isSelected ? 500 : 400,
                    }}
                  >
                    <span className="text-[#b7a97a] select-none mr-2">
                      {isSelected ? "●" : "○"}
                    </span>
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
