import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./vocab.css";

const vocabColors = [
    "#f7d84b", "#ff9999", "#99ccff", "#99ff99",
    "#ffcc99", "#dda0dd", "#ff6666", "#66cccc"
];

function Vocabulary() {
    const [vocabItems, setVocabItems] = useState([]);
    const [currentVocabIndex, setCurrentVocabIndex] = useState(0);
    const [vocabBorderColor, setVocabBorderColor] = useState(vocabColors[0]);
    const [vocabFadeState, setVocabFadeState] = useState("vocab-fade-in-active");
    const [showQuestions, setShowQuestions] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(process.env.PUBLIC_URL + "/vocabulary.json")
            .then((res) => res.json())
            .then((data) => {
                setVocabItems(data);
                setVocabBorderColor(vocabColors[0]);
            })
            .catch((err) => {
                console.error("Failed to load vocabulary.json", err);
            });
    }, []);

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
        setShowQuestions(false);
        setShowAnswer(false);
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
        setShowQuestions(false);
        setShowAnswer(false);
        setCurrentQuestionIndex(0);
        setTimeout(() => {
            const prevIndex = (currentVocabIndex - 1 + vocabItems.length) % vocabItems.length;
            setCurrentVocabIndex(prevIndex);
            setVocabBorderColor(vocabColors[prevIndex % vocabColors.length]);
            setVocabFadeState("vocab-fade-in-active");
        }, 400);
    };

    const handleShowQuestions = () => {
        setShowQuestions(true);
        setShowAnswer(false);
        setCurrentQuestionIndex(0);
    };

    const handleShowAnswer = () => {
        setShowAnswer(true);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < vocabItems[currentVocabIndex].questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setShowAnswer(false);
        }
    };

    if (vocabItems.length === 0) {
        return (
            <div className="vocab-app">
                <button className="vocab-back-button" onClick={() => navigate("/")}>Home</button>
                <h1 className="vocab-title">Vocabulary</h1>
                <p className="vocab-loading-text">Loading...</p>
            </div>
        );
    }

    const currentVocabItem = vocabItems[currentVocabIndex];
    const currentQuestion = currentVocabItem.questions[currentQuestionIndex];

    return (
        <div className="vocab-app">
            <button className="vocab-back-button" onClick={() => navigate("/")}>Home</button>
            <h1 className="vocab-title">Vocabulary</h1>
            <button className="vocab-nav-arrow vocab-left" onClick={handlePrevVocab}>❮</button>
            <div className={`vocab-card-container ${vocabFadeState}`} style={{ borderColor: vocabBorderColor }}>
                <img
                    src={process.env.PUBLIC_URL + currentVocabItem.image}
                    alt={currentVocabItem.name}
                    className="vocab-card-image"
                />
                <div className="vocab-label">{currentVocabItem.name}</div>

                <button className="vocab-question-button" onClick={handleShowQuestions}>❓</button>

                {showQuestions && (
                    <div className="vocab-question-popup">
                        <p className="vocab-question-text">{currentQuestion.question}</p>
                        {!showAnswer ? (
                            <button className="vocab-answer-button" onClick={handleShowAnswer}>Show Answer</button>
                        ) : (
                            <p className="vocab-answer-text">{currentQuestion.answer}</p>
                        )}
                        {currentQuestionIndex < currentVocabItem.questions.length - 1 && (
                            <button className="vocab-next-question-button" onClick={handleNextQuestion}>Next Question</button>
                        )}
                    </div>
                )}
            </div>
            <button className="vocab-nav-arrow vocab-right" onClick={handleNextVocab}>❯</button>
        </div>
    );
}

export default Vocabulary;
