import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./GameEnd.css";
import { colors } from "./colors";
import { clearGameProgress } from "./gameProgress";

function GameEnd() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get game data from navigation state
    const { gameName, score, totalQuestions, gameId } = location.state || {};
    
    const handleStartOver = () => {
        // Clear saved progress and navigate back to the same game to restart
        if (gameId) {
            clearGameProgress(gameId);
            
            // Map gameId to actual route paths
            const gameRoutes = {
                'what-doesnt-belong': '/whatdoesntbelong',
                'name-the-category': '/name-the-category',
                'matching': '/matching',
                'compare-contrast': '/compare-contrast',
                'guess-the-missing': '/guess-the-missing',
                'sort-into-categories': '/sort-into-categories',
                'vocabulary': '/vocabulary',
                'diamond': '/diamond',
                'scene-card': '/scene-card'
            };
            
            const route = gameRoutes[gameId];
            if (route) {
                navigate(route, { state: { restart: true } });
            }
        }
    };
    
    const handleGoHome = () => {
        navigate("/");
    };
    
    const getScoreMessage = () => {
        if (!score && score !== 0) return "Great job!";
        
        const percentage = totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;
        
        if (percentage >= 90) return "Outstanding!";
        if (percentage >= 80) return "Excellent work!";
        if (percentage >= 70) return "Well done!";
        if (percentage >= 60) return "Good job!";
        return "Keep practicing!";
    };
    
    const getGameColor = () => {
        // Map gameId to the same colors used in the home menu
        const gameColorMap = {
            'what-doesnt-belong': colors[0], // Lavender
            'name-the-category': colors[1], // Pink
            'matching': colors[2], // Purple
            'compare-contrast': colors[3], // Blue
            'vocabulary': colors[4], // Light purple
            'guess-the-missing': colors[5], // Pink
            'sort-into-categories': colors[6], // Lavender
            'diamond': colors[7], // Blue
            'scene-card': colors[0] // Lavender
        };
        
        return gameColorMap[gameId] || colors[0];
    };

    return (
        <div className="game-instructions-app">
            <div className="confetti-container">
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
            </div>
            <div className="game-instructions-modal">
                <div className="game-instructions-content">
                    <h1 className="game-instructions-title">{gameName || "Game"}</h1>
                    <h2 className="game-complete-subtitle">Complete!</h2>
                    
                    {/* Only show score box for certain games */}
                    {!['scene-card', 'compare-contrast', 'vocabulary', 'sort-into-categories'].includes(gameId) && (
                        <div className="score-section" style={{ borderColor: getGameColor() }}>
                            <div className="score-label">{['matching', 'diamond'].includes(gameId) ? 'Tries:' : 'Score:'}</div>
                            {score !== undefined && (
                                <div className="score-display">
                                    <div className="score-number">{score}</div>
                                    {!['matching', 'diamond'].includes(gameId) && (
                                        <div className="score-total">out of {totalQuestions}</div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    
                    <div className="button-container">
                        <button 
                            className="game-instructions-start-button" 
                            onClick={handleStartOver}
                            style={{ backgroundColor: getGameColor(), border: 'none' }}
                        >
                            Start Again
                        </button>
                        <button 
                            className="game-instructions-start-button" 
                            onClick={handleGoHome}
                            style={{ 
                                backgroundColor: "#f5f5f5", 
                                border: 'none',
                                color: "#666666"
                            }}
                        >
                            Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GameEnd;
