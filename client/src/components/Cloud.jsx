import React from "react";
import "./Cloud.css";

const Cloud = () => {
  return (
    <div className="cloudPane">
      {[1, 2, 3, 4, 5, 6, 7].map((cloudId) => (
        <div key={cloudId} className="bigCloud" id={`cloud${cloudId}`}>
          <div className="largeCircle" id="circ1">
            <div className="largeCircle" id="circ1shadow"></div>
          </div>
          <div className="middleCircle" id="circ2">
            <div className="middleCircle" id="circ2shadow"></div>
          </div>
          <div className="middleCircle" id="circ3">
            <div className="middleCircle" id="circ3shadow"></div>
          </div>
          <div className="smallCircle" id="circ4"></div>
          <div className="smallCircle" id="circ5">
            <div className="smallCircle" id="circ5shadow"></div>
          </div>
          <div className="smallCircle" id="circ6">
            <div className="smallCircle" id="circ6shadow"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Cloud;
