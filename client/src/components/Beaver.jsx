// src/components/Beaver.jsx
import React from "react";
import "./Beaver.scss";

const Beaver = () => {
  return (
    <div className="beaver-in-container">
      <div className="canvas">
        <div className="shadow" />
        <div className="tail">
          <div className="checkers" />
        </div>
        <div className="beaver-body">
          <div className="log">
            <div className="lines" />
            <div className="rim" />
          </div>
          <div className="arm" />
          <div className="ear right" />
          <div className="head">
            <div className="ear left" />
            <div className="eye left">
              <div className="eyelid" />
            </div>
            <div className="eye right">
              <div className="eyelid" />
            </div>
            <div className="nose" />
            <div className="mouth">
              <span />
            </div>
          </div>
          <div className="foot" />
        </div>
      </div>
    </div>
  );
};

export default Beaver;
