import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Ordering.css";

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

function Ordering() {
    const [categories, setCategories] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [items, setItems] = useState([]);
    const [slots, setSlots] = useState([null, null, null, null]);
    const [overlays, setOverlays] = useState({});
    const [borderColor, setBorderColor] = useState(colors[0]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(process.env.PUBLIC_URL + "/ordering.json")
            .then((res) => res.json())
            .then((data) => {
                setCategories(data);
                if (data.length > 0) {
                    setItems(shuffleArray(data[0].examples));
                    setBorderColor(colors[0]);
                }
            });
    }, []);

    const shuffleArray = (array) => {
        return array
            .map((item) => ({ item, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ item }) => item);
    };

    const handleDragStart = (e, item, source) => {
        e.dataTransfer.setData("itemName", item.name);
        e.dataTransfer.setData("source", source);
    };

    const handleDrop = (e, idx) => {
        const itemName = e.dataTransfer.getData("itemName");
        const source = e.dataTransfer.getData("source");

        const draggedItem =
            source === "choices" ? items.find((i) => i.name === itemName) : slots.find((i) => i && i.name === itemName);
        if (!draggedItem) return;

        let newSlots = [...slots];
        let newItems = [...items];

        // Remove dragged item from all slots before placing
        newSlots = newSlots.map((s) => (s && s.name === itemName ? null : s));

        // If slot already has an item, return it to choices
        if (newSlots[idx]) {
            newItems.push(newSlots[idx]);
        }

        // Remove from choices if coming from there
        if (source === "choices") {
            newItems = newItems.filter((i) => i.name !== draggedItem.name);
        }

        // Place dragged item into the slot
        newSlots[idx] = draggedItem;

        // Remove duplicates
        const seen = new Set();
        newItems = newItems.filter((i) => {
            if (seen.has(i.name)) return false;
            seen.add(i.name);
            return true;
        });

        setSlots(newSlots);
        setItems(newItems);
        setOverlays({});
    };

    const handleChoiceDrop = (e) => {
        const itemName = e.dataTransfer.getData("itemName");
        const source = e.dataTransfer.getData("source");
        if (source !== "slots") return;

        const draggedItem = slots.find((i) => i && i.name === itemName);
        if (!draggedItem) return;

        let newSlots = slots.map((s) => (s && s.name === itemName ? null : s));
        let newItems = [...items, draggedItem];

        const seen = new Set();
        newItems = newItems.filter((i) => {
            if (seen.has(i.name)) return false;
            seen.add(i.name);
            return true;
        });

        setSlots(newSlots);
        setItems(newItems);
        setOverlays({});
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const checkOrder = () => {
        if (slots.some((slot) => !slot)) {
            return;
        }

        let newOverlays = {};
        let incorrectIndices = [];

        slots.forEach((item, idx) => {
            if (item.order === idx + 1) {
                newOverlays[idx] = "check";
            } else {
                newOverlays[idx] = "cross";
                incorrectIndices.push(idx);
            }
        });

        setOverlays(newOverlays);

        setTimeout(() => {
            let newSlots = [...slots];
            let newItems = [...items];

            incorrectIndices.forEach((i) => {
                newItems.push(newSlots[i]);
                newSlots[i] = null;
            });

            setSlots(newSlots);
            setItems(newItems);
            setOverlays({});
        }, 1000);
    };

    const handleNext = () => {
        const nextIndex = (currentIndex + 1) % categories.length;
        setCurrentIndex(nextIndex);
        setItems(shuffleArray(categories[nextIndex].examples));
        setSlots([null, null, null, null]);
        setOverlays({});
        setBorderColor(colors[nextIndex % colors.length]);
    };

    const handlePrev = () => {
        const prevIndex = (currentIndex - 1 + categories.length) % categories.length;
        setCurrentIndex(prevIndex);
        setItems(shuffleArray(categories[prevIndex].examples));
        setSlots([null, null, null, null]);
        setOverlays({});
        setBorderColor(colors[prevIndex % colors.length]);
    };

    const currentCategory = categories[currentIndex];

    return (
        <div className="app">
            <button className="back-button" onClick={() => navigate("/")}>Home</button>
            <h1 className="title">Order the Items</h1>
            {currentCategory ? (
                <>
                    <button className="nav-arrow left" onClick={handlePrev}>❮</button>
                    <div className="card-container fade-in-active" style={{ borderColor }}>
                        <h2 style={{ fontFamily: "Poppins", marginBottom: "10px" }}>{currentCategory.name}</h2>
                        <div className="solid-box">
                            <div className="drop-zone-row">
                                {slots.map((slot, idx) => (
                                    <div
                                        key={idx}
                                        className="drop-slot"
                                        onDrop={(e) => handleDrop(e, idx)}
                                        onDragOver={handleDragOver}
                                    >
                                        {slot && (
                                            <div className="slot-image-wrapper">
                                                <img
                                                    src={slot.image}
                                                    alt={slot.name}
                                                    className="card-image"
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, slot, "slots")}
                                                />
                                                {overlays[idx] && (
                                                    <div className="overlay">
                                                        <img
                                                            src={
                                                                overlays[idx] === "check"
                                                                    ? "./images/green-check.png"
                                                                    : "./images/red-x.png"
                                                            }
                                                            alt={overlays[idx]}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="dashed-box" onDrop={handleChoiceDrop} onDragOver={handleDragOver}>
                            {items.map((item, idx) => (
                                <img
                                    key={idx}
                                    src={item.image}
                                    alt={item.name}
                                    className="card-image draggable-image"
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, item, "choices")}
                                />
                            ))}
                        </div>
                    </div>
                    <button className="answer-button" style={{ backgroundColor: borderColor, marginTop: "20px" }} onClick={checkOrder}>Check Order</button>
                    <button className="nav-arrow right" onClick={handleNext}>❯</button>
                </>
            ) : (
                <p style={{ color: "white", fontFamily: "Poppins", fontSize: "1.2rem" }}>Loading...</p>
            )}
        </div>
    );
}

export default Ordering;
