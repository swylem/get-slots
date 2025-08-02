// /api/getSlots.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",").map(o => o.trim()) || [];
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  res.setHeader("Allow", ["POST", "OPTIONS"]);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { eventTypeId, start, end, timeZone } = req.body;
  if (!eventTypeId || !start || !end || !timeZone) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const apiKey = process.env.CAL_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const query = new URLSearchParams({
      eventTypeId,
      start,
      end,
      timeZone
    }).toString();

    const response = await fetch(`https://api.cal.com/v2/slots?${query}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'cal-api-version': '2024-09-04'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText || 'API error' });
    }

    const data = await response.json();
    res.status(200).json({ status: 'success', data: data.data });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
}