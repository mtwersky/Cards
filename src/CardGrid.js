import React from "react";

function CardGrid({
    items,
    overlays,
    disabledItems,
    lastLockedIndex,
    onCardClick,
    highlightIndex,
    isLocking
}) {
    return (
        <div className="card-grid">
            {items.map((item, idx) => (
                <button
                    key={idx}
                    className={`image-card ${disabledItems[idx] ? "disabled" : ""} ${highlightIndex === idx ? "highlight" : ""}`}
                    onClick={() => !disabledItems[idx] && !isLocking && onCardClick(item.isCorrect, idx)}
                    disabled={disabledItems[idx] || isLocking}
                >
                    <img
                        src={process.env.PUBLIC_URL + item.image}
                        alt={item.name}
                        className="card-image"
                    />
                    {overlays[idx] && (
                        <div className="overlay">
                            <img
                                src={process.env.PUBLIC_URL + (overlays[idx] === "check" ? "/images/green-check.png" : "/images/red-x.png")}
                                alt="Overlay"
                            />
                        </div>
                    )}
                </button>
            ))}
        </div>
    );
}

export default CardGrid;
