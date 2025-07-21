import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SceneCard.css";

const colors = [
    "#f7d84b", "#ff9999", "#99ccff", "#99ff99",
    "#ffcc99", "#dda0dd", "#ff6666", "#66cccc"
];

function SceneCard() {
    const [cardData, setCardData] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [questionType, setQuestionType] = useState(null);
    const [showAnswer, setShowAnswer] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetch("/sceneCard.json")
            .then((res) => res.json())
            .then((data) => setCardData(data));
    }, []);

    if (cardData.length === 0) return <div>Loading...</div>;

    const currentCard = cardData[currentIndex];
    const borderColor = colors[currentIndex % colors.length];

    const handleQuestion = (type) => {
        setQuestionType(type);
        setFlipped(true);
        setShowAnswer(false);
    };

    const handleNext = () => {
        setFlipped(false);
        setQuestionType(null);
        setShowAnswer(false);
        setCurrentIndex((prev) => (prev + 1) % cardData.length);
    };

    const handlePrev = () => {
        setFlipped(false);
        setQuestionType(null);
        setShowAnswer(false);
        setCurrentIndex((prev) => (prev - 1 + cardData.length) % cardData.length);
    };

    const prettyLabel = (type) => {
        return {
            who: "Who?",
            what: "What?",
            when: "When?",
            where: "Where?"
        }[type];
    };

    return (
        <div className="scene-card-app">
            <button className="back-button" onClick={() => navigate("/")}>Home</button>
            <button className="nav-arrow left" onClick={handlePrev}>❮</button>

            <div className={`scene-card ${flipped ? "flipped" : ""}`} style={{ borderColor }}>
                <div className="scene-card-front">
                    <img src={currentCard.image} alt="Scene" />
                    <p className="scene-sentence">{currentCard.sentence}</p>
                </div>

                <div className="scene-card-back">
                    <img src={currentCard.image} alt="Scene" />
                    <p className="scene-question">
                        {questionType && prettyLabel(questionType)}
                    </p>
                    {showAnswer ? (
                        <p className="scene-answer">{currentCard.answers[questionType]}</p>
                    ) : null}

                    <div className="back-buttons-row">
                        {!showAnswer && (
                            <button
                                className="show-answer-btn"
                                style={{ backgroundColor: borderColor }}
                                onClick={() => setShowAnswer(true)}
                            >
                                Show Answer
                            </button>
                        )}
                        <button
                            className="flip-back-btn"
                            style={{ backgroundColor: borderColor }}
                            onClick={() => setFlipped(false)}
                        >
                            Flip Back
                        </button>
                    </div>
                </div>

                <div className="category-id">{currentCard.id}</div>
            </div>

            <div className="scene-buttons" style={{ borderColor }}>
                {["who", "what", "when", "where"].map((type) => (
                    <button
                        key={type}
                        onClick={() => handleQuestion(type)}
                        style={{ borderColor }}
                    >
                        {prettyLabel(type)}
                    </button>
                ))}
            </div>

            <button className="nav-arrow right" onClick={handleNext}>❯</button>
        </div>
    );
}

export default SceneCard;
