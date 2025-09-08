import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Compare.css";
import { colors } from "./colors";
import HelpButton from "./HelpButton";
import { saveGameProgress, getGameProgress, clearGameProgress } from "./gameProgress";
import { useDragNavigation } from "./useDragNavigation";

function CompareContrast() {
    const [categories, setCategories] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [shuffledItems, setShuffledItems] = useState([]);
    const [borderColor, setBorderColor] = useState(colors[0]);
    const [fadeState, setFadeState] = useState("fade-in-active");

    const navigate = useNavigate();
    const categoriesRef = useRef([]);
    const currentIndexRef = useRef(0);

    // Update refs when state changes
    useEffect(() => {
        categoriesRef.current = categories;
        currentIndexRef.current = currentIndex;
    }, [categories, currentIndex]);

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
        const nextIndex = (currentIdx + 1) % categoriesData.length;
        setFadeState("fade-out");
        setTimeout(() => {
            setCurrentIndex(nextIndex);
            setShuffledItems(shuffleArray(categoriesData[nextIndex].examples));
            setBorderColor(colors[nextIndex % colors.length]);
            setFadeState("fade-in-active");
        }, 400);
    }, [shuffleArray]);

    const handlePrev = useCallback(() => {
        const currentIdx = currentIndexRef.current;
        const categoriesData = categoriesRef.current;
        const prevIndex = (currentIdx - 1 + categoriesData.length) % categoriesData.length;
        setFadeState("fade-out");
        setTimeout(() => {
            setCurrentIndex(prevIndex);
            setShuffledItems(shuffleArray(categoriesData[prevIndex].examples));
            setBorderColor(colors[prevIndex % colors.length]);
            setFadeState("fade-in-active");
        }, 400);
    }, [shuffleArray]);

    // Drag navigation - must be called at top level
    const { dragRef, mouseHandlers, touchHandlers } = useDragNavigation(
        handleNext,
        handlePrev,
        { threshold: 50 }
    );

    useEffect(() => {
        fetch(process.env.PUBLIC_URL + "/comparisons.json")
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



    const currentCategory = categories[currentIndex];

    // Clear progress function
    const clearProgress = () => {
        clearGameProgress("compare-contrast");
        setCurrentIndex(0);
    };

    return (
        <div className="compare-app">
            <HelpButton gameId="compare-contrast" onStartOver={clearProgress} />
            <h1 className="compare-title">Compare & Contrast</h1>
            {categories.length > 0 ? (
                <>
                    <button className="compare-nav-arrow left" onClick={handlePrev}>❮</button>
                    <div 
                        ref={dragRef}
                        className={`compare-card-container ${fadeState}`} 
                        style={{ borderColor }}
                        {...mouseHandlers}
                        {...touchHandlers}
                    >
                        <div className="compare-grid">
                            {shuffledItems.slice(0, 2).map((item, idx) => (
                                <div key={idx} className="compare-card">
                                    <img
                                        src={process.env.PUBLIC_URL + item.image}
                                        alt={item.name}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="compare-category-id">{currentCategory.id}</div>
                    </div>
                    <button className="compare-nav-arrow right" onClick={handleNext}>❯</button>
                </>
            ) : (
                <p style={{ color: "white", fontFamily: "Poppins", fontSize: "1.2rem" }}>Loading comparisons...</p>
            )}
        </div>
    );
}

export default CompareContrast;
