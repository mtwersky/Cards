import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SceneCard.css";
import { colors } from "./colors";
import HelpButton from "./HelpButton";
import { saveGameProgress, getGameProgress, clearGameProgress } from "./gameProgress";
import { useDragNavigation } from "./useDragNavigation";

function SceneCard() {
    const [cardData, setCardData] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [questionType, setQuestionType] = useState(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [fadeClass, setFadeClass] = useState("fade-in-active");

    const navigate = useNavigate();
    const location = useLocation();
    const gameId = "scene-card";
    const cardDataRef = useRef([]);

    // Update ref when cardData changes
    useEffect(() => {
        cardDataRef.current = cardData;
    }, [cardData]);

    // Navigation functions with useCallback
    const handleNext = useCallback(() => {
        setFadeClass("fade-out");
        setTimeout(() => {
            setFlipped(false);
            setQuestionType(null);
            setShowAnswer(false);
            setCurrentIndex((prev) => (prev + 1) % cardDataRef.current.length);
            setFadeClass("fade-in-active");
        }, 400);
    }, []);

    const handlePrev = useCallback(() => {
        setFadeClass("fade-out");
        setTimeout(() => {
            setFlipped(false);
            setQuestionType(null);
            setShowAnswer(false);
            setCurrentIndex((prev) => (prev - 1 + cardDataRef.current.length) % cardDataRef.current.length);
            setFadeClass("fade-in-active");
        }, 400);
    }, []);

    // Drag navigation - must be called at top level
    const { dragRef, mouseHandlers, touchHandlers } = useDragNavigation(
        handleNext,
        handlePrev,
        { threshold: 50 }
    );

    useEffect(() => {
        fetch("/sceneCard.json")
            .then((res) => res.json())
            .then((data) => {
                setCardData(data);
                
                // Check for saved progress
                const savedProgress = getGameProgress(gameId);
                if (savedProgress && (location.state?.resume || !location.state)) {
                    // Only restore progress if the user actually played (has interacted)
                    if (savedProgress.hasInteracted) {
                        setCurrentIndex(savedProgress.currentIndex || 0);
                    } else {
                        // Clear invalid progress (game was loaded but not played)
                        clearGameProgress(gameId);
                    }
                }
            });
    }, [location.state]);

    // Save progress whenever currentIndex changes, but only if user has actually played
    useEffect(() => {
        if (cardData.length > 0 && currentIndex >= 0 && (flipped || questionType)) {
            saveGameProgress(gameId, {
                currentIndex: currentIndex,
                hasInteracted: true
            });
        }
    }, [currentIndex, cardData.length, gameId, flipped, questionType]);

    // Clear progress function
    const clearProgress = () => {
        clearGameProgress(gameId);
        setCurrentIndex(0);
        setFlipped(false);
        setQuestionType(null);
        setShowAnswer(false);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "ArrowRight") handleNext();
            if (e.key === "ArrowLeft") handlePrev();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    });

    if (cardData.length === 0) return <div>Loading...</div>;

    const currentCard = cardData[currentIndex];
    const borderColor = colors[currentIndex % colors.length];

    const handleQuestion = (type) => {
        setQuestionType(type);
        setFlipped(true);
        setShowAnswer(false);
    };


    return (
        <div className="scene-card-app">
            <HelpButton gameId={gameId} onStartOver={clearProgress} />
            <h1 className="scene-card-title">Scene Cards</h1>
            <button className="nav-arrow left" onClick={handlePrev}>❮</button>

            <div 
                ref={dragRef}
                className={`scene-card-container ${fadeClass}`}
                {...mouseHandlers}
                {...touchHandlers}
            >
                <div className={`scene-card-inner ${flipped ? "flipped" : ""}`} style={{ borderColor }}>
                    <div className="scene-card-front">
                        <img src={currentCard.image} alt="Scene" />
                        <p className="scene-sentence">{currentCard.sentence}</p>
                        <div className="category-id">{currentCard.id}</div>
                    </div>

                    <div className="scene-card-back">
                        <img src={currentCard.image} alt="Scene" />
                        <p className="scene-question">
                            {questionType && (
                                showAnswer
                                    ? currentCard.answers[questionType]
                                    : currentCard.questions[questionType]
                            )}
                        </p>
                        <div className="back-buttons-row">
                            <button
                                className="show-answer-btn"
                                style={{ backgroundColor: borderColor }}
                                onClick={() => setShowAnswer(prev => !prev)}
                            >
                                {showAnswer ? "Show Question" : "Show Answer"}
                            </button>
                            <button
                                className="flip-back-btn"
                                style={{ backgroundColor: borderColor }}
                                onClick={() => setFlipped(false)}
                            >
                                Flip Back
                            </button>
                        </div>
                        <div className="category-id">{currentCard.id}</div>
                    </div>
                </div>
            </div>

            <div className={`scene-buttons ${fadeClass}`} style={{ borderColor }}>
                {["who", "what", "when", "where"].map((type) => (
                    <button
                        key={type}
                        onClick={() => handleQuestion(type)}
                        className={questionType === type && flipped ? "active-question" : ""}
                        style={{
                            borderColor,
                            backgroundColor: questionType === type && flipped ? borderColor : "white",
                            color: questionType === type && flipped ? "white" : "black"
                        }}
                    >
                        {type.charAt(0).toUpperCase() + type.slice(1) + "?"}
                    </button>
                ))}
            </div>

            <button className="nav-arrow right" onClick={handleNext}>❯</button>
        </div>
    );
}

export default SceneCard;
