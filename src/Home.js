import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { colors } from "./colors";

function Home() {
    const navigate = useNavigate();

    return (
        <div className="home-app">
            <h1 className="home-title">Category Cards</h1>
            <div className="home-grid">
                <div
                    className="home-card"
                    style={{ borderColor: colors[0] }}
                    onClick={() => navigate("/instructions/what-doesnt-belong")}
                >
                    What doesn't belong?
                </div>
                <div
                    className="home-card"
                    style={{ borderColor: colors[1] }}
                    onClick={() => navigate("/instructions/name-the-category")}
                >
                    Name the Category
                </div>
                <div
                    className="home-card"
                    style={{ borderColor: colors[2] }}
                    onClick={() => navigate("/instructions/matching")}
                >
                    Match the Pairs
                </div>
                <div
                    className="home-card"
                    style={{ borderColor: colors[3] }}
                    onClick={() => navigate("/instructions/compare-contrast")}
                >
                    Compare / Contrast
                </div>
                <div
                    className="home-card"
                    style={{ borderColor: colors[4] }}
                    onClick={() => navigate("/instructions/vocabulary")}
                >
                    Expressive Language
                </div>
                <div
                    className="home-card"
                    style={{ borderColor: colors[5] }}
                    onClick={() => navigate("/instructions/guess-the-missing")}
                >
                    Guess the Missing Item
                </div>
                <div
                    className="home-card"
                    style={{ borderColor: colors[6] }}
                    onClick={() => navigate("/instructions/sort-into-categories")}
                >
                    Sort into Categories
                </div>
                <div
                    className="home-card"
                    style={{ borderColor: colors[7] }}
                    onClick={() => navigate("/instructions/diamond")}
                >
                    Find the Diamond
                </div>
                <div
                    className="home-card"
                    style={{ borderColor: colors[0] }}
                    onClick={() => navigate("/instructions/scene-card")}
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
