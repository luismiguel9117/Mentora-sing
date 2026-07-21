import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://voxzynltslpdpgqyfsej.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_3a9WwKsi5mlX_AkzsxgGfg_7FFX3Y0W';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Fallback presets if DB is not seeded yet or offline
const defaultVideoCatalog = [
  {
    id: 'UF8uR6Z6KLc',
    type: 'youtube',
    title: 'Discurso de Steve Jobs en Stanford',
    url: 'UF8uR6Z6KLc',
    category: 'Discursos / Educación',
    emoji: '🎓',
    thumbnail: '/assets/covers/jobs_stanford.jpg'
  },
  {
    id: 'Kat5Kbt092g',
    type: 'youtube',
    title: 'Inside Out 2 (Intensa-Mente 2) - Tráiler',
    url: 'Kat5Kbt092g',
    category: 'Animación / Comedia',
    emoji: '🎬',
    thumbnail: '/assets/covers/inside_out.jpg'
  },
  {
    id: 'pL24Rby_53A',
    type: 'youtube',
    title: 'La Casa de Papel - Tráiler Bilingüe',
    url: 'pL24Rby_53A',
    category: 'Series / Drama',
    emoji: '🇪🇸',
    thumbnail: '/assets/covers/lcdp.jpg'
  },
  {
    id: 'local',
    type: 'local',
    title: 'Sintel - Cortometraje de Fantasía',
    url: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
    category: 'Fantasía / Animación',
    emoji: '🐲',
    thumbnail: '/assets/covers/sintel.jpg'
  },
  {
    id: 'vP4iYif190w',
    type: 'youtube',
    title: 'Presentación del primer iPhone (2007) - Steve Jobs',
    url: 'vP4iYif190w',
    category: 'Tecnología / Historia',
    emoji: '📱',
    thumbnail: '/assets/covers/iphone_2007.jpg'
  },
  {
    id: 'A03N43A0k6I',
    type: 'youtube',
    title: 'Harry Potter - Escena del Sombrero Seleccionador',
    url: 'A03N43A0k6I',
    category: 'Cine / Fantasía',
    emoji: '🧙',
    thumbnail: '/assets/covers/sorting_hat.jpg'
  }
];

export async function getCatalog() {
  try {
    // 1. Automatic database cleanup of old broken YouTube IDs (self-healing)
    try {
      const oldIdsToDelete = ['LEjhYkp8P5M', 'hLAWN2_Z418', 'vN4U5yKsh28', 'd3P-vTj-NFA'];
      await supabase.from('video_catalog').delete().in('id', oldIdsToDelete);
    } catch (cleanErr) {
      console.warn("Database cleanup warning:", cleanErr.message);
    }

    // 2. Sync/Upsert new active default videos to database so they are always fresh
    try {
      await supabase
        .from('video_catalog')
        .upsert(defaultVideoCatalog.map(item => ({
          id: item.id,
          title: item.title,
          url: item.url,
          type: item.type,
          category: item.category,
          emoji: item.emoji,
          thumbnail: item.thumbnail
        })));
    } catch (syncErr) {
      console.warn("Database sync warning:", syncErr.message);
    }

    // 3. Fetch final catalog from database
    const { data, error } = await supabase
      .from('video_catalog')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (data && data.length > 0) {
      return data;
    }
    return defaultVideoCatalog;
  } catch (err) {
    console.error("Failed to fetch catalog from Supabase, returning default fallback:", err.message);
    return defaultVideoCatalog;
  }
}

async function seedCatalog() {
  try {
    const { error } = await supabase
      .from('video_catalog')
      .insert(defaultVideoCatalog.map(item => ({
        id: item.id,
        title: item.title,
        url: item.url,
        type: item.type,
        category: item.category,
        emoji: item.emoji,
        thumbnail: item.thumbnail
      })));
    if (error) throw error;
    console.log("Successfully seeded default catalog into Supabase.");
  } catch (err) {
    console.error("Seeding catalog failed:", err.message);
  }
}

export async function saveVideoToCatalog(video) {
  const { data, error } = await supabase
    .from('video_catalog')
    .upsert({
      id: video.id,
      title: video.title,
      url: video.url,
      type: video.type,
      category: video.category,
      emoji: video.emoji,
      thumbnail: video.thumbnail || ''
    });

  if (error) throw error;
  return data;
}

export async function deleteVideoFromCatalog(videoId) {
  const { data, error } = await supabase
    .from('video_catalog')
    .delete()
    .eq('id', videoId);

  if (error) throw error;
  return data;
}

export async function loadSubtitles(videoId) {
  // 1. Try local storage cache first
  try {
    const cached = localStorage.getItem(`mentora_subtitles_${videoId}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to read from localStorage:", e);
  }

  // 2. Fetch from Supabase
  try {
    const { data, error } = await supabase
      .from('video_subtitles')
      .select('subtitles')
      .eq('video_id', videoId)
      .single();

    if (error) {
      // PGRST116 is code for no rows returned
      if (error.code !== 'PGRST116') throw error;
    }

    if (data && data.subtitles) {
      // Cache locally
      try {
        localStorage.setItem(`mentora_subtitles_${videoId}`, JSON.stringify(data.subtitles));
      } catch (e) {}
      return data.subtitles;
    }
  } catch (err) {
    console.error(`Failed to load subtitles from Supabase for ${videoId}:`, err.message);
  }

  // 3. Fallback to public directory JSON file
  try {
    const response = await fetch(`/subtitles/${videoId}.json?t=${Date.now()}`);
    if (response.ok) {
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html')) {
        const data = await response.json();
        if (Array.isArray(data)) {
          // Cache locally
          try {
            localStorage.setItem(`mentora_subtitles_${videoId}`, JSON.stringify(data));
          } catch (e) {}
          return data;
        }
      }
    }
  } catch (err) {
    console.warn(`No static subtitle file found for ${videoId}:`, err.message);
  }

  return [];
}

export async function saveSubtitles(videoId, subtitles) {
  // 1. Save to local storage first
  try {
    localStorage.setItem(`mentora_subtitles_${videoId}`, JSON.stringify(subtitles));
  } catch (e) {
    console.warn("Failed to write to localStorage:", e);
  }

  // 2. Save to Supabase
  const { data, error } = await supabase
    .from('video_subtitles')
    .upsert({
      video_id: videoId,
      subtitles: subtitles,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error("Supabase subtitle save failed:", error.message);
    throw error;
  }
  return data;
}
