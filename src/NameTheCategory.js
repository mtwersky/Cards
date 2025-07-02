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
    const [slideState, setSlideState] = useState("fade-in-active");
    const [overlays, setOverlays] = useState({});
    const [disabledItems, setDisabledItems] = useState({});
    const [highlightIndex, setHighlightIndex] = useState(null);
    const [lastLockedIndex, setLastLockedIndex] = useState(null);
    const [isLocking, setIsLocking] = useState(false);
    const [firstTry, setFirstTry] = useState(true);
    const [score, setScore] = useState(() => {
        const saved = localStorage.getItem("wdb-score");
        return saved ? parseInt(saved) : 0;
    });

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

    useEffect(() => {
        localStorage.setItem("wdb-score", score.toString());
    }, [score]);

    const shuffleArray = (array) => {
        return array
            .map((item) => ({ item, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ item }) => item);
    };

    const generateExplanation = (category) => {
        if (!category || !category.examples) return "No explanation available.";

        const belongItems = category.examples.filter(item => !item.isCorrect).map(item => item.name);
        const oddItem = category.examples.find(item => item.isCorrect);

        if (!oddItem || belongItems.length === 0) return "No explanation available.";

        const belongList = belongItems.join(", ").replace(/, ([^,]*)$/, ", and $1");
        return `The ${belongList} are all ${category.name}. The ${oddItem.name} does not fit into the category ${category.name}.`;
    };

    const changeCategory = (index) => {
        if (!categories[index]) return;

        setSlideState("fade-out");
        setOverlays({});
        setDisabledItems({});
        setHighlightIndex(null);
        setLastLockedIndex(null);
        setFirstTry(true);

        setTimeout(() => {
            setCurrentCategoryIndex(index);
            setShuffledItems(shuffleArray(categories[index].examples));
            setBorderColor(colors[index % colors.length]);
            setSlideState("fade-in");
            setTimeout(() => {
                setSlideState("fade-in-active");
                setIsLocking(false);
            }, 50);
        }, 500);
    };

    const handleCardClick = (isCorrect, idx) => {
        if (isLocking) return;
        setIsLocking(true);

        if (!isCorrect) {
            if (firstTry) {
                setScore((prev) => prev + 1);
            }
            setFirstTry(false);
        }

        if (isCorrect) {
            setOverlays((prev) => ({ ...prev, [idx]: "cross" }));
            setTimeout(() => {
                setOverlays((prev) => {
                    const newOverlays = { ...prev };
                    delete newOverlays[idx];
                    return newOverlays;
                });

                setDisabledItems((prev) => {
                    const updated = { ...prev, [idx]: true };

                    const stillEnabled = shuffledItems
                        .map((_, i) => i)
                        .filter((i) => !updated[i]);

                    if (stillEnabled.length === 1) {
                        const lastIndex = stillEnabled[0];
                        setHighlightIndex(lastIndex);

                        setTimeout(() => {
                            setLastLockedIndex(lastIndex);
                            setIsLocking(true);
                        }, 500);
                    } else {
                        setIsLocking(false);
                    }

                    return updated;
                });
            }, 700);
        } else {
            setOverlays((prev) => ({ ...prev, [idx]: "check" }));
            setTimeout(() => {
                setOverlays((prev) => {
                    const newOverlays = { ...prev };
                    delete newOverlays[idx];
                    return newOverlays;
                });

                const newDisabled = {};
                shuffledItems.forEach((_, i) => {
                    if (i !== idx) {
                        newDisabled[i] = true;
                    }
                });
                setDisabledItems(newDisabled);

                setIsLocking(true);
            }, 700);
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

    const handleStartOver = () => {
        setScore(0);
        setCurrentCategoryIndex(0);
        setShuffledItems(shuffleArray(categories[0].examples));
        setBorderColor(colors[0]);
        setSlideState("fade-in-active");
        setOverlays({});
        setDisabledItems({});
        setHighlightIndex(null);
        setLastLockedIndex(null);
        setIsLocking(false);
        setFirstTry(true);
    };

    const handleExplain = () => {
        const current = categories[currentCategoryIndex];
        alert(generateExplanation(current));
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
                    <div className={`card-container ${slideState}`} style={{ borderColor }}>
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
                    <div className="button-row">
                        <button
                            className="round-button"
                            style={{ backgroundColor: borderColor }}
                            onClick={handleExplain}
                        >
                            Explain
                        </button>
                        <button
                            className="round-button"
                            style={{ backgroundColor: borderColor }}
                        >
                            Score: {score}
                        </button>
                        <button
                            className="round-button"
                            style={{ backgroundColor: borderColor }}
                            onClick={handleStartOver}
                        >
                            Start Over
                        </button>
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
