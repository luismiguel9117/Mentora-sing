export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const { url } = req.body;
    if (!url || !url.startsWith('https://www.youtube.com/')) {
      return res.status(400).send('Invalid URL');
    }

    const timedRes = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.youtube.com/',
        'Origin': 'https://www.youtube.com',
      }
    });
    const xmlText = await timedRes.text();
    res.setHeader('Content-Type', 'text/xml; charset=utf-8');
    return res.status(200).send(xmlText);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}
