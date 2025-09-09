import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./App.css";
import "./Sort.css";
import { colors } from "./colors";
import HelpButton from "./HelpButton";
import { saveGameProgress, getGameProgress, clearGameProgress, markGameCompleted } from "./gameProgress";
import { useDragNavigation } from "./useDragNavigation";

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
    const location = useLocation();
    const allCategoriesRef = useRef([]);
    const currentIndexRef = useRef(0);

    // Update refs when state changes
    useEffect(() => {
        allCategoriesRef.current = allCategories;
        currentIndexRef.current = currentIndex;
    }, [allCategories, currentIndex]);

    useEffect(() => {
        fetch(process.env.PUBLIC_URL + "/categories.json")
            .then(res => res.json())
            .then(data => {
                setAllCategories(data);
                setupCategories(data, 0);
                
                // Reset game state if restarting
                if (location.state?.restart) {
                    setCurrentIndex(0);
                    setShowResults(false);
                    setOverlays({});
                    setLockedItems(new Set());
                    setFadeState("fade-in-active");
                    setAllCorrect(false);
                    clearGameProgress("sort-into-categories");
                }
            });
    }, [location.state]);

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
                    
                    // Check if there are more categories to go through
                    const currentIdx = currentIndexRef.current;
                    const categoriesData = allCategoriesRef.current;
                    const nextIndex = currentIdx + 4;
                    
                    if (nextIndex < categoriesData.length) {
                        // Move to next set of categories
                        setTimeout(() => {
                            setCurrentIndex(nextIndex);
                            setupCategories(categoriesData, nextIndex);
                        }, 2000);
                    } else {
                        // Game completed - navigate to game end
                        setTimeout(() => {
                            markGameCompleted("sort-into-categories", 1, 1);
                            navigate('/game-end', {
                                state: {
                                    gameName: "Sort into Categories",
                                    score: 1,
                                    totalQuestions: 1,
                                    gameId: 'sort-into-categories'
                                }
                            });
                        }, 2000);
                    }
                }

                setLockedItems(newLockedItems);
                setShowResults(false);
                return newBins;
            });
        }, 1200);
    };

    const handleNext = useCallback(() => {
        const currentIdx = currentIndexRef.current;
        const categoriesData = allCategoriesRef.current;
        setFadeState("fade-out");
        setTimeout(() => {
            const nextIndex = currentIdx + 4;
            if (nextIndex < categoriesData.length) {
                setCurrentIndex(nextIndex);
                setupCategories(categoriesData, nextIndex);
            }
        }, 400);
    }, []);

    const handlePrev = useCallback(() => {
        const currentIdx = currentIndexRef.current;
        const categoriesData = allCategoriesRef.current;
        setFadeState("fade-out");
        setTimeout(() => {
            const prevIndex = currentIdx - 4;
            if (prevIndex >= 0) {
                setCurrentIndex(prevIndex);
                setupCategories(categoriesData, prevIndex);
            }
        }, 400);
    }, []);

    // Drag navigation - only for navigation areas, not the main content
    const { dragRef, mouseHandlers, touchHandlers } = useDragNavigation(
        handleNext,
        handlePrev,
        { threshold: 50 }
    );

    // Clear progress function
    const clearProgress = () => {
        clearGameProgress("sort-into-categories");
        setCurrentIndex(0);
        setBins({});
        setOverlays({});
        setLockedItems(new Set());
        setShowResults(false);
        setAllCorrect(false);
    };

    return (
        <div className="app">
            <HelpButton gameId="sort-into-categories" onStartOver={clearProgress} />
            <h1 className="title">Sort Into Categories</h1>

            {categories.length > 0 && (
                <div 
                    ref={dragRef}
                    style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}
                    {...mouseHandlers}
                    {...touchHandlers}
                >
                    <button className="nav-arrow left" onClick={handlePrev} style={{ pointerEvents: 'auto' }}>❮</button>
                    <button className="nav-arrow right" onClick={handleNext} style={{ pointerEvents: 'auto' }}>❯</button>
                </div>
            )}

            <div 
                className={`fade-page ${fadeState}`} 
                style={{ width: "100%" }}
            >
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
                            style={{ backgroundColor: "#ffffff", marginTop: "20px", border: "0px"}}
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
