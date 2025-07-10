import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Diamond.css";

const colors = [
    "#f7d84b", "#ff9999", "#99ccff", "#99ff99",
    "#ffcc99", "#dda0dd", "#ff6666", "#66cccc"
];

function FindTheDiamond() {
    const [cards, setCards] = useState([]);
    const [diamondIndex, setDiamondIndex] = useState(null);
    const [flippedIndexes, setFlippedIndexes] = useState([]);
    const [fadedIndexes, setFadedIndexes] = useState([]);
    const [hasWon, setHasWon] = useState(false);
    const [lock, setLock] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetch(process.env.PUBLIC_URL + "/diamond.json")
            .then((res) => res.json())
            .then((data) => {
                const shuffled = shuffleArray(data);
                const diamond = Math.floor(Math.random() * shuffled.length);
                setCards(shuffled);
                setDiamondIndex(diamond);
            });
    }, []);

    const shuffleArray = (array) => {
        return array
            .map((item) => ({ item, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ item }) => item);
    };

    const handleCardClick = (idx) => {
        if (flippedIndexes.includes(idx) || fadedIndexes.includes(idx) || hasWon || lock) return;

        setFlippedIndexes([...flippedIndexes, idx]);
        setLock(true);

        if (idx === diamondIndex) {
            setHasWon(true);
            setLock(false);
        } else {
            setTimeout(() => {
                setFlippedIndexes((prev) => prev.filter((i) => i !== idx));
                setTimeout(() => {
                    setFadedIndexes((prev) => [...prev, idx]);
                    setLock(false);
                }, 400);
            }, 1000);
        }
    };

    return (
        <div className="app">
            <button className="back-button" onClick={() => navigate("/")}>Home</button>
            <h1 className="title">Find the Diamond</h1>
            <div className="diamond-grid">
                {cards.map((card, idx) => (
                    <div
                        key={idx}
                        className={`diamond-card ${flippedIndexes.includes(idx) ? "flipped" : ""} ${fadedIndexes.includes(idx) ? "faded" : ""}`}
                        onClick={() => handleCardClick(idx)}
                    >
                        <div
                            className="diamond-card-inner"
                            style={{ borderColor: colors[idx % colors.length] }}
                        >
                            <div className="diamond-card-front">
                                <img src={card.image} alt={card.name} />
                            </div>
                            <div className="diamond-card-back">
                                {idx === diamondIndex ? (
                                    <img src="/images/diamond.jpg" alt="Diamond" />
                                ) : (
                                    <div style={{ width: "100%", height: "100%", background: "white" }}></div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {hasWon && <div className="winning-screen">You found the diamond!</div>}
        </div>
    );
}

export default FindTheDiamond;
