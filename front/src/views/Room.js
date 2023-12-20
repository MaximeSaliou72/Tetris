// Room.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from "axios";

const Room = () => {
    const [rooms, setRooms] = useState([]);

    const [newRoomName, setNewRoomName] = useState('');

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const response = await axios({
                method: "GET",
                url: "http://localhost:8180/rooms",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response) {
                setRooms(response);
            }
        } catch (err) {
            console.log(err);
        }
    };
    const createRoom = () => {
        const newRoom = {
            id: rooms.length + 1,
            name: newRoomName,
        };

        setRooms([...rooms, newRoom]);

        setNewRoomName('');
    };

    return (
        <div>
            {rooms.length > 0 ?
                <h2>Liste des Rooms disponibles</h2>
                :
                null
            }
            <ul>
                {rooms.map((room) => (
                    <li key={room.id}>
                        <Link to={`/room/${room.id}`}>{room.name}</Link>
                    </li>
                ))}
            </ul>

            <h2>Créer une nouvelle Room</h2>
            <div>
                <label>Nom de la Room:</label>
                <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                />
                <button onClick={createRoom}>Créer Room</button>
            </div>
        </div>
    );
}

export default Room;
