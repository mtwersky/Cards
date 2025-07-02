import React from "react";
import "./App.css";

const CardGrid = ({
    items,
    overlays,
    disabledItems,
    lastLockedIndex,
    onCardClick,
    highlightIndex,
    isLocking
}) => {
    return (
        <div className="card-grid">
            {items.map((item, idx) => {
                const isDisabled = disabledItems[idx];
                const isLastLocked = lastLockedIndex === idx;
                const buttonClasses = `image-card 
          ${isDisabled ? "disabled" : ""} 
          ${highlightIndex === idx ? "highlight" : ""}`;

                return (
                    <button
                        key={idx}
                        className={buttonClasses}
                        onClick={() => !isDisabled && !isLastLocked && !isLocking && onCardClick(item.isCorrect, idx)}
                        disabled={isDisabled || isLastLocked || isLocking}
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
