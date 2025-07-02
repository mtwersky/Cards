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
    const [currentIndex, setCurrentIndex] = useState(0);
    const [shuffledItems, setShuffledItems] = useState([]);
    const [borderColor, setBorderColor] = useState(colors[0]);
    const [overlays, setOverlays] = useState({});
    const [disabledItems, setDisabledItems] = useState({});
    const [highlightIndex, setHighlightIndex] = useState(null);
    const [lastLockedIndex, setLastLockedIndex] = useState(null);
    const [isLocking, setIsLocking] = useState(false);
    const [score, setScore] = useState(() => {
        const saved = localStorage.getItem("wdb-score");
        return saved ? parseInt(saved) : 0;
    });

    const navigate = useNavigate();

    useEffect(() => {
        fetch("/what_doesnt_belong.json")
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

    const changeCategory = (index) => {
        if (!categories[index]) return;
        setCurrentIndex(index);
        setShuffledItems(shuffleArray(categories[index].examples));
        setBorderColor(colors[index % colors.length]);
        setOverlays({});
        setDisabledItems({});
        setHighlightIndex(null);
        setLastLockedIndex(null);
        setIsLocking(false);
    };

    const handleNext = () => {
        const nextIndex = (currentIndex + 1) % categories.length;
        changeCategory(nextIndex);
    };

    const handlePrev = () => {
        const prevIndex = (currentIndex - 1 + categories.length) % categories.length;
        changeCategory(prevIndex);
    };

    const handleCardClick = (isCorrect, idx) => {
        if (isLocking) return;
        setIsLocking(true);

        if (!isCorrect) {
            setScore((prev) => prev + 1);
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

    const current = categories[currentIndex];

    return (
        <div className="app">
            <button className="back-button" onClick={() => navigate("/")}>Home</button>
            <h1 className="title">What Doesn't Belong?</h1>
            {current ? (
                <>
                    <button className="nav-arrow left" onClick={handlePrev}>❮</button>
                    <div className="card-container fade-in-active" style={{ borderColor }}>
                        <CardGrid
                            items={shuffledItems}
                            overlays={overlays}
                            disabledItems={disabledItems}
                            lastLockedIndex={lastLockedIndex}
                            onCardClick={handleCardClick}
                            highlightIndex={highlightIndex}
                            isLocking={isLocking}
                            onNext={handleNext}
                            onPrev={handlePrev}
                            categoryId={current.id}
                        />


                    </div>
                    <button className="nav-arrow right" onClick={handleNext}>❯</button>
                </>
            ) : (
                <p style={{ color: "white", fontFamily: "Poppins", fontSize: "1.2rem" }}>Loading categories...</p>
            )}
        </div>
    );
}

export default WhatDoesntBelong;
