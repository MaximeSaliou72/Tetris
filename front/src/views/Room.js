// Room.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from "axios";
import { getTokenFromLocalStorage } from "../lib/common";

const Room = () => {
    const [rooms, setRooms] = useState([]);
    const token = getTokenFromLocalStorage();
    const location = useLocation();
    const { id } = location.state;
    const [newRoomName, setNewRoomName] = useState('');

    const createRoom = async () => {
        try {
            const response = await axios({
                method: "POST",
                url: "http://localhost:8180/create-room",
                data: {
                    id: id
                },
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,

                },
            });
            if (response) {
                console.log(response)
                setRooms(response);
            }
        } catch (err) {
            console.log(err);
        }
    };
    const joinRoom = () => {

    }

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
}

export default Room;
