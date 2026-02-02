import "./Flower.css";

const Flower = ({ type = "standard", style = {}, delay = 0 }) => {
  const renderPetals = () => {
    switch (type) {
      case "tulip":
        return (
          <>
            <div className="tulip-petal tp1"></div>
            <div className="tulip-petal tp2"></div>
            <div className="tulip-petal tp3"></div>
          </>
        );
      case "daisy":
        return Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className={`daisy-petal dp${i + 1}`}></div>
        ));
      case "sunflower":
        return Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className={`sunflower-petal sp${i + 1}`}></div>
        ));
      default:
        return (
          <>
            <div className="petal p1"></div>
            <div className="petal p2"></div>
            <div className="petal p3"></div>
            <div className="petal p4"></div>
          </>
        );
    }
  };

  return (
    <div className="flower-container" style={style}>
      <div className="flower" style={{ animationDelay: `${delay}s` }}>
        <div className="stem"></div>
        <div className="leaf left"></div>
        <div className="leaf right"></div>
        <div className={`bloom ${type}`}>
          {renderPetals()}
          <div className={`center ${type}`}></div>
        </div>
      </div>
    </div>
  );
};

export default Flower;
