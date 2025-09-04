import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { colors } from "./colors";
import { hasGameProgress } from "./gameProgress";

function Home() {
    const navigate = useNavigate();

    const handleGameClick = (gameId) => {
        // Check if there's saved progress for this game
        if (hasGameProgress(gameId)) {
            // Go directly to the game if there's saved progress
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
            navigate(gameRoutes[gameId] || `/instructions/${gameId}`);
        } else {
            // Go to instructions if no saved progress
            navigate(`/instructions/${gameId}`);
        }
    };

    return (
        <div className="home-app">
            <h1 className="home-title">Category Cards</h1>
            <div className="home-grid">
                <div
                    className="home-card"
                    style={{ borderColor: colors[0] }}
                    onClick={() => handleGameClick("what-doesnt-belong")}
                >
                    What doesn't belong?
                </div>
                <div
                    className="home-card"
                    style={{ borderColor: colors[1] }}
                    onClick={() => handleGameClick("name-the-category")}
                >
                    Name the Category
                </div>
                <div
                    className="home-card"
                    style={{ borderColor: colors[2] }}
                    onClick={() => handleGameClick("matching")}
                >
                    Match the Pairs
                </div>
                <div
                    className="home-card"
                    style={{ borderColor: colors[3] }}
                    onClick={() => handleGameClick("compare-contrast")}
                >
                    Compare / Contrast
                </div>
                <div
                    className="home-card"
                    style={{ borderColor: colors[4] }}
                    onClick={() => handleGameClick("vocabulary")}
                >
                    Expressive Language
                </div>
                <div
                    className="home-card"
                    style={{ borderColor: colors[5] }}
                    onClick={() => handleGameClick("guess-the-missing")}
                >
                    Guess the Missing Item
                </div>
                <div
                    className="home-card"
                    style={{ borderColor: colors[6] }}
                    onClick={() => handleGameClick("sort-into-categories")}
                >
                    Sort into Categories
                </div>
                <div
                    className="home-card"
                    style={{ borderColor: colors[7] }}
                    onClick={() => handleGameClick("diamond")}
                >
                    Find the Diamond
                </div>
                <div
                    className="home-card"
                    style={{ borderColor: colors[0] }}
                    onClick={() => handleGameClick("scene-card")}
                >
                    Scene Cards
                </div>
                <div
                    className="home-card"
                    style={{ borderColor: colors[1] }}
                    onClick={() => navigate("")}
                >
                    x
                </div>
              
            </div>
        </div>
    );
}

export default Home;
