import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import "./Sort.css";
import { colors } from "./colors";

function SortIntoCategories() {
    const [allCategories, setAllCategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [bins, setBins] = useState({});
    const [binColors, setBinColors] = useState({});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [overlays, setOverlays] = useState({});
    const [lockedItems, setLockedItems] = useState(new Set());
    const [fadeState, setFadeState] = useState("fade-in-active");
    const [allCorrect, setAllCorrect] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(process.env.PUBLIC_URL + "/categories.json")
            .then(res => res.json())
            .then(data => {
                setAllCategories(data);
                setupCategories(data, 0);
            });
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "ArrowRight") {
                handleNext();
            }
            if (e.key === "ArrowLeft") {
                handlePrev();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    });

    const shuffleArray = (array) => {
        return array
            .map((item) => ({ item, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ item }) => item);
    };

    const setupCategories = (data, index) => {
        const selected = data.slice(index, index + 4);
        setCategories(selected);

        const allItems = selected.flatMap(cat =>
            cat.examples.map(ex => ({ ...ex, category: cat.name }))
        );
        setItems(shuffleArray(allItems));

        const initialBins = {};
        const colorsMap = {};
        selected.forEach((cat, idx) => {
            initialBins[cat.name] = [];
            colorsMap[cat.name] = colors[idx % colors.length];
        });

        setBins(initialBins);
        setBinColors(colorsMap);
        setShowResults(false);
        setOverlays({});
        setLockedItems(new Set());
        setAllCorrect(false);
        setFadeState("fade-in-active");
    };

    const moveItem = (targetBinName, item) => {
        if (lockedItems.has(item.name)) return; // Disable if already correct

        setBins(prevBins => {
            const newBins = {};
            for (const key in prevBins) {
                newBins[key] = prevBins[key].filter(i => i.name !== item.name);
            }
            if (targetBinName) {
                newBins[targetBinName] = [...newBins[targetBinName], item];
            }
            return newBins;
        });

        setItems(prevItems => {
            const filtered = prevItems.filter(i => i.name !== item.name);
            if (!targetBinName) {
                return [...filtered, item];
            }
            return filtered;
        });
    };

    const handleCheckAnswers = () => {
        setShowResults(true);

        setTimeout(() => {
            const newOverlays = {};
            const newLockedItems = new Set(lockedItems);
            let allCorrectNow = true;

            setBins(prev => {
                const newBins = { ...prev };
                let wrongItems = [];

                for (const key in newBins) {
                    const correctItems = [];
                    newBins[key].forEach(item => {
                        if (item.category !== key) {
                            wrongItems.push(item);
                            allCorrectNow = false;
                        } else {
                            correctItems.push(item);
                            newOverlays[item.name] = "check";
                            newLockedItems.add(item.name); // Lock it
                        }
                    });
                    newBins[key] = correctItems;
                }

                setItems(prev => {
                    const existingNames = new Set(prev.map(i => i.name));
                    const uniqueWrongItems = wrongItems.filter(item => !existingNames.has(item.name));
                    return [...prev, ...uniqueWrongItems];
                });

                setOverlays(newOverlays);

                // Remove overlays after 1.5 sec for slower pop
                setTimeout(() => {
                    setOverlays({});
                }, 1500);

                // Check if everything is correct
                if (allCorrectNow && items.length === 0 && wrongItems.length === 0) {
                    setAllCorrect(true);
                }

                setLockedItems(newLockedItems);
                setShowResults(false);
                return newBins;
            });
        }, 1200);
    };

    const handleNext = () => {
        setFadeState("fade-out");
        setTimeout(() => {
            const nextIndex = currentIndex + 4;
            if (nextIndex < allCategories.length) {
                setCurrentIndex(nextIndex);
                setupCategories(allCategories, nextIndex);
            }
        }, 400);
    };

    const handlePrev = () => {
        setFadeState("fade-out");
        setTimeout(() => {
            const prevIndex = currentIndex - 4;
            if (prevIndex >= 0) {
                setCurrentIndex(prevIndex);
                setupCategories(allCategories, prevIndex);
            }
        }, 400);
    };

    return (
        <div className="app">
            <h1 className="title">Sort Into Categories</h1>

            {categories.length > 0 && (
                <>
                    <button className="nav-arrow left" onClick={handlePrev}>❮</button>
                    <button className="nav-arrow right" onClick={handleNext}>❯</button>
                </>
            )}

            <div className={`fade-page ${fadeState}`} style={{ width: "100%" }}>
                {/* 💖 ADD THIS WRAPPER to center everything */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                    <div className="sort-bins-container">
                        {categories.map((cat) => (
                            <div
                                key={cat.name}
                                className="sort-bin"
                                style={{ borderColor: binColors[cat.name] }}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    const itemName = e.dataTransfer.getData("text/plain");
                                    if (!itemName) return;

                                    const allItemsFlat = [...items, ...Object.values(bins).flat()];
                                    const droppedItem = allItemsFlat.find(it => it.name === itemName);

                                    if (droppedItem) {
                                        moveItem(cat.name, droppedItem);
                                    }
                                    e.dataTransfer.clearData();
                                }}
                            >
                                <h3 className="sort-bin-title">{cat.name}</h3>
                                <div className="sort-bin-content">
                                    {bins[cat.name]?.map((item) => (
                                        <div
                                            key={item.name}
                                            className={`sort-image-card ${showResults && item.category !== cat.name ? "sort-shrink-fade" : ""}`}
                                            draggable={!lockedItems.has(item.name)}
                                            onDragStart={(e) => {
                                                e.dataTransfer.setData("text/plain", item.name);
                                            }}
                                            style={{ borderColor: binColors[cat.name], position: "relative" }}
                                        >
                                            <img src={item.image} alt={item.name} className="sort-card-image" />
                                            {overlays[item.name] === "check" && (
                                                <div className="overlay">
                                                    <img src="./images/green-check.png" alt="Check" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div
                        className="sort-items-pool"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            const itemName = e.dataTransfer.getData("text/plain");
                            if (!itemName) return;

                            const allItemsFlat = [...items, ...Object.values(bins).flat()];
                            const droppedItem = allItemsFlat.find(it => it.name === itemName);

                            if (droppedItem) {
                                moveItem(null, droppedItem);
                            }
                            e.dataTransfer.clearData();
                        }}
                    >
                        {items.map(item => (
                            <div
                                key={item.name}
                                className="sort-image-card"
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData("text/plain", item.name);
                                }}
                                style={{ borderColor: "#ffffff" }}
                            >
                                <img src={item.image} alt={item.name} className="sort-card-image" />
                            </div>
                        ))}
                    </div>

                    {!allCorrect && (
                        <button
                            className="answer-button"
                            style={{ backgroundColor: "#ffffff", marginTop: "20px" }}
                            onClick={handleCheckAnswers}
                        >
                            Check Answers
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SortIntoCategories;
