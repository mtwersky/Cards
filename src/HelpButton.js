import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./HelpButton.css";
import { clearGameProgress } from "./gameProgress";
import { colors } from "./colors";

function HelpButton({ gameId, onStartOver }) {
    const [showHelp, setShowHelp] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const [instructions, setInstructions] = useState(null);
    const [buttonColor, setButtonColor] = useState(colors[0]);
    const navigate = useNavigate();

    const handleHelpClick = () => {
        setShowHelp(true);
    };

    const handleCloseHelp = () => {
        setShowHelp(false);
    };

    const handleViewInstructions = () => {
        setShowInstructions(true);
        setShowHelp(false);
    };

    const handleBackToHelp = () => {
        setShowInstructions(false);
        setShowHelp(true);
    };

    const handleStartGame = () => {
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
            navigate(gameRoute, { state: { resume: true } });
        }
    };

    // Load instructions when component mounts
    useEffect(() => {
        fetch(process.env.PUBLIC_URL + "/gameInstructions.json")
            .then((res) => res.json())
            .then((data) => {
                if (data[gameId]) {
                    setInstructions(data[gameId]);
                    
                    // Assign different colors to different games
                    const colorMap = {
                        "what-doesnt-belong": colors[0],
                        "name-the-category": colors[1],
                        "matching": colors[2],
                        "compare-contrast": colors[3],
                        "vocabulary": colors[4],
                        "guess-the-missing": colors[5],
                        "sort-into-categories": colors[6],
                        "diamond": colors[7],
                        "scene-card": colors[0]
                    };
                    
                    const selectedColor = colorMap[gameId] || colors[0];
                    setButtonColor(selectedColor);
                }
            })
            .catch((error) => {
                console.error("Error loading instructions:", error);
            });
    }, [gameId]);

    const handleStartOver = () => {
        clearGameProgress(gameId);
        if (onStartOver) {
            onStartOver();
        }
        setShowHelp(false);
    };

    if (showInstructions && instructions) {
        return (
            <div className="help-overlay">
                <div className="help-modal help-instructions-modal">
                    <div className="help-content">
                        <h3 style={{ textAlign: 'center' }}>{instructions.title}</h3>
                        <p style={{ textAlign: 'center', marginBottom: '30px', lineHeight: '1.6' }}>
                            {instructions.instructions}
                        </p>
                        <div className="help-buttons">
                            <button 
                                className="help-button help-button-secondary" 
                                onClick={handleBackToHelp}
                            >
                                Back
                            </button>
                            <button 
                                className="help-button" 
                                onClick={handleStartGame}
                                style={{ backgroundColor: buttonColor, border: 'none' }}
                            >
                                Resume Game
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (showHelp) {
        return (
            <div className="help-overlay">
                <div className="help-modal">
                    <div className="help-content">
                        <h3 style={{ textAlign: 'center' }}>Need Help?</h3>
                        <p style={{ textAlign: 'center', marginBottom: '20px' }}>Choose an option below:</p>
                        <div className="help-buttons">
                            <button 
                                className="help-button help-button-secondary" 
                                onClick={handleCloseHelp}
                            >
                                Cancel
                            </button>
                            <button 
                                className="help-button" 
                                onClick={handleStartOver}
                                style={{ backgroundColor: buttonColor, border: 'none' }}
                            >
                                Start Over
                            </button>
                            <button 
                                className="help-button" 
                                onClick={handleViewInstructions}
                                style={{ backgroundColor: buttonColor, border: 'none' }}
                            >
                                View Instructions
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <button 
            className="help-button-icon" 
            onClick={handleHelpClick}
            title="Get Help"
        >
            ?
        </button>
    );
}

export default HelpButton;
