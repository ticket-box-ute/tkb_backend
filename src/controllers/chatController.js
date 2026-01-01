const { chatWithGemini } = require('../services/geminiService');
const mongoose = require('mongoose');

// Import Movie model
const MovieModel = mongoose.model('movies', require('../models/movie'));

/**
 * API: POST /api/chat/send
 * Xử lý tin nhắn chat từ người dùng
 */
exports.sendMessage = async (req, res) => {
    try {
        const { message } = req.body;

        // Validate input
        if (!message || message.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Tin nhắn không được để trống'
            });
        }

        // Lấy danh sách phim để làm context cho AI
        const movies = await MovieModel.find({ status: 1 })
            .select('name categories rating nation duration')
            .limit(20) // Giới hạn 20 phim để không quá dài
            .lean();

        // Gọi Gemini AI
        const aiResponse = await chatWithGemini(message, movies);

        // Trả về response
        res.json({
            success: true,
            message: message,
            reply: aiResponse,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Chat Controller Error:', error);
        res.status(500).json({
            success: false,
            error: 'Có lỗi xảy ra khi xử lý tin nhắn',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * API: GET /api/chat/greet
 * Lời chào ban đầu khi mở chatbot
 */
exports.getGreeting = async (req, res) => {
    res.json({
        success: true,
        greeting: '👋 Xin chào! Tôi là trợ lý ảo Ticket Box. Tôi có thể giúp bạn:\n\n🎬 Tìm phim hay\n🎥 Tra cứu lịch chiếu\n🍿 Tư vấn đặt vé\n\nBạn cần tôi hỗ trợ gì nào? 😊'
    });
};
