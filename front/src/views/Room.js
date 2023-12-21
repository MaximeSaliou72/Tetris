// Room.js
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { getTokenFromLocalStorage } from "../lib/common";

const Room = () => {
  const token = getTokenFromLocalStorage();
  const location = useLocation();
  const { id } = location.state;
  const [newRoomName, setNewRoomName] = useState("");
  const navigate = useNavigate();

  const createRoom = async () => {
    try {
      const response = await axios({
        method: "POST",
        url: "http://localhost:8180/create-room",
        data: {
          id: id,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response) {
        navigate("/Tetris", { state: { tokenRoom: response.data.token } });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const joinRoom = async () => {
    if (!newRoomName) {
      alert("Veuillez entrer un token de room.");
      return;
    }
    try {
      const response = await axios({
        method: "GET",
        url: `http://localhost:8180/join-room/${newRoomName}`, // Modifiez l'URL en fonction de votre route API
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response && response.data) {
        navigate("/Tetris", { state: { tokenRoom: newRoomName } });
      }
    } catch (err) {
      console.error("Erreur lors de la tentative de rejoindre la room:", err);
      alert("Impossible de rejoindre la room avec ce token.");
    }
  };

  return (
    <div>
      <h2>Rejoindre une Room</h2>
      <div>
        <input
          type="text"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
        />
        <button onClick={joinRoom}>Rejoindre Room</button>
      </div>
      <h2>Créer une nouvelle Room</h2>
      <div>
        <button onClick={createRoom}>Créer Room</button>
      </div>
    </div>
  );
};

export default Room;
