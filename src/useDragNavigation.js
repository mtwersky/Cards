import { useRef, useCallback } from 'react';

/**
 * Custom hook for drag navigation between cards
 * @param {Function} onNext - Function to call when dragging right/next
 * @param {Function} onPrev - Function to call when dragging left/previous
 * @param {Object} options - Configuration options
 * @returns {Object} - Object containing drag event handlers and refs
 */
export const useDragNavigation = (onNext, onPrev, options = {}) => {
    const {
        threshold = 50, // Minimum drag distance to trigger navigation
        disabled = false, // Whether drag navigation is disabled
        preventDefault = true // Whether to prevent default touch/mouse behavior
    } = options;

    const dragRef = useRef(null);
    const startPos = useRef({ x: 0, y: 0 });
    const isDragging = useRef(false);
    const hasMoved = useRef(false);

    const handleStart = useCallback((e) => {
        if (disabled) return;
        
        isDragging.current = true;
        hasMoved.current = false;
        
        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        
        startPos.current = { x: clientX, y: clientY };
        
        if (preventDefault) {
            e.preventDefault();
        }
    }, [disabled, preventDefault]);

    const handleMove = useCallback((e) => {
        if (!isDragging.current || disabled) return;
        
        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        
        const deltaX = clientX - startPos.current.x;
        const deltaY = clientY - startPos.current.y;
        
        // Only consider horizontal movement
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
            hasMoved.current = true;
            if (preventDefault) {
                e.preventDefault();
            }
        }
    }, [disabled, preventDefault]);

    const handleEnd = useCallback((e) => {
        if (!isDragging.current || disabled || !hasMoved.current) {
            isDragging.current = false;
            hasMoved.current = false;
            return;
        }
        
        const clientX = e.type === 'touchend' ? 
            (e.changedTouches ? e.changedTouches[0].clientX : startPos.current.x) : 
            e.clientX;
        
        const deltaX = clientX - startPos.current.x;
        
        // Check if drag distance exceeds threshold
        if (Math.abs(deltaX) > threshold) {
            if (deltaX > 0) {
                // Dragged right - go to previous card
                onPrev();
            } else {
                // Dragged left - go to next card
                onNext();
            }
        }
        
        isDragging.current = false;
        hasMoved.current = false;
        
        if (preventDefault) {
            e.preventDefault();
        }
    }, [disabled, threshold, onNext, onPrev, preventDefault]);

    // Mouse events
    const mouseHandlers = {
        onMouseDown: handleStart,
        onMouseMove: handleMove,
        onMouseUp: handleEnd,
        onMouseLeave: handleEnd
    };

    // Touch events
    const touchHandlers = {
        onTouchStart: handleStart,
        onTouchMove: handleMove,
        onTouchEnd: handleEnd
    };

    return {
        dragRef,
        mouseHandlers,
        touchHandlers,
        isDragging: isDragging.current
    };
};

export default useDragNavigation;
