import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  // NOTE: Vercel is read-only for the filesystem in production.
  // save-catalog writes to public/video-catalog.json which only works in local dev.
  // In production, catalog changes are not persisted between deployments.
  // For a persistent solution, integrate a database (e.g. Vercel KV or a JSON via GitHub API).
  try {
    const { catalog } = req.body;
    if (!catalog) {
      return res.status(400).json({ error: 'Missing catalog data' });
    }

    // Attempt to write (works in local dev, fails gracefully on Vercel)
    try {
      const filePath = path.resolve(process.cwd(), 'public/video-catalog.json');
      fs.writeFileSync(filePath, JSON.stringify(catalog, null, 2), 'utf-8');
      return res.status(200).json({ success: true });
    } catch (writeErr) {
      // On Vercel the filesystem is read-only — return a clear message
      return res.status(200).json({
        success: false,
        warning: 'En Vercel el catálogo es de solo lectura. Los cambios no se guardarán entre despliegues. Considera usar una base de datos externa (Vercel KV, Supabase, etc.).'
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
