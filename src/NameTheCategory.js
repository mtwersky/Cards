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

function NameTheCategory() {
    const [categories, setCategories] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [shuffledItems, setShuffledItems] = useState([]);
    const [borderColor, setBorderColor] = useState(colors[0]);
    const [showAnswer, setShowAnswer] = useState(false);
    const [fadeState, setFadeState] = useState("fade-in-active");
    const [score, setScore] = useState(() => {
        const saved = localStorage.getItem("ntc-score");
        return saved ? parseInt(saved) : 0;
    });

    const navigate = useNavigate();

    useEffect(() => {
        fetch("/categories.json")
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
        localStorage.setItem("ntc-score", score.toString());
    }, [score]);

    const shuffleArray = (array) => {
        return array
            .map((item) => ({ item, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ item }) => item);
    };

    const handleNext = () => {
        setFadeState("fade-out");
        setTimeout(() => {
            const nextIndex = (currentIndex + 1) % categories.length;
            setCurrentIndex(nextIndex);
            setShuffledItems(shuffleArray(categories[nextIndex].examples));
            setBorderColor(colors[nextIndex % colors.length]);
            setShowAnswer(false);
            setFadeState("fade-in-active");
        }, 400);
    };

    const handlePrev = () => {
        setFadeState("fade-out");
        setTimeout(() => {
            const prevIndex = (currentIndex - 1 + categories.length) % categories.length;
            setCurrentIndex(prevIndex);
            setShuffledItems(shuffleArray(categories[prevIndex].examples));
            setBorderColor(colors[prevIndex % colors.length]);
            setShowAnswer(false);
            setFadeState("fade-in-active");
        }, 400);
    };

    const handleMarkCorrect = () => {
        setScore((prev) => prev + 1);
        setShowAnswer(false);
    };

    const handleMarkIncorrect = () => {
        setShowAnswer(false);
    };

    const currentCategory = categories[currentIndex];

    return (
        <div className="app">
            <button className="back-button" onClick={() => navigate("/")}>Home</button>
            <h1 className="title">Name the Category</h1>
            <div style={{ color: "white", fontFamily: "Poppins", fontSize: "1.2rem", marginBottom: "10px" }}>
                Score: {score}
            </div>
            {categories.length > 0 ? (
                <>
                    <button className="nav-arrow left" onClick={handlePrev}>❮</button>
                    <div className={`card-container ${fadeState}`} style={{ borderColor }}>
                        <CardGrid
                            items={shuffledItems}
                            overlays={{}}
                            disabledItems={{}}
                            lastLockedIndex={null}
                            onCardClick={() => { }}
                            highlightIndex={null}
                            isLocking={true}
                            onNext={handleNext}
                            onPrev={handlePrev}
                            categoryId={currentCategory.id}
                        />
                        <div className="category-id">{currentCategory.id}</div>
                    </div>
                    <div style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <button
                            className="answer-button"
                            style={{ backgroundColor: borderColor }}
                            onClick={() => setShowAnswer(true)}
                        >
                            {showAnswer ? currentCategory.name : "Answer"}
                        </button>
                        {showAnswer && (
                            <>
                                <button className="answer-button" onClick={handleMarkCorrect}>✅</button>
                                <button className="answer-button" onClick={handleMarkIncorrect}>❌</button>
                            </>
                        )}
                    </div>
                    <button className="nav-arrow right" onClick={handleNext}>❯</button>
                </>
            ) : (
                <p style={{ color: "white", fontFamily: "Poppins", fontSize: "1.2rem" }}>Loading categories...</p>
            )}
        </div>
    );
}

export default NameTheCategory;
