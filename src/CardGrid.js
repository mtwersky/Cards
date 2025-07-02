import React, { useEffect } from "react";
import "./App.css";

const CardGrid = ({
    items,
    overlays,
    disabledItems,
    lastLockedIndex,
    onCardClick,
    highlightIndex,
    isLocking,
    onNext,
    onPrev,
    categoryId
}) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "ArrowRight" && onNext) {
                onNext();
            } else if (e.key === "ArrowLeft" && onPrev) {
                onPrev();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onNext, onPrev]);

    return (
        <div className="card-grid">
            {items.map((item, idx) => {
                const buttonClasses = `image-card 
          ${disabledItems[idx] ? "disabled" : ""} 
          ${highlightIndex === idx ? "highlight" : ""}`;

                return (
                    <button
                        key={idx}
                        className={buttonClasses}
                        onClick={() => !disabledItems[idx] && !lastLockedIndex && !isLocking && onCardClick(item.isCorrect, idx)}
                        disabled={disabledItems[idx] || lastLockedIndex === idx || isLocking}
                    >
                        <img src={item.image} alt="" className="card-image" />
                        {overlays[idx] && (
                            <div className={`overlay ${overlays[idx]}`}>
                                <img
                                    src={
                                        overlays[idx] === "check"
                                            ? "/images/green-check.png"
                                            : "/images/red-x.png"
                                    }
                                    alt={overlays[idx]}
                                />
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default CardGrid;
