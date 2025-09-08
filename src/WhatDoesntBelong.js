import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./WhatDoesntBelong.css";
import { colors } from "./colors";
import HelpButton from "./HelpButton";
import { saveGameProgress, getGameProgress, clearGameProgress, markGameCompleted } from "./gameProgress";
import { useDragNavigation } from "./useDragNavigation";

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
    const location = useLocation();
    const gameId = "what-doesnt-belong";
    const categoriesRef = useRef([]);
    const currentIndexRef = useRef(0);
    const scoreRef = useRef(0);

    // Update refs when state changes
    useEffect(() => {
        categoriesRef.current = categories;
        currentIndexRef.current = currentIndex;
        scoreRef.current = score;
    }, [categories, currentIndex, score]);

    // Shuffle function
    const shuffleArray = useCallback((array) => {
        return array
            .map((item) => ({ item, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ item }) => item);
    }, []);

    // Navigation functions with useCallback
    const handleNext = useCallback(() => {
        const currentIdx = currentIndexRef.current;
        const categoriesData = categoriesRef.current;
        const currentScore = scoreRef.current;
        
        if (currentIdx < categoriesData.length - 1) {
            setFadeState("wdb-fade-out");
            setTimeout(() => {
                const nextIndex = currentIdx + 1;
                setCurrentIndex(nextIndex);
                setShuffledItems(shuffleArray(categoriesData[nextIndex].examples));
                setBorderColor(colors[nextIndex % colors.length]);
                setFadeState("wdb-fade-in-active");
            }, 400);
        } else if (currentIdx === categoriesData.length - 1) {
            // This is the last category - navigate to game end when right arrow is pressed
            markGameCompleted(gameId, currentScore, categoriesData.length);
            navigate('/game-end', {
                state: {
                    gameName: "What Doesn't Belong?",
                    score: currentScore,
                    totalQuestions: categoriesData.length,
                    gameId: 'what-doesnt-belong'
                }
            });
        }
    }, [gameId, navigate, shuffleArray]);

    const handlePrev = useCallback(() => {
        const currentIdx = currentIndexRef.current;
        const categoriesData = categoriesRef.current;
        
        if (currentIdx > 0) {
            setFadeState("wdb-fade-out");
            setTimeout(() => {
                const prevIndex = currentIdx - 1;
                setCurrentIndex(prevIndex);
                setShuffledItems(shuffleArray(categoriesData[prevIndex].examples));
                setBorderColor(colors[prevIndex % colors.length]);
                setFadeState("wdb-fade-in-active");
            }, 400);
        }
    }, [shuffleArray]);

    // Drag navigation - must be called at top level
    const { dragRef, mouseHandlers, touchHandlers } = useDragNavigation(
        handleNext,
        handlePrev,
        { 
            threshold: 50,
            disabled: currentIndex === 0 // Disable drag to prev on first card
        }
    );

    useEffect(() => {
        fetch(process.env.PUBLIC_URL + "/what_doesnt_belong.json")
            .then((res) => res.json())
            .then((data) => {
                setCategories(data);
                
                // Check for restart or saved progress
                if (location.state?.restart) {
                    // Restart from beginning
                    setCurrentIndex(0);
                    setScore(0);
                    setHasTriedWrong(false);
                    setShuffledItems(shuffleArray(data[0].examples));
                    setBorderColor(colors[0]);
                    clearGameProgress(gameId);
                } else {
                    const savedProgress = getGameProgress(gameId);
                    if (savedProgress && (location.state?.resume || !location.state)) {
                        // Only restore progress if the user actually played (has score or tried wrong)
                        if (savedProgress.score > 0 || savedProgress.hasTriedWrong) {
                            setCurrentIndex(savedProgress.currentIndex || 0);
                            setScore(savedProgress.score || 0);
                            setHasTriedWrong(savedProgress.hasTriedWrong || false);
                            if (savedProgress.shuffledItems) {
                                setShuffledItems(savedProgress.shuffledItems);
                            } else if (data.length > 0) {
                                setShuffledItems(shuffleArray(data[savedProgress.currentIndex || 0].examples));
                            }
                            setBorderColor(colors[(savedProgress.currentIndex || 0) % colors.length] || colors[0]);
                        } else {
                            // Clear invalid progress (game was loaded but not played)
                            clearGameProgress(gameId);
                            setShuffledItems(shuffleArray(data[0].examples));
                            setBorderColor(colors[0]);
                        }
                    } else if (data.length > 0) {
                        setShuffledItems(shuffleArray(data[0].examples));
                        setBorderColor(colors[0]);
                    }
                }
            });
    }, [location.state]);

    // Save progress whenever score or currentIndex changes, but only if user has actually played
    useEffect(() => {
        if (categories.length > 0 && currentIndex >= 0 && (score > 0 || hasTriedWrong)) {
            saveGameProgress(gameId, {
                currentIndex: currentIndex,
                score: score,
                shuffledItems: shuffledItems,
                hasTriedWrong: hasTriedWrong
            });
        }
    }, [score, currentIndex, shuffledItems, categories.length, gameId, hasTriedWrong]);

    // Clear progress when game is completed (optional - you can remove this if you want to keep progress)
    const clearProgress = () => {
        clearGameProgress(gameId);
        setCurrentIndex(0);
        setScore(0);
        setOverlays({});
        setDisabledItems({});
        setHighlightIndex(null);
        setIsLocking(false);
        setHasTriedWrong(false);
        setFadeState("wdb-fade-in-active");
        if (categories.length > 0) {
            setShuffledItems(shuffleArray(categories[0].examples));
            setBorderColor(colors[0]);
        }
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
        return () => window.removeEventListener("keydown", handleKeyDown);
    });


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
            <HelpButton gameId={gameId} onStartOver={clearProgress} />
            <h1 className="wdb-title">What Doesn't Belong?</h1>
            <div style={{ color: "#333333", fontFamily: "Poppins", fontSize: "1.2rem", marginBottom: "10px" }}>
                Score: {score}
            </div>
            {current ? (
                <>
                    <button 
                        className={`wdb-nav-arrow left ${currentIndex === 0 ? 'disabled' : ''}`} 
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                    >
                        ❮
                    </button>
                    <div 
                        ref={dragRef}
                        className={`wdb-card-container ${fadeState}`} 
                        style={{ borderColor }}
                        {...mouseHandlers}
                        {...touchHandlers}
                    >
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
                    <button 
                        className="wdb-nav-arrow right" 
                        onClick={handleNext}
                    >
                        ❯
                    </button>
                </>
            ) : (
                <p style={{ color: "white", fontFamily: "Poppins", fontSize: "1.2rem" }}>Loading categories...</p>
            )}
        </div>
    );
}

export default WhatDoesntBelong;
