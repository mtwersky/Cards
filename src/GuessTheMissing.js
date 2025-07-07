import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./gtm.css";

const colors = [
    "#f7d84b", "#ff9999", "#99ccff", "#99ff99",
    "#ffcc99", "#dda0dd", "#ff6666", "#66cccc"
];

function GuessTheMissing() {
    const [categories, setCategories] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [displayItems, setDisplayItems] = useState([]);
    const [choices, setChoices] = useState([]);
    const [borderColor, setBorderColor] = useState(colors[0]);
    const [selectedIdx, setSelectedIdx] = useState(null);
    const [correctIdx, setCorrectIdx] = useState(null);
    const [overlays, setOverlays] = useState({});
    const [disabledChoices, setDisabledChoices] = useState({});
    const [fadeState, setFadeState] = useState("fade-in-active");
    const [slotFadeInIdx, setSlotFadeInIdx] = useState(null);
    const [score, setScore] = useState(0);
    const [hasTriedWrong, setHasTriedWrong] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetch("/categories.json")
            .then((res) => res.json())
            .then((data) => {
                setCategories(data);
                if (data.length > 0) setupCategory(0, data);
            })
            .catch((err) => {
                console.error("Failed to load categories.json", err);
            });
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "ArrowRight") handleNext();
            if (e.key === "ArrowLeft") handlePrev();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    });

    const setupCategory = (index, data = categories) => {
        const category = data[index];
        const examples = [...category.examples];
        const missingIdx = Math.floor(Math.random() * examples.length);
        const missingItem = examples[missingIdx];
        examples[missingIdx] = { name: "?", image: "" };

        const otherItems = data.filter(c => c.name !== category.name).flatMap(c => c.examples);
        const randomChoices = shuffleArray(otherItems).slice(0, 3);
        const allChoices = shuffleArray([missingItem, ...randomChoices]);

        setDisplayItems(examples);
        setChoices(allChoices);
        setBorderColor(colors[index % colors.length]);
        setCorrectIdx(allChoices.findIndex(item => item.name === missingItem.name));
        setSelectedIdx(null);
        setOverlays({});
        setDisabledChoices({});
        setFadeState("fade-in-active");
        setSlotFadeInIdx(null);
        setHasTriedWrong(false);
    };

    const shuffleArray = (array) => {
        return array
            .map((item) => ({ item, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ item }) => item);
    };

    const handleChoiceClick = (idx) => {
        if (selectedIdx !== null) return;

        if (idx === correctIdx) {
            if (!hasTriedWrong) {
                setScore((prev) => prev + 1);
            }
            setSelectedIdx(idx);
            setOverlays({ [idx]: "check" });

            setTimeout(() => {
                setOverlays({});
                const newChoices = [...choices];
                newChoices[idx].shrinking = true;
                setChoices(newChoices);

                setTimeout(() => {
                    const slotIdx = displayItems.findIndex(item => item.name === "?");
                    setSlotFadeInIdx(slotIdx);

                    const updatedItems = displayItems.map((item, i) =>
                        i === slotIdx ? choices[idx] : item
                    );
                    setDisplayItems(updatedItems);
                    setChoices([]);
                }, 700);
            }, 600);
        } else {
            setHasTriedWrong(true);
            setOverlays((prev) => ({ ...prev, [idx]: "cross" }));
            setTimeout(() => {
                setOverlays((prev) => {
                    const newOverlays = { ...prev };
                    delete newOverlays[idx];
                    return newOverlays;
                });

                const updatedDisabled = { ...disabledChoices, [idx]: true };
                setDisabledChoices(updatedDisabled);

                const remaining = choices
                    .map((_, i) => i)
                    .filter((i) => !updatedDisabled[i]);

                if (remaining.length === 1 && remaining[0] === correctIdx) {
                    const lastIdx = remaining[0];

                    setTimeout(() => {
                        const updated = [...choices];
                        updated[lastIdx].highlight = true;
                        setChoices(updated);

                        setTimeout(() => {
                            updated[lastIdx].highlight = false;
                            updated[lastIdx].shrinking = true;
                            setChoices([...updated]);

                            setTimeout(() => {
                                const slotIdx = displayItems.findIndex(item => item.name === "?");
                                setSlotFadeInIdx(slotIdx);

                                const updatedItems = displayItems.map((item, i) =>
                                    i === slotIdx ? choices[lastIdx] : item
                                );
                                setDisplayItems(updatedItems);
                                setChoices([]);
                            }, 700);
                        }, 800);
                    }, 1000); // Wait 1 second before growing
                }
            }, 700);
        }
    };

    const handleNext = () => {
        setFadeState("fade-out");
        setChoices([]);
        setOverlays({});
        setSelectedIdx(null);
        setDisabledChoices({});
        setSlotFadeInIdx(null);
        setTimeout(() => {
            const nextIdx = (currentIndex + 1) % categories.length;
            setCurrentIndex(nextIdx);
            setupCategory(nextIdx);
        }, 400);
    };

    const handlePrev = () => {
        setFadeState("fade-out");
        setChoices([]);
        setOverlays({});
        setSelectedIdx(null);
        setDisabledChoices({});
        setSlotFadeInIdx(null);
        setTimeout(() => {
            const prevIdx = (currentIndex - 1 + categories.length) % categories.length;
            setCurrentIndex(prevIdx);
            setupCategory(prevIdx);
        }, 400);
    };

    return (
        <div className="app">
            <button className="back-button" onClick={() => navigate("/")}>Home</button>
            <h1 className="title">Guess the Missing Item</h1>
            <div style={{ color: "white", fontFamily: "Poppins", fontSize: "1.2rem", marginBottom: "10px" }}>
                Score: {score}
            </div>
            {categories.length > 0 ? (
                <>
                    <button className="nav-arrow left" onClick={handlePrev}>❮</button>
                    <div className={`card-container ${fadeState}`} style={{ borderColor }}>
                        <div className="card-grid">
                            {displayItems.map((item, idx) => (
                                <button key={idx} className="gtm-card-button" disabled>
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className={idx === slotFadeInIdx ? "fade-in-slot" : ""}
                                        />
                                    ) : (
                                        <div className="gtm-missing-slot">?</div>
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="category-id">{categories[currentIndex].id}</div>
                    </div>

                    {choices.length > 0 && (
                        <div className="gtm-choice-wrapper" style={{ borderColor }}>
                            <div className="gtm-choice-row">
                                {choices.map((choice, idx) => (
                                    <button
                                        key={idx}
                                        className={`gtm-choice-button 
                                            ${disabledChoices[idx] ? "gtm-disabled" : ""} 
                                            ${choice.shrinking ? "shrink-fade" : ""} 
                                            ${choice.highlight ? "highlight" : ""}`}
                                        onClick={() => handleChoiceClick(idx)}
                                        disabled={disabledChoices[idx] || (selectedIdx !== null && idx !== correctIdx)}
                                        style={{ borderColor }}
                                    >
                                        <img src={choice.image} alt={choice.name} />
                                        {overlays[idx] && (
                                            <div className="overlay">
                                                <img
                                                    src={overlays[idx] === "check"
                                                        ? "./images/green-check.png"
                                                        : "./images/red-x.png"}
                                                    alt={overlays[idx]}
                                                />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <button className="nav-arrow right" onClick={handleNext}>❯</button>
                </>
            ) : (
                <p style={{ color: "white", fontFamily: "Poppins", fontSize: "1.2rem" }}>Loading...</p>
            )}
        </div>
    );
}

export default GuessTheMissing;
