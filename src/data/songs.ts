import { Song, AchievementBadge, UserStats } from '../types';

export const SONGS_DATA: Song[] = [
  {
    id: 'flowers-miley-cyrus',
    title: 'Flowers',
    artist: 'Miley Cyrus',
    level: 'B1 Intermediate',
    genre: 'Pop Hits',
    durationSeconds: 200,
    progressPercent: 65,
    practicedCount: '12.4k',
    featured: true,
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJcDGHqHd9CI7YbeGhTwfVcrocUlTt1Ib95HEm7VuH9yVLJ_Kd5xnfbfRsCsblzcBzUVAxmwTqOQvsTWyYydDnm4GduJwjMfpUaE3QoJJY5F7BTIu4dU8XhRuZD3kY01-8ooY7ODKRIc55hAAn_jbEpCQ56BFklsfWW5qXVqOtdX8kU2dlGB8Jo6CbIznFvBVXwRheTr72DthOLuLHSiuBcrntTSNG9Um0xhRNa3RkzeO-xV_cXZMpmpHtIkhmHN0-rzbMtiKKG-A',
    videoImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDh1nuQTuZQl5aPnFNJQWyzOnVEdSkc6UMpxKocs27VxFQX4ULsL4HvqGbCTs0n4u1-yKqj_9s5uh8QNolT36DQy890sqNLfPimtyln0sqncCv9h5aWFT2yrqqTU6lldGC_pZj0y4eV-46IMeprO1Iq2Erq0vDD28acNJmjsVE3UVQgYijwNoL8mH9SPvMv_MuFEAFPULN0uk6jVPZYUBg_fNEPExDRi0IWcQx3aQkIMJ-fHc6wsoB_BVsNnmqF2cBV8hax_A5FDyk',
    lyrics: [
      {
        id: 1,
        timeSeconds: 5,
        text: 'We were good, we were gold',
        spanishTranslation: 'Éramos buenos, éramos como el oro',
        words: [
          { word: 'good', phonetic: '/ɡʊd/', translation: 'bueno', definition: 'To be desirable or satisfactory.', example: 'We had a good time.' },
          { word: 'gold', phonetic: '/ɡoʊld/', translation: 'oro / valioso', definition: 'A precious yellow metal or highly valuable.', example: 'Heart of gold.' }
        ]
      },
      {
        id: 2,
        timeSeconds: 10,
        text: "Kinda dream that can't be sold",
        spanishTranslation: 'El tipo de sueño que no se puede comprar',
        words: [
          { word: 'kinda', phonetic: '/ˈkaɪn.də/', translation: 'un poco / tipo de', definition: 'Short for kind of.', example: 'It was kinda cool.' },
          { word: 'sold', phonetic: '/soʊld/', translation: 'vendido', definition: 'Past participle of sell.', example: 'The tickets were sold out.' }
        ]
      },
      {
        id: 3,
        timeSeconds: 15,
        text: "We were right 'til we weren't",
        spanishTranslation: 'Estábamos bien hasta que dejamos de estarlo',
        words: [
          { word: 'right', phonetic: '/raɪt/', translation: 'en lo correcto', definition: 'Correct or suited.', example: 'You were right about it.' },
          { word: 'weren\'t', phonetic: '/wɜːrnt/', translation: 'no éramos', definition: 'Contraction of were not.', example: 'We weren\'t ready.' }
        ]
      },
      {
        id: 4,
        timeSeconds: 20,
        text: 'Built a home and watched it burn',
        spanishTranslation: 'Construimos un hogar y lo vimos arder',
        grammarNote: "Past simple verbs: 'Built' (build) and 'watched' (watch).",
        words: [
          { word: 'built', phonetic: '/bɪlt/', translation: 'construimos', definition: 'Past tense of build.', example: 'We built a house.' },
          { word: 'watched', phonetic: '/wɑːtʃt/', translation: 'observamos', definition: 'Observed attentively.', example: 'I watched the sunset.' },
          { word: 'burn', phonetic: '/bɜːrn/', translation: 'arder / quemar', definition: 'On fire or destroyed by fire.', example: 'Wood burns easily.' }
        ]
      },
      {
        id: 5,
        timeSeconds: 26,
        text: "I didn't wanna leave you",
        spanishTranslation: 'No quería dejarte',
        words: [
          { word: 'wanna', phonetic: '/ˈwɑː.nə/', translation: 'querer (want to)', definition: 'Informal contraction of want to.', example: 'I wanna go home.' },
          { word: 'leave', phonetic: '/liːv/', translation: 'dejar / irse', definition: 'To depart from.', example: 'Don\'t leave me behind.' }
        ]
      },
      {
        id: 6,
        timeSeconds: 31,
        text: "I didn't wanna lie",
        spanishTranslation: 'No quería mentir',
        words: [
          { word: 'lie', phonetic: '/laɪ/', translation: 'mentir', definition: 'To tell an untruth.', example: 'Never lie to friends.' }
        ]
      },
      {
        id: 7,
        timeSeconds: 36,
        text: 'Started to cry but then remembered I...',
        spanishTranslation: 'Empecé a llorar pero luego recordé que yo...',
        words: [
          { word: 'started', phonetic: '/ˈstɑːr.tɪd/', translation: 'comencé', definition: 'Began doing something.', example: 'It started raining.' },
          { word: 'remembered', phonetic: '/rɪˈmem.bərd/', translation: 'recordé', definition: 'Recalled past knowledge.', example: 'I remembered your name.' }
        ]
      },
      {
        id: 8,
        timeSeconds: 42,
        text: 'I can buy myself flowers',
        spanishTranslation: 'Puedo comprarme flores a mí misma',
        grammarNote: "Reflexive pronoun 'myself' used for self-empowerment.",
        words: [
          { word: 'myself', phonetic: '/maɪˈself/', translation: 'a mí misma', definition: 'Reflexive form of I.', example: 'I bought myself a gift.' },
          { word: 'flowers', phonetic: '/ˈflaʊ.ərzi/', translation: 'flores', definition: 'Plural of flower.', example: 'Fresh flowers in spring.' }
        ]
      },
      {
        id: 9,
        timeSeconds: 47,
        text: 'Write my name in the sand',
        spanishTranslation: 'Escribir mi nombre en la arena',
        words: [
          { word: 'sand', phonetic: '/sænd/', translation: 'arena', definition: 'Loose granular substance on beaches.', example: 'Walking on warm sand.' }
        ]
      },
      {
        id: 10,
        timeSeconds: 52,
        text: 'Talk to myself for hours',
        spanishTranslation: 'Hablar conmigo misma durante horas',
        words: [
          { word: 'hours', phonetic: '/ˈaʊ.ərz/', translation: 'horas', definition: 'Units of 60 minutes.', example: 'Spent hours singing.' }
        ]
      },
      {
        id: 11,
        timeSeconds: 57,
        text: "Say things you don't understand",
        spanishTranslation: 'Decir cosas que no entiendes',
        words: [
          { word: 'understand', phonetic: '/ˌʌn.dərˈstænd/', translation: 'entender', definition: 'Perceive the meaning of.', example: 'I understand you.' }
        ]
      },
      {
        id: 12,
        timeSeconds: 62,
        text: 'I can take myself dancing',
        spanishTranslation: 'Puedo sacarme a bailar a mí misma',
        words: [
          { word: 'dancing', phonetic: '/ˈdæn.sɪŋ/', translation: 'bailar', definition: 'Moving rhythmically to music.', example: 'She loves dancing.' }
        ]
      },
      {
        id: 13,
        timeSeconds: 67,
        text: 'And I can hold my own hand',
        spanishTranslation: 'Y puedo sostener mi propia mano',
        words: [
          { word: 'hold', phonetic: '/hoʊld/', translation: 'sostener', definition: 'Grasp or carry.', example: 'Hold my hand.' },
          { word: 'own', phonetic: '/oʊn/', translation: 'propia', definition: 'Belonging to oneself.', example: 'My own house.' }
        ]
      },
      {
        id: 14,
        timeSeconds: 72,
        text: 'Yeah, I can love me better than you can',
        spanishTranslation: 'Sí, puedo amarme mejor de lo que tú puedes',
        words: [
          { word: 'better', phonetic: '/ˈbet.ər/', translation: 'mejor', definition: 'Comparative of good.', example: 'You sing better now.' }
        ]
      }
    ]
  },
  {
    id: 'stay-with-me-sam-smith',
    title: 'Stay With Me',
    artist: 'Sam Smith',
    level: 'A2 Elementary',
    genre: 'Pop Hits',
    durationSeconds: 172,
    practicedCount: '1.2k',
    upNext: true,
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQqfcNf-5VYtwUKjoUjzBIPRx3CTZqCiyNxqhSLaEhJcFKmmF19eHEVqRqr2Helxyt64IL-_4vX_EuNOoryQPl2zFvWsmxG08F0FVif29dePqLfu4fmjQJ0vtP2-np4NUn-wkgF11hEyjoIjdWdgZ_fjg2oz-zbCGh2Bncps26nBYOEmCK6SKi-cF1g3iysM0w54Gp2GI_GmBBKqg81fE_czb17mr1TgU6vusZ_NplmdcypFcaGX6P6pE74NDqfwWicl79XkgFIaw',
    videoImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQqfcNf-5VYtwUKjoUjzBIPRx3CTZqCiyNxqhSLaEhJcFKmmF19eHEVqRqr2Helxyt64IL-_4vX_EuNOoryQPl2zFvWsmxG08F0FVif29dePqLfu4fmjQJ0vtP2-np4NUn-wkgF11hEyjoIjdWdgZ_fjg2oz-zbCGh2Bncps26nBYOEmCK6SKi-cF1g3iysM0w54Gp2GI_GmBBKqg81fE_czb17mr1TgU6vusZ_NplmdcypFcaGX6P6pE74NDqfwWicl79XkgFIaw',
    lyrics: [
      { id: 1, timeSeconds: 5, text: "Guess it's true, I'm no good at a one-night stand", spanishTranslation: "Supongo que es verdad, no soy bueno en aventuras de una noche" },
      { id: 2, timeSeconds: 12, text: "But I still need love 'cause I'm just a man", spanishTranslation: "Pero aún necesito amor porque solo soy un hombre" },
      { id: 3, timeSeconds: 18, text: "Oh, won't you stay with me?", spanishTranslation: "Oh, ¿no te quedarás conmigo?" },
      { id: 4, timeSeconds: 24, text: "'Cause you're all I need", spanishTranslation: "Porque eres todo lo que necesito" }
    ]
  },
  {
    id: 'levitating-dua-lipa',
    title: 'Levitating',
    artist: 'Dua Lipa',
    level: 'C1 Advanced',
    genre: 'Pop Hits',
    durationSeconds: 203,
    practicedCount: '840',
    upNext: true,
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFCKA7MriMCQUBEQ3S9pcPSWjs4qYdySBJRtPLoSHgzxpu-IwpKDCJBGhHsM1oPMYgbJSzEcHF4DFtFVhV1QfhyXkbQ7SzDWruVwLTvPEpIIy0s_pfryB2elXv7drwJJQw1THw9hwsJ_zQihK2hHhZlEVlJIj2YsoD-jHJjlaJNXgYhjWOONpO5mUjr_7C8TiZU3cG1pfojNYzWgG6zfh9jhDpjLiwz-4hDVn22FSfXCr5Wnd9gumzRbkQKW0z7c3kxqxJ6Lu7E8Q',
    videoImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFCKA7MriMCQUBEQ3S9pcPSWjs4qYdySBJRtPLoSHgzxpu-IwpKDCJBGhHsM1oPMYgbJSzEcHF4DFtFVhV1QfhyXkbQ7SzDWruVwLTvPEpIIy0s_pfryB2elXv7drwJJQw1THw9hwsJ_zQihK2hHhZlEVlJIj2YsoD-jHJjlaJNXgYhjWOONpO5mUjr_7C8TiZU3cG1pfojNYzWgG6zfh9jhDpjLiwz-4hDVn22FSfXCr5Wnd9gumzRbkQKW0z7c3kxqxJ6Lu7E8Q',
    lyrics: [
      { id: 1, timeSeconds: 5, text: "If you wanna run away with me, I know a galaxy", spanishTranslation: "Si quieres huir conmigo, conozco una galaxia" },
      { id: 2, timeSeconds: 11, text: "And I can take you for a ride", spanishTranslation: "Y puedo llevarte a dar un paseo" },
      { id: 3, timeSeconds: 16, text: "I had a premonition that we fell into a rhythm", spanishTranslation: "Tuve la premonición de que caímos en un ritmo" },
      { id: 4, timeSeconds: 22, text: "You want me, I want you, baby", spanishTranslation: "Me quieres, te quiero, cariño" }
    ]
  },
  {
    id: 'shape-of-you-ed-sheeran',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    level: 'B2 Upper Int',
    genre: 'Pop Hits',
    durationSeconds: 233,
    practicedCount: '2.5k',
    upNext: true,
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0VZv_PIjSV6I4qABOYLXZkGTOAwJV04E6iGbFXzcDeti4F9GTu9Io83YhKPsBf42YBmOlHaPXPCqyZF_YCtpfPe22qjXQ-Dui-ArTqvd5x7OGroukYQNuAaoACb4ZOZ-YHGscuwa8Osfy_y_oL5AiZBUStxcerQ7GqL1AwGlJuXkYWib14Tncv4hPb2Zs1Ga-N4tjVCjpmWFlepJvJkPa2wsifJMndLTFGaQe5BrdJt4OcZLmQQd1Tw5SinXg-UsMd6tT7dEKujM',
    videoImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0VZv_PIjSV6I4qABOYLXZkGTOAwJV04E6iGbFXzcDeti4F9GTu9Io83YhKPsBf42YBmOlHaPXPCqyZF_YCtpfPe22qjXQ-Dui-ArTqvd5x7OGroukYQNuAaoACb4ZOZ-YHGscuwa8Osfy_y_oL5AiZBUStxcerQ7GqL1AwGlJuXkYWib14Tncv4hPb2Zs1Ga-N4tjVCjpmWFlepJvJkPa2wsifJMndLTFGaQe5BrdJt4OcZLmQQd1Tw5SinXg-UsMd6tT7dEKujM',
    lyrics: [
      { id: 1, timeSeconds: 5, text: "The club isn't the best place to find a lover", spanishTranslation: "El club no es el mejor lugar para encontrar un amante" },
      { id: 2, timeSeconds: 10, text: "So the bar is where I go", spanishTranslation: "Así que al bar es donde voy" },
      { id: 3, timeSeconds: 15, text: "Me and my friends at the table doing shots", spanishTranslation: "Mis amigos y yo en la mesa tomando chupitos" },
      { id: 4, timeSeconds: 20, text: "Drinking fast and then we talk slow", spanishTranslation: "Bebiendo rápido y luego hablando despacio" }
    ]
  },
  {
    id: 'believer-imagine-dragons',
    title: 'Believer',
    artist: 'Imagine Dragons',
    level: 'B1 Intermediate',
    genre: 'Rock Anthems',
    durationSeconds: 204,
    practicedCount: '4.8k',
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop',
    videoImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop',
    lyrics: [
      { id: 1, timeSeconds: 5, text: "First things first, I'mma say all the words inside my head", spanishTranslation: "Primero que nada, diré todas las palabras dentro de mi cabeza" },
      { id: 2, timeSeconds: 10, text: "I'm fired up and tired of the way that things have been", spanishTranslation: "Estoy entusiasmado y cansado de cómo han sido las cosas" },
      { id: 3, timeSeconds: 15, text: "Pain! You made me a, you made me a believer, believer", spanishTranslation: "¡Dolor! Me hiciste, me hiciste un creyente" }
    ]
  }
];

export const INITIAL_USER_STATS: UserStats = {
  weeklyXp: 1420,
  newWords: 84,
  songsDone: 32,
  pronunciationPercent: 92,
  streakDays: 12,
  dailyGoalProgress: 80
};

export const BADGES_DATA: AchievementBadge[] = [
  {
    id: 'superstar',
    name: 'Superstar',
    icon: 'star',
    colorGradient: 'from-yellow-400 to-amber-200',
    unlocked: true,
    description: 'Sang 10 songs with pitch accuracy above 90%'
  },
  {
    id: 'sparkles',
    name: 'Sparkles',
    icon: 'auto_awesome',
    colorGradient: 'from-cyan-400 to-blue-200',
    unlocked: true,
    description: 'Mastered 50 new English vocabulary words'
  },
  {
    id: 'elite',
    name: 'Elite',
    icon: 'military_tech',
    colorGradient: 'from-rose-400 to-pink-200',
    unlocked: true,
    description: 'Maintained a 10+ day singing practice streak'
  },
  {
    id: 'locked-master',
    name: 'Master',
    icon: 'lock',
    colorGradient: 'from-gray-300 to-gray-200',
    unlocked: false,
    description: 'Reach 2,000 XP in a single week'
  }
];

export const GENRES_LIST = [
  'Pop Hits',
  'Disney Classics',
  'Movie Tracks',
  'Rock Anthems',
  'Jazz Vocals',
  'Hip Hop Flow',
  '80s Rewind'
];
