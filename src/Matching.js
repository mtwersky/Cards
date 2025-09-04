import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Matching.css";
import { colors } from "./colors";
import HelpButton from "./HelpButton";
import { saveGameProgress, getGameProgress, clearGameProgress } from "./gameProgress";

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
    const location = useLocation();
    const gameId = "matching";

    useEffect(() => {
        fetch(process.env.PUBLIC_URL + "/matches.json")
            .then((res) => res.json())
            .then((data) => {
                const selectedPairs = shuffleArray(data).slice(0, 9);
                const firstHalf = selectedPairs.map((pair, index) => ({ ...pair.item1, pairId: index }));
                const secondHalf = selectedPairs.map((pair, index) => ({ ...pair.item2, pairId: index }));
                
                // Shuffle each grid but preserve pairId
                const shuffledFirstHalf = shuffleArray(firstHalf);
                const shuffledSecondHalf = shuffleArray(secondHalf);
                
                setGrid1(shuffledFirstHalf);
                setGrid2(shuffledSecondHalf);
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
                        const pairColor = colors[firstCard.pairId % colors.length];
                        setMatchedPairs(prev => [
                            ...prev,
                            [
                                { ...firstCard, borderColor: pairColor },
                                { ...secondCard, borderColor: pairColor }
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

    // Clear progress function
    const clearProgress = () => {
        clearGameProgress(gameId);
        // Reset game state
        setRevealedIndexes([]);
        setMatchedIndexes([]);
        setMatchedPairs([]);
        setScore(0);
        setLockedGrid(null);
        setSelectedKey(null);
        setIsBusy(false);
        
        // Reload fresh data and shuffle
        fetch(process.env.PUBLIC_URL + "/matches.json")
            .then((res) => res.json())
            .then((data) => {
                const selectedPairs = shuffleArray(data).slice(0, 9);
                const firstHalf = selectedPairs.map((pair, index) => ({ ...pair.item1, pairId: index }));
                const secondHalf = selectedPairs.map((pair, index) => ({ ...pair.item2, pairId: index }));
                
                // Shuffle each grid but preserve pairId
                const shuffledFirstHalf = shuffleArray(firstHalf);
                const shuffledSecondHalf = shuffleArray(secondHalf);
                
                setGrid1(shuffledFirstHalf);
                setGrid2(shuffledSecondHalf);
            });
    };

    return (
        <div className="app">
            <HelpButton gameId={gameId} onStartOver={clearProgress} />
            <h1 className="title">Match the Pairs</h1>
            <div style={{ color: "#333333", fontSize: "1.3rem", marginBottom: "10px" }}>
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
                                            className={`simple-card-inner-with-border ${isMatched ? 'matched-pair' : ''}`}
                                            style={{ 
                                                borderColor: isMatched 
                                                    ? colors[card.pairId % colors.length]
                                                    : gridName === 'g1' 
                                                        ? colors[idx % colors.length] 
                                                        : colors[(idx + 4) % colors.length]
                                            }}
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
                            style={{ borderColor: colors[pair[0].pairId % colors.length] }}
                        />
                        <img
                            src={pair[1].image}
                            alt={pair[1].name}
                            className="matched-thumb"
                            style={{ borderColor: colors[pair[0].pairId % colors.length] }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Matching;
