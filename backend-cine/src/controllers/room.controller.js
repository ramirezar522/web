import Room from '../models/room.model.js';
import { cacheService } from '../config/cache.js';

export const getAllRooms = async (req, res) => {
    try {
        const cacheKey = 'rooms:all';
        const cachedData = await cacheService.get(cacheKey);
        if (cachedData) {
            return res.json(cachedData);
        }

        const rooms = await Room.findAll();
        await cacheService.set(cacheKey, rooms, 3600); // 1 hour cache
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createRoom = async (req, res) => {
    try {
        const newRoom = await Room.create(req.body);
        await cacheService.delete('rooms:all');
        res.status(201).json(newRoom);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getRoomById = async (req, res) => {
    try {
        const cacheKey = `rooms:id:${req.params.id}`;
        const cachedData = await cacheService.get(cacheKey);
        if (cachedData) {
            return res.json(cachedData);
        }

        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: "Sala no encontrada" });

        await cacheService.set(cacheKey, room, 3600); // 1 hour cache
        res.json(room);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateRoom = async (req, res) => {
    try {
        const updated = await Room.update(req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: "Sala no encontrada" });

        await cacheService.delete('rooms:all');
        await cacheService.delete(`rooms:id:${req.params.id}`);

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
