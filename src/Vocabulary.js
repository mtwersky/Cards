import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./vocab.css";
import { colors as vocabColors } from "./colors";
import HelpButton from "./HelpButton";
import { saveGameProgress, getGameProgress, clearGameProgress } from "./gameProgress";

const questions = [
    "What is it?",
    "Give me three describing words.",
    "Things that go with it?",
    "What category is it in?",
    "Name other things in the category."
];

function Vocabulary() {
    const [vocabItems, setVocabItems] = useState([]);
    const [currentVocabIndex, setCurrentVocabIndex] = useState(0);
    const [vocabBorderColor, setVocabBorderColor] = useState(vocabColors[0]);
    const [vocabFadeState, setVocabFadeState] = useState("vocab-fade-in-active");
    const [isFlipped, setIsFlipped] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();
    const gameId = "vocabulary";

    useEffect(() => {
        fetch(process.env.PUBLIC_URL + "/vocabulary.json")
            .then((res) => res.json())
            .then((data) => {
                setVocabItems(data);
                
                // Check for saved progress
                const savedProgress = getGameProgress(gameId);
                if (savedProgress && (location.state?.resume || !location.state)) {
                    setCurrentVocabIndex(savedProgress.currentIndex || 0);
                    setVocabBorderColor(vocabColors[(savedProgress.currentIndex || 0) % vocabColors.length]);
                } else {
                    setVocabBorderColor(vocabColors[0]);
                }
            })
            .catch((err) => {
                console.error("Failed to load vocabulary.json", err);
            });
    }, [location.state]);

    // Save progress whenever currentIndex changes
    useEffect(() => {
        if (vocabItems.length > 0 && currentVocabIndex >= 0) {
            saveGameProgress(gameId, {
                currentIndex: currentVocabIndex
            });
        }
    }, [currentVocabIndex, vocabItems.length, gameId]);

    // Clear progress function
    const clearProgress = () => {
        clearGameProgress(gameId);
        setCurrentVocabIndex(0);
        setVocabBorderColor(vocabColors[0]);
        setIsFlipped(false);
        setCurrentQuestionIndex(0);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "ArrowRight") handleNextVocab();
            if (e.key === "ArrowLeft") handlePrevVocab();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    });

    const handleNextVocab = () => {
        setVocabFadeState("vocab-fade-out");
        setIsFlipped(false);
        setCurrentQuestionIndex(0);
        setTimeout(() => {
            const nextIndex = (currentVocabIndex + 1) % vocabItems.length;
            setCurrentVocabIndex(nextIndex);
            setVocabBorderColor(vocabColors[nextIndex % vocabColors.length]);
            setVocabFadeState("vocab-fade-in-active");
        }, 400);
    };

    const handlePrevVocab = () => {
        setVocabFadeState("vocab-fade-out");
        setIsFlipped(false);
        setCurrentQuestionIndex(0);
        setTimeout(() => {
            const prevIndex = (currentVocabIndex - 1 + vocabItems.length) % vocabItems.length;
            setCurrentVocabIndex(prevIndex);
            setVocabBorderColor(vocabColors[prevIndex % vocabColors.length]);
            setVocabFadeState("vocab-fade-in-active");
        }, 400);
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
        setCurrentQuestionIndex(0);
    };

    const handleNextQuestionOrCard = (e) => {
        e.stopPropagation();
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            handleNextVocab();
        }
    };

    if (vocabItems.length === 0) {
        return (
            <div className="vocab-app">
                <h1 className="vocab-title">Vocabulary</h1>
                <p className="vocab-loading-text">Loading...</p>
            </div>
        );
    }

    const currentVocabItem = vocabItems[currentVocabIndex];
    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="vocab-app">
            <HelpButton gameId={gameId} onStartOver={clearProgress} />
            <h1 className="vocab-title">Expressive Language</h1>
            <button className="vocab-nav-arrow vocab-left" onClick={handlePrevVocab}>❮</button>

            <div className={`vocab-card-container ${vocabFadeState}`}>
                <div
                    className={`vocab-card-inner ${isFlipped ? "vocab-flipped" : ""}`}
                    style={{ borderColor: vocabBorderColor }}
                >
                    <div className="vocab-card-front" onClick={handleFlip} title="Click to flip for prompts">
                        <img
                            src={process.env.PUBLIC_URL + currentVocabItem.image}
                            alt={currentVocabItem.name}
                            className="vocab-card-image"
                        />
                        <div className="vocab-category-id">{currentVocabItem.id}</div>
                    </div>

                    <div className="vocab-card-back" onClick={handleFlip} title="Click to flip back">
                        <p className="vocab-question-text">{currentQuestion}</p>
                        <img
                            src={process.env.PUBLIC_URL + currentVocabItem.image}
                            alt={currentVocabItem.name}
                            className="vocab-card-back-image"
                        />
                        <div className="vocab-buttons-row" style={{ borderColor: vocabBorderColor }}>
                            <button
                                className="vocab-solid-button"
                                onClick={handleNextQuestionOrCard}
                                style={{ backgroundColor: vocabBorderColor }}
                            >
                                {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Next Card"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <button className="vocab-nav-arrow vocab-right" onClick={handleNextVocab}>❯</button>
        </div>
    );
}

export default Vocabulary;
