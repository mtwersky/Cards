import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

const colors = [
    "#f7d84b", "#ff9999", "#99ccff", "#99ff99",
    "#ffcc99", "#dda0dd", "#ff6666", "#66cccc"
];

function Matching() {
    const [cards, setCards] = useState([]);
    const [flippedIndexes, setFlippedIndexes] = useState([]);
    const [matchedIndexes, setMatchedIndexes] = useState([]);
    const [overlays, setOverlays] = useState({});
    const [score, setScore] = useState(0);
    const [isBusy, setIsBusy] = useState(false);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [borderColor, setBorderColor] = useState(colors[0]);

    const navigate = useNavigate();

    useEffect(() => {
        fetch("/matches.json")
            .then((res) => res.json())
            .then((data) => {
                const items = data.flatMap(pair => [
                    { ...pair.item1, pairId: pair.pairId },
                    { ...pair.item2, pairId: pair.pairId }
                ]);
                const shuffled = shuffleArray(items);
                setCards(shuffled);
                setBorderColor(colors[Math.floor(Math.random() * colors.length)]);
            });
    }, []);

    const shuffleArray = (array) => {
        return array
            .map((item) => ({ item, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ item }) => item);
    };

    const handleCardClick = (index) => {
        if (
            flippedIndexes.includes(index) ||
            matchedIndexes.includes(index) ||
            flippedIndexes.length === 2 ||
            isBusy
        ) {
            return;
        }

        const newFlipped = [...flippedIndexes, index];
        setFlippedIndexes(newFlipped);

        if (newFlipped.length === 2) {
            setIsBusy(true);

            const [firstIdx, secondIdx] = newFlipped;
            const firstCard = cards[firstIdx];
            const secondCard = cards[secondIdx];

            setTimeout(() => {
                if (firstCard.pairId === secondCard.pairId) {
                    setOverlays(prev => ({
                        ...prev,
                        [firstIdx]: "check",
                        [secondIdx]: "check"
                    }));

                    setTimeout(() => {
                        setMatchedIndexes(prev => [...prev, firstIdx, secondIdx]);
                        setMatchedPairs(prev => [...prev, [firstCard, secondCard]]);
                        setScore((prev) => prev + 1);
                        setOverlays(prev => {
                            const newOverlays = { ...prev };
                            delete newOverlays[firstIdx];
                            delete newOverlays[secondIdx];
                            return newOverlays;
                        });
                        setFlippedIndexes([]);
                        setIsBusy(false);
                    }, 700);
                } else {
                    setOverlays(prev => ({
                        ...prev,
                        [firstIdx]: "cross",
                        [secondIdx]: "cross"
                    }));

                    setTimeout(() => {
                        setOverlays(prev => {
                            const newOverlays = { ...prev };
                            delete newOverlays[firstIdx];
                            delete newOverlays[secondIdx];
                            return newOverlays;
                        });
                        setFlippedIndexes([]);
                        setIsBusy(false);
                    }, 700);
                }
            }, 800); // show choices first
        }
    };

    return (
        <div className="app">
            <button className="back-button" onClick={() => navigate("/")}>Home</button>
            <h1 className="title">Matching Game</h1>
            <div style={{ color: "white", fontFamily: "Poppins", fontSize: "1.2rem", marginBottom: "10px" }}>
                Score (pairs): {score}
            </div>
            <div className="matching-grid">
                {cards.map((card, idx) => {
                    if (matchedIndexes.includes(idx)) return null;

                    const isFlipped = flippedIndexes.includes(idx) || matchedIndexes.includes(idx);

                    return (
                        <button
                            key={idx}
                            className="image-card"
                            onClick={() => handleCardClick(idx)}
                            style={{ borderColor }}
                        >
                            {isFlipped ? (
                                <>
                                    <img src={card.image} alt={card.name} className="matching-card-image" />
                                    {overlays[idx] && (
                                        <div className={`overlay ${overlays[idx]}`}>
                                            <img
                                                src={
                                                    overlays[idx] === "check"
                                                        ? "/images/green-check.png"
                                                        : "/images/red-x.png"
                                                }
                                                alt={overlays[idx]}
                                            />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="matching-card-front">
                                    {idx + 1}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
            <div className="matched-area">
                {matchedPairs.map((pair, i) => (
                    <div key={i} className="matched-pair">
                        <img src={pair[0].image} alt={pair[0].name} className="matched-thumb" />
                        <img src={pair[1].image} alt={pair[1].name} className="matched-thumb" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Matching;
