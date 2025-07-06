import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CardGrid from "./CardGrid";
import "./App.css";
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
        fetch("/comparisons.json")
            .then((res) => res.json())
            .then((data) => {
                setCategories(data);
                if (data.length > 0) {
                    setShuffledItems(shuffleArray(data[0].examples));
                    setBorderColor(colors[0]);
                }
            });
    }, []);

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
        <div className="app">
            <button className="back-button" onClick={() => navigate("/")}>Home</button>
            <h1 className="title">Compare & Contrast</h1>
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
                            variant="compare"
                        />
                        <div className="category-id">{currentCategory.id}</div>
                    </div>
                    <button className="nav-arrow right" onClick={handleNext}>❯</button>
                </>
            ) : (
                <p style={{ color: "white", fontFamily: "Poppins", fontSize: "1.2rem" }}>Loading comparisons...</p>
            )}
        </div>
    );
}

export default CompareContrast;
