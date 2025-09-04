import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ntc.css";
import { colors } from "./colors";
import HelpButton from "./HelpButton";
import { saveGameProgress, getGameProgress, clearGameProgress } from "./gameProgress";

function NameTheCategory() {
    const [categories, setCategories] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [shuffledItems, setShuffledItems] = useState([]);
    const [borderColor, setBorderColor] = useState(colors[0]);
    const [fadeState, setFadeState] = useState("ntc-fade-in-active");
    const [showAnswer, setShowAnswer] = useState(false);
    const [confirmAnswer, setConfirmAnswer] = useState(false);
    const [score, setScore] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        fetch(process.env.PUBLIC_URL + "/categories.json")
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
        setShowAnswer(false);
        setConfirmAnswer(false);
    };

    const handleNext = () => {
        const nextIndex = (currentIndex + 1) % categories.length;
        setFadeState("ntc-fade-out");
        setTimeout(() => {
            changeCategory(nextIndex);
            setFadeState("ntc-fade-in-active");
        }, 400);
    };

    const handlePrev = () => {
        const prevIndex = (currentIndex - 1 + categories.length) % categories.length;
        setFadeState("ntc-fade-out");
        setTimeout(() => {
            changeCategory(prevIndex);
            setFadeState("ntc-fade-in-active");
        }, 400);
    };

    const handleShowAnswer = () => {
        setShowAnswer(true);
        setConfirmAnswer(true);
    };

    const handleCorrect = () => {
        setScore((prev) => prev + 1);
        setConfirmAnswer(false);
    };

    const handleUndo = () => {
        setConfirmAnswer(false);
    };

    const current = categories[currentIndex];

    // Clear progress function
    const clearProgress = () => {
        clearGameProgress("name-the-category");
        setCurrentIndex(0);
        setScore(0);
    };

    return (
        <div className="ntc-app">
            <HelpButton gameId="name-the-category" onStartOver={clearProgress} />
            <h1 className="ntc-title">Name the Category</h1>
            <div style={{ color: "#333333", fontFamily: "Poppins", fontSize: "1.2rem", marginBottom: "10px" }}>
                Score: {score}
            </div>
            {current ? (
                <>
                    <button className="ntc-nav-arrow left" onClick={handlePrev}>❮</button>
                    <div className={`ntc-card-container ${fadeState}`} style={{ borderColor }}>
                        <div className="ntc-grid">
                            {shuffledItems.map((item, idx) => (
                                <button
                                    key={idx}
                                    className="ntc-image-card"
                                    disabled
                                >
                                    <img
                                        src={process.env.PUBLIC_URL + item.image}
                                        alt={item.name}
                                        className="ntc-card-image"
                                    />
                                </button>
                            ))}
                        </div>
                        {showAnswer && (
                            <div className="ntc-category-id">{current.name}</div>
                        )}
                    </div>
                    <button className="ntc-nav-arrow right" onClick={handleNext}>❯</button>

                    {!showAnswer && !confirmAnswer && (
                        <button
                            className="ntc-answer-button"
                            onClick={handleShowAnswer}
                            style={{
                                backgroundColor: borderColor,
                                color: "black"
                            }}
                        >
                            Show Answer
                        </button>
                    )}

                    {showAnswer && confirmAnswer && (
                        <div className="ntc-confirm-buttons">
                            <button
                                className="ntc-icon-button"
                                onClick={handleCorrect}
                            >
                                <img
                                    src={process.env.PUBLIC_URL + "/images/green-check.png"}
                                    alt="Correct"
                                />
                            </button>
                            <button
                                className="ntc-icon-button"
                                onClick={handleUndo}
                            >
                                <img
                                    src={process.env.PUBLIC_URL + "/images/red-x.png"}
                                    alt="Undo"
                                />
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <p style={{ color: "white", fontFamily: "Poppins", fontSize: "1.2rem" }}>Loading categories...</p>
            )}
        </div>
    );
}

export default NameTheCategory;
