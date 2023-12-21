import React from "react";

const StartButton = ({ callback, clicked }) => (
  <button
    onClick={callback}
    disabled={clicked}
    className="custom-btn btn btn-black"
  >
    Start Game
  </button>
);

export default StartButton;
