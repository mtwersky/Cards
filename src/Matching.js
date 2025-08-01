import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Matching.css";

const colors = [
    "#f7d84b", "#ff9999", "#99ccff", "#99ff99",
    "#ffcc99", "#dda0dd", "#ff6666", "#66cccc"
];

function Matching() {
    const [grid1, setGrid1] = useState([]);
    const [grid2, setGrid2] = useState([]);
    const [revealedIndexes, setRevealedIndexes] = useState([]);
    const [matchedIndexes, setMatchedIndexes] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [score, setScore] = useState(0);
    const [lockedGrid, setLockedGrid] = useState(null);
    const [selectedKey, setSelectedKey] = useState(null);
    const [isBusy, setIsBusy] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetch(process.env.PUBLIC_URL + "/matches.json")
            .then((res) => res.json())
            .then((data) => {
                const selectedPairs = shuffleArray(data).slice(0, 9);
                const firstHalf = selectedPairs.map(pair => ({ ...pair.item1, pairId: pair.pairId }));
                const secondHalf = selectedPairs.map(pair => ({ ...pair.item2, pairId: pair.pairId }));
                setGrid1(shuffleArray(firstHalf));
                setGrid2(shuffleArray(secondHalf));
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
            revealedIndexes.includes(key) ||
            matchedIndexes.includes(key) ||
            revealedIndexes.length === 2 ||
            isBusy
        ) {
            return;
        }

        if (revealedIndexes.length === 1 && lockedGrid === grid) return;

        const newRevealed = [...revealedIndexes, key];
        setRevealedIndexes(newRevealed);

        if (newRevealed.length === 1) {
            setLockedGrid(grid);
            setSelectedKey(key);
        }

        if (newRevealed.length === 2) {
            setIsBusy(true);
            const [firstKey, secondKey] = newRevealed;
            const [firstGrid, firstIdx] = firstKey.split("-");
            const [secondGrid, secondIdx] = secondKey.split("-");

            const firstCard = firstGrid === "g1" ? grid1[firstIdx] : grid2[firstIdx];
            const secondCard = secondGrid === "g1" ? grid1[secondIdx] : grid2[secondIdx];

            setTimeout(() => {
                if (firstCard.pairId === secondCard.pairId) {
                    setMatchedIndexes(prev => [...prev, firstKey, secondKey]);
                    setScore(prev => prev + 1);
                    setTimeout(() => {
                        setMatchedPairs(prev => [
                            ...prev,
                            [
                                { ...firstCard, borderColor: colors[firstIdx % colors.length] },
                                { ...secondCard, borderColor: colors[secondIdx % colors.length] }
                            ]
                        ]);
                    }, 1000);
                }
                setRevealedIndexes([]);
                setLockedGrid(null);
                setSelectedKey(null);
                setIsBusy(false);
            }, 1000);
        }
    };

    return (
        <div className="app">
            <button className="back-button" onClick={() => navigate("/")}>Home</button>
            <h1 className="title">Match the Pairs</h1>
            <div style={{ color: "white", fontSize: "1.3rem", marginBottom: "10px" }}>
                Score: {score}
            </div>
            <div className="grid-wrapper-container">
                {[grid1, grid2].map((grid, gIdx) => {
                    const gridName = `g${gIdx + 1}`;

                    return (
                        <div key={gridName} className="grid-wrapper">
                            {grid.map((card, idx) => {
                                const key = `${gridName}-${idx}`;
                                const isRevealed = revealedIndexes.includes(key) || matchedIndexes.includes(key);
                                const isMatched = matchedIndexes.includes(key);

                                let faded = false;
                                if (lockedGrid === gridName && selectedKey !== key) {
                                    faded = true;
                                }

                                return (
                                    <button
                                        key={key}
                                        onClick={() => handleCardClick(idx, gridName)}
                                        className={`simple-card ${isRevealed ? "flipped" : ""} ${isMatched ? "matched-disappear" : ""} ${faded ? "faded" : ""}`}
                                    >
                                        <div
                                            className="simple-card-inner-with-border"
                                            style={{ borderColor: colors[idx % colors.length] }}
                                        >
                                            <div className="simple-card-front">{idx + 1}</div>
                                            <div className="simple-card-back">
                                                <img src={card.image} alt={card.name} />
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
                        <img
                            src={pair[0].image}
                            alt={pair[0].name}
                            className="matched-thumb"
                            style={{ borderColor: pair[0].borderColor }}
                        />
                        <img
                            src={pair[1].image}
                            alt={pair[1].name}
                            className="matched-thumb"
                            style={{ borderColor: pair[1].borderColor }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Matching;
