const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// POST /api/chat/send - Gửi tin nhắn chat
router.post('/send', chatController.sendMessage);

// GET /api/chat/greet - Lấy lời chào đầu tiên
router.get('/greet', chatController.getGreeting);

module.exports = router;
