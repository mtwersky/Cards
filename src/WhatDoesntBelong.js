import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WhatDoesntBelong.css";
import { colors } from "./colors";

function WhatDoesntBelong() {
    const [categories, setCategories] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [shuffledItems, setShuffledItems] = useState([]);
    const [borderColor, setBorderColor] = useState(colors[0]);
    const [overlays, setOverlays] = useState({});
    const [disabledItems, setDisabledItems] = useState({});
    const [highlightIndex, setHighlightIndex] = useState(null);
    const [isLocking, setIsLocking] = useState(false);
    const [hasTriedWrong, setHasTriedWrong] = useState(false);
    const [score, setScore] = useState(0);
    const [fadeState, setFadeState] = useState("wdb-fade-in-active");

    const navigate = useNavigate();

    useEffect(() => {
        fetch(process.env.PUBLIC_URL + "/what_doesnt_belong.json")
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
        const handleKeyDown = (e) => {
            if (e.key === "ArrowRight") {
                handleNext();
            } else if (e.key === "ArrowLeft") {
                handlePrev();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    });

    const shuffleArray = (array) => {
        return array
            .map((item) => ({ item, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ item }) => item);
    };

    const changeCategory = (index) => {
        setCurrentIndex(index);
        setShuffledItems(shuffleArray(categories[index].examples));
        setBorderColor(colors[index % colors.length]);
        setOverlays({});
        setDisabledItems({});
        setHighlightIndex(null);
        setIsLocking(false);
        setHasTriedWrong(false);
    };

    const handleNext = () => {
        const nextIndex = (currentIndex + 1) % categories.length;
        setFadeState("wdb-fade-out");
        setTimeout(() => {
            changeCategory(nextIndex);
            setFadeState("wdb-fade-in-active");
        }, 400);
    };

    const handlePrev = () => {
        const prevIndex = (currentIndex - 1 + categories.length) % categories.length;
        setFadeState("wdb-fade-out");
        setTimeout(() => {
            changeCategory(prevIndex);
            setFadeState("wdb-fade-in-active");
        }, 400);
    };

    const handleCardClick = (isCorrect, idx) => {
        if (isLocking) return;
        setIsLocking(true);

        if (isCorrect) {
            setOverlays((prev) => ({ ...prev, [idx]: "cross" }));
            setHasTriedWrong(true);
            setTimeout(() => {
                setOverlays((prev) => {
                    const newOverlays = { ...prev };
                    delete newOverlays[idx];
                    return newOverlays;
                });
                setDisabledItems((prev) => {
                    const updated = { ...prev, [idx]: true };
                    // Check how many enabled items remain
                    const remaining = shuffledItems
                        .map((item, i) => i)
                        .filter(i => !updated[i]);

                    if (remaining.length === 1) {
                        const lastIdx = remaining[0];
                        setHighlightIndex(lastIdx);
                        setTimeout(() => {
                            setHighlightIndex(null);
                            // Just lock interactions, do not disable or fade it
                            setIsLocking(true);
                        }, 1000);
                    } else {
                        setIsLocking(false);
                    }

                    return updated;
                });
            }, 700);
        } else {
            if (!hasTriedWrong) {
                setScore((prev) => prev + 1);
            }
            setOverlays((prev) => ({ ...prev, [idx]: "check" }));
            setTimeout(() => {
                setOverlays({});
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
        <div className="wdb-app">
            <h1 className="wdb-title">What Doesn't Belong?</h1>
            <div style={{ color: "#333333", fontFamily: "Poppins", fontSize: "1.2rem", marginBottom: "10px" }}>
                Score: {score}
            </div>
            {current ? (
                <>
                    <button className="wdb-nav-arrow left" onClick={handlePrev}>❮</button>
                    <div className={`wdb-card-container ${fadeState}`} style={{ borderColor }}>
                        <div className="wdb-grid">
                            {shuffledItems.map((item, idx) => (
                                <button
                                    key={idx}
                                    className={`wdb-image-card ${disabledItems[idx] ? "wdb-disabled" : ""} ${highlightIndex === idx ? "wdb-highlight" : ""}`}
                                    onClick={() => !disabledItems[idx] && !isLocking && handleCardClick(item.isCorrect, idx)}
                                    disabled={disabledItems[idx] || isLocking}
                                >
                                    <img
                                        src={process.env.PUBLIC_URL + item.image}
                                        alt={item.name}
                                        className="wdb-card-image"
                                    />
                                    {overlays[idx] && (
                                        <div className="wdb-overlay">
                                            <img
                                                src={process.env.PUBLIC_URL + (overlays[idx] === "check" ? "/images/green-check.png" : "/images/red-x.png")}
                                                alt="Overlay"
                                            />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="wdb-category-id">{current.id}</div>
                    </div>
                    <button className="wdb-nav-arrow right" onClick={handleNext}>❯</button>
                </>
            ) : (
                <p style={{ color: "white", fontFamily: "Poppins", fontSize: "1.2rem" }}>Loading categories...</p>
            )}
        </div>
    );
}

export default WhatDoesntBelong;
