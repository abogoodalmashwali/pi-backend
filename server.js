const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());

// تفعيل CORS للسماح لموقعك على Vercel بالاتصال بهذا السيرفر
app.use(cors({
    origin: '*' 
}));

// جلب مفتاح الـ API من متغيرات البيئة السرية على منصة Render
const PI_API_KEY = process.env.PI_API_KEY; 
const PI_API_URL = "https://minepi.com";

// 1. دالة الموافقة على الدفع (Approve)
app.post('/approve-payment', async (req, res) => {
    const { paymentId } = req.body;
    if (!paymentId) return res.status(400).json({ success: false, error: "Missing paymentId" });

    try {
        const response = await axios.post(`${PI_API_URL}/payments/${paymentId}/approve`, {}, {
            headers: { 'Authorization': `Key ${PI_API_KEY}` }
        });
        console.log("تمت الموافقة التجريبية بنجاح:", paymentId);
        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error("خطأ في Approve:", error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, error: "فشلت عملية الموافقة" });
    }
});

// 2. دالة إكمال الدفع (Complete)
app.post('/complete-payment', async (req, res) => {
    const { paymentId, txid } = req.body;
    if (!paymentId || !txid) return res.status(400).json({ success: false, error: "Missing data" });

    try {
        const response = await axios.post(`${PI_API_URL}/payments/${paymentId}/complete`, { txid }, {
            headers: { 'Authorization': `Key ${PI_API_KEY}` }
        });
        console.log("اكتملت المعاملة التجريبية بنجاح:", txid);
        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error("خطأ في Complete:", error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, error: "فشل إكمال المعاملة" });
    }
});

// تشغيل السيرفر على المنفذ المحدد تلقائياً
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`سيرفر Pi التجريبي يعمل الآن على المنفذ ${PORT}`);
});
