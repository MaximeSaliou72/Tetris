import React from "react";

const EmojiButton = ({ onEmojiClick }) => {
  const buttons = [
    { emoji: "😞", text: "Super sad" },
    { emoji: "😕", text: "Sad" },
    { emoji: "🙂", text: "Good" },
    { emoji: "😄", text: "Super good" },
  ];

  const handleClick = (text) => {
    if (onEmojiClick) {
      onEmojiClick(text);
    }
  };

  return (
    <div className="EmojiButton_wrapper">
      {buttons.map((button, index) => (
        <button key={index} onClick={() => handleClick(button.text)}>
          {button.emoji}
        </button>
      ))}
    </div>
  );
};

export default EmojiButton;
