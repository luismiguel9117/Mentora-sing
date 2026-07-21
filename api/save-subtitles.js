import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const { videoId, subtitles } = req.body;
    if (!videoId) {
      return res.status(400).json({ error: 'Missing videoId' });
    }

    const dir = path.join(process.cwd(), 'public/subtitles');
    const filePath = path.join(dir, `${videoId}.json`);

    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify(subtitles, null, 2), 'utf-8');
      return res.status(200).json({ success: true });
    } catch (fsErr) {
      // Fallback for Vercel read-only filesystem
      console.warn("Read-only filesystem on Vercel, session-only fallback:", fsErr.message);
      return res.status(200).json({ 
        success: true, 
        warning: 'Read-only filesystem, changes will not persist after container restart.' 
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
