import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://voxzynltslpdpgqyfsej.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_3a9WwKsi5mlX_AkzsxgGfg_7FFX3Y0W';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const { filename, base64Data } = req.body;
    if (!filename || !base64Data) {
      return res.status(400).json({ error: 'Missing filename or base64Data' });
    }

    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer;
    let contentType = 'image/png';
    if (matches && matches.length === 3) {
      contentType = matches[1];
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(base64Data, 'base64');
    }

    const cleanFilename = filename.toLowerCase().replace(/[^a-z0-9\.\-_]/g, '_');
    const uniqueFilename = `${Date.now()}_${cleanFilename}`;

    // Upload buffer directly to Supabase Storage 'covers' bucket
    const { data, error } = await supabase.storage
      .from('covers')
      .upload(uniqueFilename, buffer, {
        contentType: contentType,
        upsert: true
      });

    if (error) throw error;

    // Get the public URL of the uploaded asset
    const { data: { publicUrl } } = supabase.storage
      .from('covers')
      .getPublicUrl(uniqueFilename);

    return res.status(200).json({ success: true, url: publicUrl });
  } catch (err) {
    console.error('Storage upload failed:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
