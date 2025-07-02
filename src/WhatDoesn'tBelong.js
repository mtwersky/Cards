import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CardGrid from "./CardGrid";
import "./App.css";

const colors = [
    "#f7d84b",
    "#ff9999",
    "#99ccff",
    "#99ff99",
    "#ffcc99",
    "#dda0dd",
    "#ff6666",
    "#66cccc"
];

function WhatDoesntBelong() {
    const [categories, setCategories] = useState([]);
    const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
    const [shuffledItems, setShuffledItems] = useState([]);
    const [borderColor, setBorderColor] = useState(colors[0]);
    const [fadeState, setFadeState] = useState("fade-in-active");
    const [overlays, setOverlays] = useState({});
    const [disabledItems, setDisabledItems] = useState({});
    const [highlightIndex, setHighlightIndex] = useState(null);
    const [lastLockedIndex, setLastLockedIndex] = useState(null);
    const [isLocking, setIsLocking] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("/category_cards_50.json")
            .then((res) => res.json())
            .then((data) => {
                setCategories(data);
                if (data.length > 0) {
                    setShuffledItems(shuffleArray(data[0].examples));
                    setBorderColor(colors[0]);
                }
            });
    }, []);

    const shuffleArray = (array) => {
        return array
            .map((item) => ({ item, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ item }) => item);
    };

    const changeCategory = (index) => {
        if (!categories[index]) return;

        setFadeState("fade-out");
        setOverlays({});
        setDisabledItems({});
        setHighlightIndex(null);
        setLastLockedIndex(null);

        setTimeout(() => {
            setCurrentCategoryIndex(index);
            setShuffledItems(shuffleArray(categories[index].examples));
            setBorderColor(colors[index % colors.length]);
            setFadeState("fade-in");
            setTimeout(() => {
                setFadeState("fade-in-active");
                setIsLocking(false);
            }, 50);
        }, 700);
    };

    const handleCardClick = (isCorrect, idx) => {
        if (isLocking) return;
        setIsLocking(true);

        if (isCorrect) {
            // Wrong choice — show red cross
            setOverlays((prev) => ({ ...prev, [idx]: "cross" }));
            setTimeout(() => {
                setOverlays((prev) => {
                    const newOverlays = { ...prev };
                    delete newOverlays[idx];
                    return newOverlays;
                });

                setDisabledItems((prev) => {
                    const updated = { ...prev, [idx]: true };

                    // Check if only one option is left enabled
                    const stillEnabled = shuffledItems
                        .map((_, i) => i)
                        .filter((i) => !updated[i]);

                    if (stillEnabled.length === 1) {
                        const lastIndex = stillEnabled[0];
                        setHighlightIndex(lastIndex);

                        // After grow animation (700 ms), lock it
                        setTimeout(() => {
                            setLastLockedIndex(lastIndex);
                            setIsLocking(true);
                        }, 700);
                    } else {
                        setIsLocking(false);
                    }

                    return updated;
                });
            }, 1000);
        } else {
            // Correct choice — show green check
            setOverlays((prev) => ({ ...prev, [idx]: "check" }));
            setTimeout(() => {
                setOverlays((prev) => {
                    const newOverlays = { ...prev };
                    delete newOverlays[idx];
                    return newOverlays;
                });

                // Fade and lock all other options
                const newDisabled = {};
                shuffledItems.forEach((_, i) => {
                    if (i !== idx) {
                        newDisabled[i] = true;
                    }
                });
                setDisabledItems(newDisabled);

                setIsLocking(true);
            }, 1000);
        }
    };

    const handleNext = () => {
        const nextIndex = (currentCategoryIndex + 1) % categories.length;
        changeCategory(nextIndex);
    };

    const handlePrev = () => {
        const prevIndex = (currentCategoryIndex - 1 + categories.length) % categories.length;
        changeCategory(prevIndex);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "ArrowRight") {
                handleNext();
            } else if (e.key === "ArrowLeft") {
                handlePrev();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [currentCategoryIndex]);

    const current = categories[currentCategoryIndex];

    return (
        <div className="app">
            <button className="back-button" onClick={() => navigate("/")}>Home</button>
            <h1 className="title">What Doesn't Belong?</h1>
            {current ? (
                <>
                    <button className="nav-arrow left" onClick={handlePrev}>❮</button>
                    <div className={`card-container ${fadeState}`} style={{ borderColor }}>
                        <CardGrid
                            items={shuffledItems}
                            overlays={overlays}
                            disabledItems={disabledItems}
                            lastLockedIndex={lastLockedIndex}
                            onCardClick={handleCardClick}
                            highlightIndex={highlightIndex}
                            isLocking={isLocking}
                        />
                        <div className="category-id">{current.id}</div>
                    </div>
                    <button className="nav-arrow right" onClick={handleNext}>❯</button>
                </>
            ) : (
                <p>Loading categories...</p>
            )}
        </div>
    );
}

export default WhatDoesntBelong;
