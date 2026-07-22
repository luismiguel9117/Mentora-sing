import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://voxzynltslpdpgqyfsej.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_3a9WwKsi5mlX_AkzsxgGfg_7FFX3Y0W';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Fallback presets if DB is not seeded yet or offline
const defaultVideoCatalog = [
  {
    id: 'flowers-miley-cyrus',
    title: 'Flowers',
    artist: 'Miley Cyrus',
    level: 'B1 Intermediate',
    genre: 'Pop Hits',
    durationSeconds: 200,
    practicedCount: '12.4k',
    videoImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDh1nuQTuZQl5aPnFNJQWyzOnVEdSkc6UMpxKocs27VxFQX4ULsL4HvqGbCTs0n4u1-yKqj_9s5uh8QNolT36DQy890sqNLfPimtyln0sqncCv9h5aWFT2yrqqTU6lldGC_pZj0y4eV-46IMeprO1Iq2Erq0vDD28acNJmjsVE3UVQgYijwNoL8mH9SPvMv_MuFEAFPULN0uk6jVPZYUBg_fNEPExDRi0IWcQx3aQkIMJ-fHc6wsoB_BVsNnmqF2cBV8hax_A5FDyk',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJcDGHqHd9CI7YbeGhTwfVcrocUlTt1Ib95HEm7VuH9yVLJ_Kd5xnfbfRsCsblzcBzUVAxmwTqOQvsTWyYydDnm4GduJwjMfpUaE3QoJJY5F7BTIu4dU8XhRuZD3kY01-8ooY7ODKRIc55hAAn_jbEpCQ56BFklsfWW5qXVqOtdX8kU2dlGB8Jo6CbIznFvBVXwRheTr72DthOLuLHSiuBcrntTSNG9Um0xhRNa3RkzeO-xV_cXZMpmpHtIkhmHN0-rzbMtiKKG-A',
    lyrics: []
  },
  {
    id: 'stay-with-me-sam-smith',
    title: 'Stay With Me',
    artist: 'Sam Smith',
    level: 'A2 Elementary',
    genre: 'Pop Hits',
    durationSeconds: 172,
    practicedCount: '1.2k',
    videoImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQqfcNf-5VYtwUKjoUjzBIPRx3CTZqCiyNxqhSLaEhJcFKmmF19eHEVqRqr2Helxyt64IL-_4vX_EuNOoryQPl2zFvWsmxG08F0FVif29dePqLfu4fmjQJ0vtP2-np4NUn-wkgF11hEyjoIjdWdgZ_fjg2oz-zbCGh2Bncps26nBYOEmCK6SKi-cF1g3iysM0w54Gp2GI_GmBBKqg81fE_czb17mr1TgU6vusZ_NplmdcypFcaGX6P6pE74NDqfwWicl79XkgFIaw',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQqfcNf-5VYtwUKjoUjzBIPRx3CTZqCiyNxqhSLaEhJcFKmmF19eHEVqRqr2Helxyt64IL-_4vX_EuNOoryQPl2zFvWsmxG08F0FVif29dePqLfu4fmjQJ0vtP2-np4NUn-wkgF11hEyjoIjdWdgZ_fjg2oz-zbCGh2Bncps26nBYOEmCK6SKi-cF1g3iysM0w54Gp2GI_GmBBKqg81fE_czb17mr1TgU6vusZ_NplmdcypFcaGX6P6pE74NDqfwWicl79XkgFIaw',
    lyrics: []
  },
  {
    id: 'levitating-dua-lipa',
    title: 'Levitating',
    artist: 'Dua Lipa',
    level: 'C1 Advanced',
    genre: 'Pop Hits',
    durationSeconds: 203,
    practicedCount: '840',
    videoImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFCKA7MriMCQUBEQ3S9pcPSWjs4qYdySBJRtPLoSHgzxpu-IwpKDCJBGhHsM1oPMYgbJSzEcHF4DFtFVhV1QfhyXkbQ7SzDWruVwLTvPEpIIy0s_pfryB2elXv7drwJJQw1THw9hwsJ_zQihK2hHhZlEVlJIj2YsoD-jHJjlaJNXgYhjWOONpO5mUjr_7C8TiZU3cG1pfojNYzWgG6zfh9jhDpjLiwz-4hDVn22FSfXCr5Wnd9gumzRbkQKW0z7c3kxqxJ6Lu7E8Q',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFCKA7MriMCQUBEQ3S9pcPSWjs4qYdySBJRtPLoSHgzxpu-IwpKDCJBGhHsM1oPMYgbJSzEcHF4DFtFVhV1QfhyXkbQ7SzDWruVwLTvPEpIIy0s_pfryB2elXv7drwJJQw1THw9hwsJ_zQihK2hHhZlEVlJIj2YsoD-jHJjlaJNXgYhjWOONpO5mUjr_7C8TiZU3cG1pfojNYzWgG6zfh9jhDpjLiwz-4hDVn22FSfXCr5Wnd9gumzRbkQKW0z7c3kxqxJ6Lu7E8Q',
    lyrics: []
  },
  {
    id: 'shape-of-you-ed-sheeran',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    level: 'B2 Upper Int',
    genre: 'Pop Hits',
    durationSeconds: 233,
    practicedCount: '2.5k',
    videoImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0VZv_PIjSV6I4qABOYLXZkGTOAwJV04E6iGbFXzcDeti4F9GTu9Io83YhKPsBf42YBmOlHaPXPCqyZF_YCtpfPe22qjXQ-Dui-ArTqvd5x7OGroukYQNuAaoACb4ZOZ-YHGscuwa8Osfy_y_oL5AiZBUStxcerQ7GqL1AwGlJuXkYWib14Tncv4hPb2Zs1Ga-N4tjVCjpmWFlepJvJkPa2wsifJMndLTFGaQe5BrdJt4OcZLmQQd1Tw5SinXg-UsMd6tT7dEKujM',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0VZv_PIjSV6I4qABOYLXZkGTOAwJV04E6iGbFXzcDeti4F9GTu9Io83YhKPsBf42YBmOlHaPXPCqyZF_YCtpfPe22qjXQ-Dui-ArTqvd5x7OGroukYQNuAaoACb4ZOZ-YHGscuwa8Osfy_y_oL5AiZBUStxcerQ7GqL1AwGlJuXkYWib14Tncv4hPb2Zs1Ga-N4tjVCjpmWFlepJvJkPa2wsifJMndLTFGaQe5BrdJt4OcZLmQQd1Tw5SinXg-UsMd6tT7dEKujM',
    lyrics: []
  },
  {
    id: 'believer-imagine-dragons',
    title: 'Believer',
    artist: 'Imagine Dragons',
    level: 'B1 Intermediate',
    genre: 'Rock Anthems',
    durationSeconds: 204,
    practicedCount: '4.8k',
    videoImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop',
    lyrics: []
  }
];

function mapDbRecordToSong(item) {
  return {
    id: item.id,
    title: item.title,
    artist: item.artist || 'Artista Desconocido',
    level: item.level || 'B1 Intermediate',
    genre: item.genre || 'Pop Hits',
    durationSeconds: item.duration || 180,
    progressPercent: 0,
    practicedCount: '1.2k',
    videoImage: item.thumbnail || `https://img.youtube.com/vi/${item.url}/hqdefault.jpg`,
    coverImage: item.cover_image || item.thumbnail || `https://img.youtube.com/vi/${item.url}/hqdefault.jpg`,
    lyrics: [],
    videoUrl: item.url
  };
}

export async function getCatalog() {
  try {
    // 1. Sync/Upsert default Mentora Sing songs to database on start
    try {
      await supabase
        .from('video_catalog')
        .upsert(defaultVideoCatalog.map(item => ({
          id: item.id,
          title: item.title,
          url: item.id,
          type: 'youtube',
          category: 'Song',
          emoji: '🎵',
          thumbnail: item.videoImage,
          artist: item.artist,
          level: item.level,
          genre: item.genre,
          cover_image: item.coverImage,
          duration: item.durationSeconds
        })));
    } catch (syncErr) {
      console.warn("Database sync warning:", syncErr.message);
    }

    // 2. Fetch catalog from database
    const { data, error } = await supabase
      .from('video_catalog')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (data && data.length > 0) {
      return data.map(mapDbRecordToSong);
    }
    return defaultVideoCatalog;
  } catch (err) {
    console.error("Failed to fetch catalog from Supabase, returning default fallback:", err.message);
    return defaultVideoCatalog;
  }
}

export async function saveVideoToCatalog(song) {
  const { data, error } = await supabase
    .from('video_catalog')
    .upsert({
      id: song.id,
      title: song.title,
      url: song.id,
      type: 'youtube',
      category: 'Song',
      emoji: '🎵',
      thumbnail: song.videoImage,
      artist: song.artist,
      level: song.level,
      genre: song.genre,
      cover_image: song.coverImage,
      duration: song.durationSeconds
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
