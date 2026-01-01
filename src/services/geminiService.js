require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const apiKey = process.env.GEMINI_API_KEY;
console.log('🔑 GEMINI_API_KEY loaded:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');

const genAI = new GoogleGenerativeAI(apiKey);

// System prompt cho chatbot
const SYSTEM_PROMPT = `Bạn là trợ lý ảo của ứng dụng Ticket Box - ứng dụng đặt vé xem phim hàng đầu Việt Nam.

NHIỆM VỤ:
- Tư vấn phim cho khách hàng
- Tra cứu lịch chiếu và giá vé
- Hướng dẫn đặt vé
- Cung cấp thông tin về rạp chiếu (CGV, Galaxy, Lotte Cinema)

QUY TẮC:
1. Trả lời ngắn gọn, thân thiện (tối đa 3-4 câu)
2. Sử dụng emoji phù hợp 🎬🎥🍿
3. Nếu không có thông tin chính xác, hướng dẫn khách hàng cách tìm thông tin trong app
4. Luôn khuyến khích khách hàng đặt vé

THÔNG TIN CƠ BẢN:
- Hệ thống rạp: CGV, Galaxy, Lotte Cinema
- Giá vé trung bình: 70.000đ - 150.000đ (tùy loại ghế và giờ chiếu)
- Giờ chiếu phổ biến: 9h-23h hàng ngày
- Hỗ trợ thanh toán: VNPay, thẻ ATM/Visa/MasterCard`;

/**
 * Gọi Gemini AI để chat
 * @param {string} userMessage - Tin nhắn người dùng
 * @param {Array} movieContext - Danh sách phim để AI tham khảo
 * @returns {Promise<string>} - Phản hồi từ AI
 */
async function chatWithGemini(userMessage, movieContext = []) {
    try {
        // Sử dụng model gemini-2.5-flash (stable và free)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        // Xây dựng context từ dữ liệu phim
        let contextInfo = '';
        if (movieContext && movieContext.length > 0) {
            contextInfo = '\n\nDỮ LIỆU PHIM HIỆN CÓ:\n';
            movieContext.forEach(movie => {
                contextInfo += `- "${movie.name}": ${movie.categories?.join(', ') || 'N/A'}, Rating: ${movie.rating || 'Chưa có'}\n`;
            });
        }

        // Tạo prompt hoàn chỉnh
        const fullPrompt = `${SYSTEM_PROMPT}${contextInfo}\n\n👤 KHÁCH HÀNG: ${userMessage}\n\n🤖 TRỢ LÝ:`;

        // Gọi Gemini API
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        return text;
    } catch (error) {
        console.error('❌ Gemini API Error:', error);

        // Fallback response
        if (error.message?.includes('API_KEY')) {
            return '⚠️ Xin lỗi, hệ thống AI đang bảo trì. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.';
        }

        return '😔 Xin lỗi, tôi gặp chút sự cố. Bạn có thể hỏi lại câu khác được không?';
    }
}

module.exports = { chatWithGemini };
