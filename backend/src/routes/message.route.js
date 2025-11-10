import express from 'express';
import { getAllContacts, getChatPartners, getMessagesByUserId, sendMessages } from '../controllers/message.controller.js';
import { protectRoute } from '../middlesware/auth.middleware.js';

const router = express.Router();

router.get("/contacts", protectRoute, getAllContacts);

router.get("/chats", protectRoute, getChatPartners);

router.get("/:id", protectRoute, getMessagesByUserId);

router.post("/send/:id", protectRoute, sendMessages);

export default router;