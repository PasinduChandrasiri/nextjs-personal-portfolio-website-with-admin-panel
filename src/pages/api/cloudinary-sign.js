import { v2 as cloudinary } from 'cloudinary';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { paramsToSign = {} } = req.body;
  try {
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    if (!apiSecret || !apiKey) {
      throw new Error('Cloudinary API credentials are not configured');
    }
    const timestamp = Math.round(Date.now() / 1000);
    // Combine provided parameters with timestamp and compute signature
    const signature = cloudinary.utils.api_sign_request(
      { ...paramsToSign, timestamp },
      apiSecret
    );
    return res.status(200).json({ timestamp, signature, apiKey });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}