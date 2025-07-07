import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Compare.css";

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

function CompareContrast() {
    const [categories, setCategories] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [shuffledItems, setShuffledItems] = useState([]);
    const [borderColor, setBorderColor] = useState(colors[0]);
    const [fadeState, setFadeState] = useState("fade-in-active");

    const navigate = useNavigate();

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
            setFadeState("fade-in-active");
        }, 400);
    };

    const currentCategory = categories[currentIndex];

    return (
        <div className="compare-app">
            <button className="compare-back-button" onClick={() => navigate("/")}>Home</button>
            <h1 className="compare-title">Compare & Contrast</h1>
            {categories.length > 0 ? (
                <>
                    <button className="compare-nav-arrow left" onClick={handlePrev}>❮</button>
                    <div className={`compare-card-container ${fadeState}`} style={{ borderColor }}>
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
