// /api/createBooking.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",").map(o => o.trim()) || [];
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Allow", ["POST", "OPTIONS"]);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const {
    start,
    attendee,
    bookingFieldsResponses,
    eventTypeId,
    language,
    timeZone
  } = req.body;

  if (!start || !attendee || !eventTypeId || !language || !timeZone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const apiKey = process.env.CAL_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const payload = {
      start,
      attendee,
      bookingFieldsResponses,
      eventTypeId,
      language,
      timeZone,
    };

    const response = await fetch(`https://api.cal.com/v2/bookings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'cal-api-version': '2024-08-13'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    res.status(200).json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
}
