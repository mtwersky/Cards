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
                <div className="home-card" style={{ borderColor: colors[2] }}>Compare / Contrast</div>
                <div className="home-card" style={{ borderColor: colors[3] }}>Vocabulary</div>
                <div className="home-card" style={{ borderColor: colors[4] }}>Match Pairs</div>
                <div className="home-card" style={{ borderColor: colors[5] }}>Memory</div>
                <div className="home-card" style={{ borderColor: colors[6] }}>Find the Odd One</div>
                <div className="home-card" style={{ borderColor: colors[7] }}>Sorting Game</div>
            </div>
        </div>
    );
}

export default Home;
