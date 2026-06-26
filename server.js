const axios = require('axios');

export default async function handler(req, res) {
  // إعدادات CORS للسماح لمتصفح Pi بالاتصال بالسيرفر دون حظر
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  // قراءة مفتاح الـ API لشبكة الفحص التجريبية من إعدادات Vercel
  const PI_API_KEY = process.env.PI_API_KEY;
  const PI_API_URL = "https://minepi.com";

  // فحص المسار المطلوب بناءً على طلب الواجهة الأمامية
  const { action, paymentId, txid } = req.body;

  if (!paymentId) {
    return res.status(400).json({ error: "Missing paymentId" });
  }

  try {
    // 1️⃣ أولاً: مسار الموافقة (Approve)
    if (action === 'approve') {
      console.log("جاري إرسال أمر الموافقة التجريبية للمعرف:", paymentId);
      
      const response = await axios.post(`${PI_API_URL}/payments/${paymentId}/approve`, {}, {
        headers: { 'Authorization': `Key ${PI_API_KEY}` }
      });

      console.log("تمت الموافقة التجريبية بنجاح.");
      return res.status(200).json(response.data); // إرجاع البيانات مباشرة بدون تغليف
    }

    // 2️⃣ ثانياً: مسار إكمال الدفع (Complete)
    if (action === 'complete') {
      if (!txid) return res.status(400).json({ error: "Missing txid" });
      console.log("جاري توثيق إكمال الدفع لمعرف الحركة:", txid);

      const response = await axios.post(`${PI_API_URL}/payments/${paymentId}/complete`, { txid }, {
        headers: { 'Authorization': `Key ${PI_API_KEY}` }
      });

      console.log("تمت عملية إكمال الدفع وتوثيقها بنجاح.");
      return res.status(200).json(response.data);
    }

    return res.status(400).json({ error: "Invalid action" });

  } catch (error) {
    console.error("خطأ في السيرفر:", error.response ? error.response.data : error.message);
    return res.status(500).json({ error: error.message });
  }
}
