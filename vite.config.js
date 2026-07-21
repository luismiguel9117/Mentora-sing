import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import { YoutubeTranscript } from 'youtube-transcript'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'subtitle-save-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.method === 'POST' && req.url.startsWith('/api/save-subtitles')) {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            req.on('end', () => {
              try {
                const { videoId, subtitles } = JSON.parse(body);
                if (!videoId) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Missing videoId' }));
                  return;
                }
                const dir = path.resolve(process.cwd(), 'public/subtitles');
                if (!fs.existsSync(dir)) {
                  fs.mkdirSync(dir, { recursive: true });
                }
                const filePath = path.join(dir, `${videoId}.json`);
                fs.writeFileSync(filePath, JSON.stringify(subtitles, null, 2), 'utf-8');
                
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true }));
              } catch (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message }));
              }
            });
          } else if (req.method === 'POST' && req.url.startsWith('/api/upload-cover')) {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            req.on('end', () => {
              try {
                const { filename, base64Data } = JSON.parse(body);
                if (!filename || !base64Data) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Missing filename or base64Data' }));
                  return;
                }
                const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                let buffer;
                if (matches && matches.length === 3) {
                  buffer = Buffer.from(matches[2], 'base64');
                } else {
                  buffer = Buffer.from(base64Data, 'base64');
                }
                const coversDir = path.resolve(process.cwd(), 'public/assets/covers');
                if (!fs.existsSync(coversDir)) {
                  fs.mkdirSync(coversDir, { recursive: true });
                }
                const cleanFilename = filename.toLowerCase().replace(/[^a-z0-9\.\-_]/g, '_');
                const uniqueFilename = `${Date.now()}_${cleanFilename}`;
                const filePath = path.join(coversDir, uniqueFilename);
                fs.writeFileSync(filePath, buffer);
                
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ 
                  success: true, 
                  url: `/assets/covers/${uniqueFilename}` 
                }));
              } catch (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message }));
              }
            });
          } else if (req.method === 'POST' && req.url.startsWith('/api/generate-youtube-subs')) {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', async () => {
              try {
                const payload = JSON.parse(body);
                const fetchFn = (typeof globalThis.fetch === 'function') ? globalThis.fetch : (await import('node-fetch')).default;

                // Helper: extract 11-char YouTube video ID from any format
                const extractYtId = (raw) => {
                  if (!raw) return null;
                  raw = raw.trim();
                  // Already a bare ID (11 chars, no slashes or query params)
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
                  return raw; // return as-is and let youtube-transcript handle the error
                };

                // ─── Mode A: client already parsed the XML, just translate ───
                if (payload.cues && Array.isArray(payload.cues)) {
                  const cuesToTranslate = payload.cues;
                  for (let i = 0; i < cuesToTranslate.length; i++) {
                    const cue = cuesToTranslate[i];
                    try {
                      const transRes = await fetchFn(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(cue.en)}&langpair=en|es`);
                      if (transRes.ok) {
                        const transData = await transRes.json();
                        cue.es = transData.responseData?.translatedText || cue.en;
                      } else { cue.es = cue.en; }
                    } catch { cue.es = cue.en; }
                    await new Promise(r => setTimeout(r, 60));
                  }
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true, subtitles: cuesToTranslate }));
                  return;
                }

                // ─── Mode B: full fetch via InnerTube (ANDROID client fallback) ───
                const { videoId: rawVideoId } = payload;
                if (!rawVideoId) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Missing videoId or cues' }));
                  return;
                }
                const videoId = extractYtId(rawVideoId);

                // Try English first; fallback to any available transcript
                let rawCues = null;
                let sourceLang = 'en';

                try {
                  rawCues = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });
                  sourceLang = 'en';
                } catch {
                  try {
                    // Try Spanish (common for Latin content)
                    rawCues = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'es' });
                    sourceLang = 'es';
                  } catch {
                    try {
                      // Get whatever language is available
                      rawCues = await YoutubeTranscript.fetchTranscript(videoId);
                      // Detect language from text: check for CJK, Arabic, Cyrillic, etc.
                      const sample = (rawCues[0]?.text || '').trim();
                      if (/[\u4e00-\u9fff]/.test(sample)) sourceLang = 'zh-CN';
                      else if (/[\uac00-\ud7af]/.test(sample)) sourceLang = 'ko';
                      else if (/[\u3040-\u309f\u30a0-\u30ff]/.test(sample)) sourceLang = 'ja';
                      else if (/[\u0400-\u04ff]/.test(sample)) sourceLang = 'ru';
                      else if (/[\u0600-\u06ff]/.test(sample)) sourceLang = 'ar';
                      else sourceLang = 'en'; // Default to English — safest fallback
                    } catch {
                      throw new Error('No se encontraron subtítulos disponibles para este video.');
                    }
                  }
                }

                if (!rawCues || rawCues.length === 0) {
                  throw new Error('No se encontraron subtítulos disponibles para este video.');
                }

                let parsedCues = rawCues.map((cue, index) => {
                  const startSec = cue.offset / 1000;
                  const durSec = cue.duration / 1000;
                  return {
                    id: index + 1,
                    start: parseFloat(startSec.toFixed(2)),
                    end: parseFloat((startSec + durSec).toFixed(2)),
                    en: cue.text.replace(/\s+/g, ' ').trim(),
                    es: ''
                  };
                });

                const cuesToTranslate = parsedCues.slice(0, 35);

                // Determine translation direction — never pass 'auto' to MyMemory
                const isSpanish = sourceLang === 'es';
                const isEnglish = sourceLang === 'en';

                for (let i = 0; i < cuesToTranslate.length; i++) {
                  const cue = cuesToTranslate[i];
                  const originalText = cue.en;
                  try {
                    if (isSpanish) {
                      // Already in Spanish — keep as es, translate es→en for the en field
                      cue.es = originalText;
                      const enRes = await fetchFn(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(originalText)}&langpair=es|en`);
                      if (enRes.ok) {
                        const enData = await enRes.json();
                        cue.en = enData.responseData?.translatedText || originalText;
                      }
                    } else if (isEnglish) {
                      // English → translate to Spanish
                      const esRes = await fetchFn(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(originalText)}&langpair=en|es`);
                      if (esRes.ok) {
                        const esData = await esRes.json();
                        cue.es = esData.responseData?.translatedText || originalText;
                      } else { cue.es = originalText; }
                    } else {
                      // Other language (ko, zh, ja, ru, ar…) → translate to English + Spanish
                      const esRes = await fetchFn(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(originalText)}&langpair=${sourceLang}|es`);
                      if (esRes.ok) {
                        const esData = await esRes.json();
                        cue.es = esData.responseData?.translatedText || originalText;
                      } else { cue.es = originalText; }
                      await new Promise(r => setTimeout(r, 40));
                      const enRes = await fetchFn(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(originalText)}&langpair=${sourceLang}|en`);
                      if (enRes.ok) {
                        const enData = await enRes.json();
                        cue.en = enData.responseData?.translatedText || originalText;
                      }
                    }
                  } catch {
                    cue.es = originalText;
                  }

                  await new Promise(r => setTimeout(r, 60));
                }

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, subtitles: cuesToTranslate }));

              } catch (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message }));
              }
            });

          } else if (req.method === 'POST' && req.url.startsWith('/api/proxy-timedtext')) {
            // Proxy the timedtext URL fetch server-side to avoid CORS issues.
            // The URL comes pre-signed from YouTube's player response so it's valid.
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', async () => {
              try {
                const { url } = JSON.parse(body);
                if (!url || !url.startsWith('https://www.youtube.com/')) {
                  res.statusCode = 400;
                  res.end('Invalid URL');
                  return;
                }
                const fetchFn = (typeof globalThis.fetch === 'function') ? globalThis.fetch : (await import('node-fetch')).default;
                const timedResp = await fetchFn(url, {
                  headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Referer': 'https://www.youtube.com/',
                    'Origin': 'https://www.youtube.com',
                  }
                });
                const xmlText = await timedResp.text();
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/xml; charset=utf-8');
                res.end(xmlText);
              } catch (err) {
                res.statusCode = 500;
                res.end(err.message);
              }
            });


          } else if (req.method === 'POST' && req.url.startsWith('/api/save-catalog')) {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            req.on('end', () => {
              try {
                const { catalog } = JSON.parse(body);
                if (!catalog) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Missing catalog data' }));
                  return;
                }
                const filePath = path.resolve(process.cwd(), 'public/video-catalog.json');
                fs.writeFileSync(filePath, JSON.stringify(catalog, null, 2), 'utf-8');
                
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true }));
              } catch (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message }));
              }
            });
          } else {
            next();
          }
        });
      }
    }
  ],
})
