import Room from '../models/room.model.js';

export const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.findAll();
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createRoom = async (req, res) => {
    try {
        const newRoom = await Room.create(req.body);
        res.status(201).json(newRoom);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: "Sala no encontrada" });
        res.json(room);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateRoom = async (req, res) => {
    try {
        const updated = await Room.update(req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: "Sala no encontrada" });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
