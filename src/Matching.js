import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

const colors = [
    "#f7d84b", "#ff9999", "#99ccff", "#99ff99",
    "#ffcc99", "#dda0dd", "#ff6666", "#66cccc"
];

function Matching() {
    const [grid1, setGrid1] = useState([]);
    const [grid2, setGrid2] = useState([]);
    const [flippedIndexes, setFlippedIndexes] = useState([]);
    const [matchedIndexes, setMatchedIndexes] = useState([]);
    const [overlays, setOverlays] = useState({});
    const [score, setScore] = useState(0);
    const [isBusy, setIsBusy] = useState(false);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [lockedGrid, setLockedGrid] = useState(null);
    const [selectedKey, setSelectedKey] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetch("/matches.json")
            .then((res) => res.json())
            .then((data) => {
                const firstHalf = data.map(pair => ({ ...pair.item1, pairId: pair.pairId }));
                const secondHalf = data.map(pair => ({ ...pair.item2, pairId: pair.pairId }));
                const shuffled1 = shuffleArray(firstHalf);
                const shuffled2 = shuffleArray(secondHalf);
                setGrid1(shuffled1);
                setGrid2(shuffled2);
            });
    }, []);

    const shuffleArray = (array) => {
        return array
            .map((item) => ({ item, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ item }) => item);
    };

    const handleCardClick = (index, grid) => {
        const key = `${grid}-${index}`;

        if (
            flippedIndexes.includes(key) ||
            matchedIndexes.includes(key) ||
            flippedIndexes.length === 2 ||
            isBusy
        ) {
            return;
        }

        if (flippedIndexes.length === 1 && lockedGrid === grid) return;

        const newFlipped = [...flippedIndexes, key];
        setFlippedIndexes(newFlipped);

        if (newFlipped.length === 1) {
            setLockedGrid(grid);
            setSelectedKey(key);
        }

        if (newFlipped.length === 2) {
            setIsBusy(true);
            const [firstKey, secondKey] = newFlipped;

            const [firstGrid, firstIdx] = firstKey.split("-");
            const [secondGrid, secondIdx] = secondKey.split("-");

            const firstCard = firstGrid === "g1" ? grid1[firstIdx] : grid2[firstIdx];
            const secondCard = secondGrid === "g1" ? grid1[secondIdx] : grid2[secondIdx];

            setTimeout(() => {
                if (firstCard.pairId === secondCard.pairId) {
                    setOverlays(prev => ({
                        ...prev,
                        [firstKey]: "check",
                        [secondKey]: "check"
                    }));

                    setTimeout(() => {
                        setMatchedIndexes(prev => [...prev, firstKey, secondKey]);
                        setTimeout(() => {
                            setMatchedPairs(prev => [...prev, [firstCard, secondCard]]);
                        }, 1000);
                        setScore((prev) => prev + 1);
                        setOverlays(prev => {
                            const newOverlays = { ...prev };
                            delete newOverlays[firstKey];
                            delete newOverlays[secondKey];
                            return newOverlays;
                        });
                        setFlippedIndexes([]);
                        setLockedGrid(null);
                        setSelectedKey(null);
                        setIsBusy(false);
                    }, 1000);
                } else {
                    setOverlays(prev => ({
                        ...prev,
                        [firstKey]: "cross",
                        [secondKey]: "cross"
                    }));

                    setTimeout(() => {
                        setOverlays(prev => {
                            const newOverlays = { ...prev };
                            delete newOverlays[firstKey];
                            delete newOverlays[secondKey];
                            return newOverlays;
                        });
                        setFlippedIndexes([]);
                        setLockedGrid(null);
                        setSelectedKey(null);
                        setIsBusy(false);
                    }, 1000);
                }
            }, 800);
        }
    };

    return (
        <div className="app">
            <button className="back-button" onClick={() => navigate("/")}>Home</button>
            <h1 className="title">Matching Pairs</h1>
            <div style={{ color: "white", fontFamily: "Poppins", fontSize: "1.3rem", marginBottom: "10px" }}>
                Score: {score}
            </div>
            <div className="two-grids">
                {[grid1, grid2].map((grid, gIdx) => {
                    const gridName = `g${gIdx + 1}`;

                    return (
                        <div key={gridName} className="big-matching-grid">
                            {grid.map((card, idx) => {
                                const key = `${gridName}-${idx}`;
                                const isFlipped = flippedIndexes.includes(key);
                                const isMatched = matchedIndexes.includes(key);

                                // Fade if: grid is locked, card is in that grid, and it's not the chosen card
                                let faded = false;
                                if (lockedGrid === gridName && selectedKey !== key) {
                                    faded = true;
                                }

                                return (
                                    <button
                                        key={key}
                                        className={`image-card ${isFlipped ? "flipped" : ""} ${isMatched ? "matched-disappear" : ""} ${faded ? "faded-card" : ""}`}
                                        onClick={() => handleCardClick(idx, gridName)}
                                    >
                                        <div
                                            className="card-inner"
                                            style={{
                                                borderColor: colors[idx % colors.length]
                                            }}
                                        >
                                            <div className="card-front">{idx + 1}</div>
                                            <div className="card-back">
                                                <img src={card.image} alt={card.name} className="matching-card-image" />
                                                {overlays[key] && (
                                                    <div className={`overlay ${overlays[key]}`}>
                                                        <img
                                                            src={
                                                                overlays[key] === "check"
                                                                    ? "/images/green-check.png"
                                                                    : "/images/red-x.png"
                                                            }
                                                            alt={overlays[key]}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
            <div className="matched-area">
                {matchedPairs.map((pair, i) => (
                    <div key={i} className="matched-pair fade-in-pair">
                        <img src={pair[0].image} alt={pair[0].name} className="matched-thumb" />
                        <img src={pair[1].image} alt={pair[1].name} className="matched-thumb" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Matching;
