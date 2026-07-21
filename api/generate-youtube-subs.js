import { YoutubeTranscript } from 'youtube-transcript';

// Helper: extract 11-char YouTube video ID from any format
const extractYtId = (raw) => {
  if (!raw) return null;
  raw = raw.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;
  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /\/embed\/([A-Za-z0-9_-]{11})/,
    /\/shorts\/([A-Za-z0-9_-]{11})/,
    /\/v\/([A-Za-z0-9_-]{11})/,
    /\/watch\/([A-Za-z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = raw.match(p);
    if (m) return m[1];
  }
  return raw;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const payload = req.body;

    // ─── Mode A: client sends pre-parsed cues, just translate ───
    if (payload.cues && Array.isArray(payload.cues)) {
      const cuesToTranslate = payload.cues;
      
      // Translate in chunks to prevent Vercel serverless timeout
      const chunkSize = 5;
      for (let i = 0; i < cuesToTranslate.length; i += chunkSize) {
        const chunk = cuesToTranslate.slice(i, i + chunkSize);
        await Promise.all(chunk.map(async (cue) => {
          try {
            const transRes = await fetch(
              `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cue.en)}&langpair=en|es`
            );
            if (transRes.ok) {
              const transData = await transRes.json();
              cue.es = transData.responseData?.translatedText || cue.en;
            } else { cue.es = cue.en; }
          } catch { cue.es = cue.en; }
        }));
        await new Promise(r => setTimeout(r, 60));
      }
      return res.status(200).json({ success: true, subtitles: cuesToTranslate });
    }

    // ─── Mode B: fetch full transcript from YouTube/Supadata ───
    const { videoId: rawVideoId } = payload;
    if (!rawVideoId) {
      return res.status(400).json({ error: 'Missing videoId or cues' });
    }
    const videoId = extractYtId(rawVideoId);

    let rawCues = null;
    let sourceLang = 'en';
    let fetchedViaSupadata = false;

    // 1. Try Supadata API Key if configured in Vercel env
    if (process.env.SUPADATA_API_KEY) {
      try {
        console.log("Attempting to fetch transcript via Supadata API...");
        const supadataRes = await fetch(`https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}`, {
          headers: {
            'x-api-key': process.env.SUPADATA_API_KEY
          }
        });
        if (supadataRes.ok) {
          const supadataData = await supadataRes.json();
          if (supadataData && Array.isArray(supadataData.content)) {
            rawCues = supadataData.content.map(item => ({
              text: item.text,
              offset: item.offset, // already in ms
              duration: item.duration // already in ms
            }));
            sourceLang = supadataData.lang || 'en';
            fetchedViaSupadata = true;
            console.log("Successfully fetched transcript via Supadata.");
          }
        }
      } catch (supaErr) {
        console.warn("Supadata fetch failed, falling back to scraper:", supaErr.message);
      }
    }

    // 2. Fallback to standard scraper (Works locally, blocks on Vercel IPs)
    if (!fetchedViaSupadata) {
      try {
        rawCues = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });
        sourceLang = 'en';
      } catch {
        try {
          rawCues = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'es' });
          sourceLang = 'es';
        } catch {
          try {
            rawCues = await YoutubeTranscript.fetchTranscript(videoId);
            const sample = (rawCues[0]?.text || '').trim();
            if (/[\u4e00-\u9fff]/.test(sample)) sourceLang = 'zh-CN';
            else if (/[\uac00-\ud7af]/.test(sample)) sourceLang = 'ko';
            else if (/[\u3040-\u309f\u30a0-\u30ff]/.test(sample)) sourceLang = 'ja';
            else if (/[\u0400-\u04ff]/.test(sample)) sourceLang = 'ru';
            else if (/[\u0600-\u06ff]/.test(sample)) sourceLang = 'ar';
            else sourceLang = 'en';
          } catch (scrapeErr) {
            // Provide informative error details depending on environment
            const envMsg = process.env.SUPADATA_API_KEY 
              ? "Por favor, verifica la validez del video." 
              : "Si estás en producción (Vercel), configura la variable SUPADATA_API_KEY en tu panel para evitar bloqueos de YouTube.";
            return res.status(500).json({ 
              error: `No se encontraron subtítulos disponibles para este video. ${envMsg}` 
            });
          }
        }
      }
    }

    if (!rawCues || rawCues.length === 0) {
      return res.status(500).json({ error: 'No se encontraron subtítulos disponibles.' });
    }

    // Map cues to our expected model format
    // Supadata provides offset/duration in ms, scraper provides them in ms (srv3) or sec (classic)
    const parsedCues = rawCues.map((cue, index) => {
      // srv3 is in ms, classic is in seconds.
      // If it looks like milliseconds (>100 duration/offset values for non-zero), we divide by 1000.
      const looksLikeMs = fetchedViaSupadata || cue.offset > 5000 || cue.duration > 1000;
      const divider = looksLikeMs ? 1000 : 1;
      
      const startSec = cue.offset / divider;
      const durSec = cue.duration / divider;

      return {
        id: index + 1,
        start: parseFloat(startSec.toFixed(2)),
        end: parseFloat((startSec + durSec).toFixed(2)),
        en: cue.text.replace(/\s+/g, ' ').trim(),
        es: ''
      };
    });

    return res.status(200).json({ success: true, subtitles: parsedCues });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
