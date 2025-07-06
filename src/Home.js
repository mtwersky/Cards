import React from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

const colors = [
    "#f7d84b", // yellow
    "#ff9999", // pink
    "#99ccff", // blue
    "#99ff99", // light green
    "#ffcc99", // peach
    "#dda0dd", // purple
    "#ff6666", // red
    "#66cccc"  // teal
];

function Home() {
    const navigate = useNavigate();

    return (
        <div className="app">
            <h1 className="title">Category Games</h1>
            <div className="home-grid">
                <div
                    className="home-card"
                    style={{ borderColor: colors[0] }}
                    onClick={() => navigate("/what-doesnt-belong")}
                >
                    What doesn't belong?
                </div>
                <div
                    className="home-card"
                    style={{ borderColor: colors[1] }}
                    onClick={() => navigate("/name-the-category")}
                >
                    Name the Category
                </div>
                <div
                    className="home-card"
                    style={{ borderColor: colors[2] }}
                    onClick={() => navigate("/matching")}
                >
                    Match the Pairs
                </div>
                <div
                    className="home-card"
                    style={{ borderColor: colors[3] }}
                    onClick={() => navigate("/compare-contrast")}
                >
                    Compare / Contrast
                </div>
                <div className="home-card" style={{ borderColor: colors[4] }} onClick={() => navigate("/ordering")}>
                    Order the Items
                </div>
                <div className="home-card" style={{ borderColor: colors[5] }} onClick={() => navigate("/guess-the-missing")}>
                    Guess the Missing Item
                </div>
                <div className="home-card" style={{ borderColor: colors[5] }}>x</div>
                <div className="home-card" style={{ borderColor: colors[6] }}>x</div>

            </div>
        </div>
    );
}

export default Home;
