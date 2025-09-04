import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./GameInstructions.css";
import { colors } from "./colors";
import { hasGameProgress } from "./gameProgress";

function GameInstructions() {
    const [instructions, setInstructions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [buttonColor, setButtonColor] = useState(colors[0]);
    const [hasProgress, setHasProgress] = useState(false);
    const navigate = useNavigate();
    const { gameId } = useParams();

    useEffect(() => {
        fetch(process.env.PUBLIC_URL + "/gameInstructions.json")
            .then((res) => res.json())
            .then((data) => {
                if (data[gameId]) {
                    setInstructions(data[gameId]);
                    
                    // Assign different colors to different games
                    const colorMap = {
                        "what-doesnt-belong": colors[0], // #e6b3ff
                        "name-the-category": colors[1], // #f0b3ff
                        "matching": colors[2], // #d4b3ff
                        "compare-contrast": colors[3], // #c7a3ff
                        "vocabulary": colors[4], // #b893ff
                        "guess-the-missing": colors[5], // #a883ff
                        "sort-into-categories": colors[6], // #9883ff
                        "diamond": colors[7], // #8883ff
                        "scene-card": colors[0] // #e6b3ff
                    };
                    
                    const selectedColor = colorMap[gameId] || colors[0];
                    setButtonColor(selectedColor);
                    
                    // Check if there's saved progress for this game
                    setHasProgress(hasGameProgress(gameId));
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error loading instructions:", error);
                setLoading(false);
            });
    }, [gameId]);

    const handleStart = () => {
        // Navigate to the actual game
        const gameRoutes = {
            "what-doesnt-belong": "/whatdoesntbelong",
            "name-the-category": "/name-the-category",
            "matching": "/matching",
            "compare-contrast": "/compare-contrast",
            "guess-the-missing": "/guess-the-missing",
            "sort-into-categories": "/sort-into-categories",
            "vocabulary": "/vocabulary",
            "diamond": "/diamond",
            "scene-card": "/scene-card"
        };
        
        const gameRoute = gameRoutes[gameId];
        if (gameRoute) {
            // If there's progress, navigate with a flag to indicate resume
            if (hasProgress) {
                navigate(gameRoute, { state: { resume: true } });
            } else {
                navigate(gameRoute);
            }
        }
    };

    if (loading) {
        return (
            <div className="game-instructions-app">
                <div className="game-instructions-loading">Loading...</div>
            </div>
        );
    }

    if (!instructions) {
        return (
            <div className="game-instructions-app">
                <div className="game-instructions-error">Game not found</div>
            </div>
        );
    }

    return (
        <div className="game-instructions-app">
            <div className="game-instructions-modal">
                <div className="game-instructions-content">
                    <h1 className="game-instructions-title">{instructions.title}</h1>
                    <p className="game-instructions-text">
                        {instructions.instructions}
                    </p>
                    <button 
                        className="game-instructions-start-button" 
                        onClick={handleStart}
                        style={{ backgroundColor: buttonColor, border: 'none' }}
                    >
                        {hasProgress ? 'Resume' : 'Start'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default GameInstructions;
