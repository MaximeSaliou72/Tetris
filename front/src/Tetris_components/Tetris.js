import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { createStage, checkCollision } from "../gamehelper";
import EmojiButton from "../component/EmojiButton";

// Styled Components
import { StyledTetrisWrapper, StyledTetris } from "../styles/StyledTetris";

// Custom Hooks
import { useInterval } from "../hooks/useInterval";
import { usePlayer } from "../hooks/usePlayer";
import { useStage } from "../hooks/useStage";
import { useGameStatus } from "../hooks/useGameStatus";

// Components
import Stage from "./Stage";
import Display from "./Display";
import StartButton from "./StartButton";

const Tetris = () => {
  const [socket, setSocket] = useState(null);

  const [dropTime, setDropTime] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  const [player, updatePlayerPos, resetPlayer, playerRotate] = usePlayer();
  const [stage, setStage, rowsCleared] = useStage(player, resetPlayer);
  const [clicked, setClicked] = useState(false);
  const [score, setScore, rows, setRows, level, setLevel] =
    useGameStatus(rowsCleared);

  // Établir la connexion WebSocket
  useEffect(() => {
    const socket = io("http://localhost:8180");
    setSocket(socket);

    socket.on("connect", () => {
      console.log("Connecté au serveur WebSocket");
    });

    socket.on("message", (message) => {
      console.log("Message reçu du serveur:", message);
      // Traiter le message ici
    });

    socket.on("gameData", (data) => {
      console.log("GameData received:", data);
    });

    socket.on("emote", (data) => {
      console.log("Emote received:", data);
    });

    socket.on("disconnect", () => {
      console.log("Déconnecté du serveur WebSocket");
    });

    socket.on("connect_error", (error) => {
      console.error("Erreur de connexion WebSocket:", error);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      const gameData = {
        level: level,
        rows: rows,
        score: score,
        username: "username",
      };

      socket.emit("gameData", gameData);
      console.log(gameData);
    }
  }, [socket, level, rows, score]);

  const handleEmojiClick = (text) => {
    if (socket) {
      socket.emit("emote", text);
      console.log(text);
    }
  };

  const movePlayer = (dir) => {
    if (!checkCollision(player, stage, { x: dir, y: 0 })) {
      updatePlayerPos({ x: dir, y: 0 });
    }
  };

  const startGame = () => {
    // Reset everything
    setStage(createStage());
    setDropTime(1000);
    resetPlayer();
    setGameOver(false);
    setScore(0);
    setRows(0);
    setLevel(0);
    setClicked(true);
  };

  const drop = () => {
    // Increase Level when player clears ten rows
    if (rows > (level + 1) * 10) {
      setLevel((prev) => prev + 1);
      // Also increase speed
      setDropTime(1000 / (level + 1) + 200);
    }

    if (!checkCollision(player, stage, { x: 0, y: 1 })) {
      updatePlayerPos({ x: 0, y: 1, collided: false });
    } else {
      // Game Over
      if (player.pos.y < 1) {
        setGameOver(true);
        setDropTime(null);
        setClicked(false);
      }
      updatePlayerPos({ x: 0, y: 0, collided: true });
    }
  };

  const keyUp = ({ keyCode }) => {
    if (!gameOver) {
      if (keyCode === 40 || keyCode === 83) {
        setDropTime(1000 / (level + 1) + 200);
      }
    }
  };

  const dropPlayer = () => {
    setDropTime(null);
    drop();
  };

  const move = ({ keyCode }) => {
    if (!gameOver) {
      if (keyCode === 37 || keyCode === 81) {
        movePlayer(-1);
      } else if (keyCode === 39 || keyCode === 68) {
        movePlayer(1);
      } else if (keyCode === 40 || keyCode === 83) {
        dropPlayer();
      } else if (keyCode === 38 || keyCode === 90) {
        playerRotate(stage, 1);
      }
    }
  };

  useInterval(() => {
    drop();
  }, dropTime);

  return (
    <StyledTetrisWrapper
      role="button"
      tabIndex="0"
      onKeyDown={(e) => move(e)}
      onKeyUp={keyUp}
    >
      <StyledTetris>
        <Stage stage={stage} />
        <aside>
          {gameOver ? (
            <Display gameOver={gameOver} text="Game Over" />
          ) : (
            <div className="score-board">
              <Display text={`Score ${score}`} />
              <Display text={`Rows ${rows}`} />
              <Display text={`Level ${level}`} />
              <EmojiButton onEmojiClick={handleEmojiClick} />
            </div>
          )}
          <StartButton callback={startGame} clicked={clicked} />
        </aside>
      </StyledTetris>
    </StyledTetrisWrapper>
  );
};

export default Tetris;
