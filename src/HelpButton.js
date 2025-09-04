import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./HelpButton.css";
import { clearGameProgress, hasGameProgress } from "./gameProgress";
import { colors } from "./colors";

function HelpButton({ gameId, onStartOver }) {
    const [showHelp, setShowHelp] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const [instructions, setInstructions] = useState(null);
    const [buttonColor, setButtonColor] = useState(colors[0]);
    const [hasProgress, setHasProgress] = useState(false);
    const navigate = useNavigate();

    const handleHelpClick = () => {
        // Check for progress each time the help menu is opened
        setHasProgress(hasGameProgress(gameId));
        setShowHelp(true);
    };

    const handleCloseHelp = () => {
        setShowHelp(false);
    };

    const handleViewInstructions = () => {
        // Check for progress when viewing instructions
        setHasProgress(hasGameProgress(gameId));
        setShowInstructions(true);
        setShowHelp(false);
    };

    const handleBackToHelp = () => {
        setShowInstructions(false);
        setShowHelp(true);
    };

    const handleResumeGame = () => {
        // Just close the instructions modal and return to the game
        setShowInstructions(false);
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
                    
                    // Check if there's saved progress for this game
                    setHasProgress(hasGameProgress(gameId));
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
                                onClick={handleResumeGame}
                                style={{ backgroundColor: buttonColor, border: 'none' }}
                            >
                                Resume
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
