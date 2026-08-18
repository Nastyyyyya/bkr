import React, { useEffect, useState } from "react";
import "./Garden.css";
import bg from "../assets/empty-garden.jpg";
import tree1 from "../assets/tree1.png";
import tree2 from "../assets/tree2.png";
import tree3 from "../assets/tree3.png";
import Beaver from "./Beaver";
import Cloud from "./Cloud";
import Flower from "./Flower";

const Garden = ({
  flowers = 2,
  treeStage = 0,
  rain = false,
  beaver = false,
  currentMood,
}) => {
  const [rainDrops, setRainDrops] = useState([]);

  useEffect(() => {
    if (rain) {
      setRainDrops(
        Array.from({ length: 50 }, (_, i) => ({
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 2,
          startY: Math.random() * -100,
        })),
      );
    } else {
      setRainDrops([]);
    }
  }, [rain]);

  const isSunny = currentMood === "happy";
  const isCloudy =
    currentMood === "sad" || currentMood === "tired" || currentMood === "angry";
  const isAngry = currentMood === "angry";

  const treeImages = [null, tree1, tree2, tree3];
  const treeSrc = treeImages[treeStage] || null;

  return (
    <div
      className={`garden ${isAngry ? "gray" : ""}`}
      style={{ backgroundImage: `url(${bg})` }}
    >
      {isSunny && <div className="sun" />}
      {isCloudy && <Cloud />}
      {isAngry &&
        rainDrops.map((d) => (
          <div
            key={d.id}
            className="rain-drop"
            style={{
              left: `${d.left}%`,
              top: `${d.startY}px`,
              animationDelay: `${d.delay}s`,
            }}
          />
        ))}

      {treeSrc && (
        <img src={treeSrc} alt="Tree" className={`tree stage-${treeStage}`} />
      )}

      {Array.from({ length: Math.min(flowers, 10) }).map((_, i) => {
        const maxFlowers = 10;
        const start = 5;
        const end = 95;
        const range = end - start;

        const leftStep = range / (maxFlowers - 1);
        const left = start + i * leftStep;
        const bottom = 20 + Math.random() * 70;
        const delay = i * 0.4;

        const types = ["standard", "tulip", "sunflower", "daisy"];
        const type = types[i % types.length];

        return (
          <Flower
            key={i}
            type={type}
            delay={delay}
            style={{
              left: `${left}%`,
              bottom: `${bottom}px`,
            }}
          />
        );
      })}

      {beaver && (
        <div className="beaver-container">
          <Beaver />
        </div>
      )}
    </div>
  );
};

export default Garden;
