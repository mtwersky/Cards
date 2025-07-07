import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import "./Sort.css";

const colors = [
    "#f7d84b",
    "#ff9999",
    "#99ccff",
    "#99ff99",
    "#ffcc99",
    "#dda0dd",
    "#ff6666",
    "#66cccc"
];

function SortIntoCategories() {
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [bins, setBins] = useState({});
    const [binColors, setBinColors] = useState({});
    const [showResults, setShowResults] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(process.env.PUBLIC_URL + "/categories.json")
            .then(res => res.json())
            .then(data => {
                const selected = data.slice(0, 3);
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
            });
    }, []);

    const shuffleArray = (array) => {
        return array
            .map((item) => ({ item, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ item }) => item);
    };

    const moveItem = (targetBinName, item) => {
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
            setBins(prev => {
                const newBins = { ...prev };
                const wrongItems = [];

                for (const key in newBins) {
                    const correctItems = [];
                    newBins[key].forEach(item => {
                        if (item.category !== key) {
                            wrongItems.push(item);
                        } else {
                            correctItems.push(item);
                        }
                    });
                    newBins[key] = correctItems;
                }

                setItems(prev => [...prev, ...wrongItems]);
                setShowResults(false);
                return newBins;
            });
        }, 1200);
    };

    return (
        <div className="app">
            <button className="back-button" onClick={() => navigate("/")}>Home</button>
            <h1 className="title">Sort Into Categories</h1>

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
                                    draggable
                                    onDragStart={(e) => {
                                        e.dataTransfer.setData("text/plain", item.name);
                                    }}
                                    style={{ borderColor: binColors[cat.name] }}
                                >
                                    <img src={item.image} alt={item.name} className="sort-card-image" />
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

            <button
                className="answer-button"
                style={{ backgroundColor: "#ffffff", marginTop: "20px" }}
                onClick={handleCheckAnswers}
            >
                Check Answers
            </button>
        </div>
    );
}

export default SortIntoCategories;
