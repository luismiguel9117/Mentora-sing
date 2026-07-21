// src/components/SubtitleEditor.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCatalog, loadSubtitles, saveSubtitles } from '../utils/supabase';
import '../styles/subtitle-editor.css';

export default function SubtitleEditor() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [videoInfo, setVideoInfo] = useState(null);

  const [subtitles, setSubtitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(60); // Default placeholder duration
  const [selectedCueIndex, setSelectedCueIndex] = useState(null);
  const activeCue = selectedCueIndex !== null ? subtitles[selectedCueIndex] : null;
  const currentActiveCue = subtitles.find(cue => currentTime >= cue.start && currentTime <= cue.end);
  const [generating, setGenerating] = useState(false);

  const handleAutoGenerateSubs = async () => {
    if (!videoInfo) return;
    if (videoInfo.type !== 'youtube') {
      alert('La generación automática de subtítulos está disponible solo para videos de YouTube.');
      return;
    }
    if (subtitles.length > 0) {
      const confirmOverwrite = window.confirm(
        'Ya existen subtítulos cargados. ¿Deseas borrarlos y generar nuevos?'
      );
      if (!confirmOverwrite) return;
    }
    setGenerating(true);
    try {
      const res = await fetch('/api/generate-youtube-subs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: videoInfo.url }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al conectar con la API');
      }
      const data = await res.json();
      if (data.success && data.subtitles) {
        setSubtitles(data.subtitles);
        setSelectedCueIndex(data.subtitles.length > 0 ? 0 : null);
        alert(`✅ ¡${data.subtitles.length} subtítulos generados con éxito!`);
      } else {
        throw new Error('disabled');
      }
    } catch (err) {
      console.error(err);
      if (
        err.message.includes('disabled') ||
        err.message.includes('No se encontraron') ||
        err.message.includes('no transcripts') ||
        err.message.includes('Transcript is disabled')
      ) {
        alert(
          '⚠️ Este video no tiene subtítulos disponibles en YouTube.\n\n' +
          'Posibles causas:\n' +
          '• El creador del video no ha subido subtítulos\n' +
          '• YouTube no generó subtítulos automáticos (videos sin diálogo claro)\n' +
          '• El video puede estar restringido por edad o región\n\n' +
          'Alternativa: Agrega subtítulos manualmente con el botón "+ Agregar Frase".'
        );
      } else {
        alert('Error al generar subtítulos: ' + err.message);
      }
    } finally {
      setGenerating(false);
    }
  };
  
  // Timeline zoom level (pixels per second)
  const [zoom, setZoom] = useState(15); 
  const timelineViewportRef = useRef(null);

  // Video player refs
  const videoRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const [ytReady, setYtReady] = useState(false);

  useEffect(() => {
    async function initEditor() {
      try {
        // 1. Fetch dynamic catalog to find the video metadata from Supabase
        let matchedVideo = null;
        try {
          const catalogData = await getCatalog();
          matchedVideo = catalogData.find(v => v.id === videoId);
        } catch (catErr) {
          console.warn('Failed to load Supabase catalog, falling back:', catErr);
        }

        // If not found in dynamic catalog, fallback to hardcoded list
        if (!matchedVideo) {
          const defaults = {
            'UF8uR6Z6KLc': { type: 'youtube', title: 'Discurso de Steve Jobs en Stanford', url: 'UF8uR6Z6KLc' },
            'Kat5Kbt092g': { type: 'youtube', title: 'Inside Out 2 (Intensa-Mente 2) - Tráiler', url: 'Kat5Kbt092g' },
            'pL24Rby_53A': { type: 'youtube', title: 'La Casa de Papel - Tráiler Bilingüe', url: 'pL24Rby_53A' },
            'local': { type: 'local', title: 'Sintel - Cortometraje de Fantasía', url: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4' },
          };
          matchedVideo = defaults[videoId] || { type: 'youtube', title: 'Video Personalizado', url: videoId };
        }

        setVideoInfo(matchedVideo);

        // 2. Load subtitles
        const data = await loadSubtitles(videoId);
        setSubtitles(data.sort((a, b) => a.start - b.start));
        if (data.length > 0) {
          setSelectedCueIndex(0);
        }
      } catch (e) {
        console.error('Failed to load data, initializing empty list:', e);
        setSubtitles([]);
      } finally {
        setLoading(false);
      }
    }
    initEditor();
  }, [videoId]);

  // YouTube SDK initialization
  useEffect(() => {
    if (loading || !videoInfo || videoInfo.type !== 'youtube') return;

    let sdkTag = document.getElementById('youtube-sdk-editor');
    if (!sdkTag) {
      const tag = document.createElement('script');
      tag.id = 'youtube-sdk-editor';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    const checkYT = setInterval(() => {
      if (window.YT && window.YT.Player) {
        clearInterval(checkYT);
        createYTPlayer();
      }
    }, 100);

    function createYTPlayer() {
      if (ytPlayerRef.current) return;
      try {
        ytPlayerRef.current = new window.YT.Player('yt-editor-iframe', {
          videoId: videoInfo.url,
          playerVars: {
            autoplay: 0,
            controls: 1,
            rel: 0,
            showinfo: 0,
            modestbranding: 1,
            enablejsapi: 1,
            cc_load_policy: 3, // Force closed captions OFF
            iv_load_policy: 3, // Disable annotations
            playsinline: 1     // Force inline playback on mobile
          },
          events: {
            'onReady': (event) => {
              setYtReady(true);
              const duration = event.target.getDuration();
              if (duration > 0) setVideoDuration(duration);
            },
            'onStateChange': onPlayerStateChange
          }
        });
      } catch (e) {
        console.error('Error creating YouTube player in editor:', e);
      }
    }

    let intervalId;
    function onPlayerStateChange(event) {
      if (event.data === window.YT.PlayerState.PLAYING) {
        intervalId = setInterval(() => {
          if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
            const time = ytPlayerRef.current.getCurrentTime();
            setCurrentTime(time);
            const duration = ytPlayerRef.current.getDuration();
            if (duration > 0) setVideoDuration(duration);
          }
        }, 100);
      } else {
        clearInterval(intervalId);
      }
    }

    return () => {
      clearInterval(checkYT);
      clearInterval(intervalId);
      ytPlayerRef.current = null;
    };
  }, [videoId, videoInfo, loading]);


  // Local Video time updates
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration || 60);
    }
  };

  const seekTo = (seconds) => {
    const time = Math.max(0, Math.min(seconds, videoDuration));
    setCurrentTime(time);
    if (videoInfo.type === 'youtube' && ytPlayerRef.current && ytPlayerRef.current.seekTo) {
      ytPlayerRef.current.seekTo(time, true);
    } else if (videoInfo.type === 'local' && videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const togglePlayPause = () => {
    if (!videoInfo) return;
    if (videoInfo.type === 'youtube' && ytPlayerRef.current) {
      try {
        const state = ytPlayerRef.current.getPlayerState();
        if (state === 1) { // playing
          ytPlayerRef.current.pauseVideo();
        } else {
          ytPlayerRef.current.playVideo();
        }
      } catch (e) {
        console.warn('YT player not ready to toggle:', e);
      }
    } else if (videoInfo.type === 'local' && videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  // Keyboard Shortcuts Hook (Space: Play/Pause, A: Back 1s, D: Forward 1s, S: Replay block)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore key events if user is typing inside input or textarea
      const activeEl = document.activeElement;
      if (activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.isContentEditable
      )) {
        return;
      }

      const key = e.key.toLowerCase();

      if (e.key === ' ' || key === 'spacebar') {
        e.preventDefault(); // Prevent page scroll
        togglePlayPause();
      } else if (key === 'a') {
        e.preventDefault();
        seekTo(currentTime - 1);
      } else if (key === 'd') {
        e.preventDefault();
        seekTo(currentTime + 1);
      } else if (key === 's') {
        e.preventDefault();
        if (activeCue) {
          seekTo(activeCue.start);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentTime, videoDuration, videoInfo, activeCue]);

  const updateCueField = (index, field, value) => {
    const updated = [...subtitles];
    updated[index] = { ...updated[index], [field]: value };
    setSubtitles(updated);
  };

  const addCueAtPlayhead = () => {
    const start = parseFloat(currentTime.toFixed(2));
    const end = start + 3;
    const newCue = {
      id: subtitles.length > 0 ? Math.max(...subtitles.map(c => c.id || 0)) + 1 : 1,
      start,
      end,
      en: 'English text...',
      es: 'Texto en español...'
    };
    const updated = [...subtitles, newCue].sort((a, b) => a.start - b.start);
    setSubtitles(updated);
    // Find the new index of this cue to select it
    const newIndex = updated.findIndex(c => c.id === newCue.id);
    setSelectedCueIndex(newIndex);
  };

  const deleteSelectedCue = () => {
    if (selectedCueIndex === null) return;
    if (window.confirm('¿Seguro que deseas eliminar este subtítulo?')) {
      const updated = subtitles.filter((_, idx) => idx !== selectedCueIndex);
      setSubtitles(updated);
      setSelectedCueIndex(updated.length > 0 ? 0 : null);
    }
  };

  const handleSave = async () => {
    try {
      await saveSubtitles(videoId, subtitles);
      alert('Subtítulos guardados con éxito en public/subtitles/' + videoId + '.json');
    } catch (e) {
      console.error(e);
      alert('Error al guardar los subtítulos: ' + e.message);
    }
  };

  // Timeline Click-to-Seek helper
  const handleTimelineClick = (e) => {
    if (!timelineViewportRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left + timelineViewportRef.current.scrollLeft;
    const clickedSeconds = clickX / zoom;
    seekTo(clickedSeconds);
  };

  // Timeline Mouse Drag / Resize logic
  const handleCueMouseDown = (e, index, action) => {
    e.preventDefault();
    e.stopPropagation();

    setSelectedCueIndex(index);
    const startX = e.clientX;
    const cue = subtitles[index];
    const initialStart = cue.start;
    const initialEnd = cue.end;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaSeconds = deltaX / zoom;

      setSubtitles(prev => {
        const updated = [...prev];
        if (action === 'move') {
          const duration = initialEnd - initialStart;
          let newStart = Math.max(0, initialStart + deltaSeconds);
          updated[index] = {
            ...cue,
            start: parseFloat(newStart.toFixed(2)),
            end: parseFloat((newStart + duration).toFixed(2))
          };
        } else if (action === 'resize-left') {
          let newStart = Math.max(0, Math.min(initialEnd - 0.1, initialStart + deltaSeconds));
          updated[index] = {
            ...cue,
            start: parseFloat(newStart.toFixed(2))
          };
        } else if (action === 'resize-right') {
          let newEnd = Math.max(initialStart + 0.1, initialEnd + deltaSeconds);
          updated[index] = {
            ...cue,
            end: parseFloat(newEnd.toFixed(2))
          };
        }
        return updated;
      });
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      // Auto sort on mouse release to keep clips structured chronologically
      setSubtitles(prev => [...prev].sort((a, b) => a.start - b.start));
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Format seconds to readable format (mm:ss.SS)
  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    const milliseconds = Math.floor((secs % 1) * 100);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };


  const timelineDuration = Math.max(videoDuration, subtitles[subtitles.length - 1]?.end || 0) + 10;
  const timelineWidth = timelineDuration * zoom;

  if (loading) {
    return (
      <div className="editor-loading">
        <div className="spinner"></div>
        <p>Cargando editor y subtítulos...</p>
      </div>
    );
  }

  return (
    <div className="editor-container">
      {/* Upper Navigation Header */}
      <div className="editor-header">
        <button className="back-btn" onClick={() => navigate('/config')}>
          ← Volver a la Lista
        </button>
        <div className="editor-title-row">
          <h1>Editor de Subtítulos: <span className="highlight">{videoInfo.title}</span></h1>
          <div style={{ display: 'flex', gap: '12px' }}>
            {videoInfo.type === 'youtube' && (
              <button 
                className="btn-3d" 
                onClick={handleAutoGenerateSubs} 
                disabled={generating}
                style={{ 
                  backgroundColor: '#4f46e5', 
                  color: '#ffffff', 
                  borderBottom: '4px solid #4338ca', 
                  borderRadius: '9999px', 
                  padding: '10px 20px', 
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}
              >
                {generating ? '⏳ Generando con IA...' : '✨ Generar Subtítulos (YouTube / IA)'}
              </button>
            )}
            <button className="btn-3d save-btn" onClick={handleSave}>
              💾 Guardar Cambios en JSON
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace: Player and Edit Inputs */}
      <div className="editor-top-section">
        {/* Left: Player panel */}
        <div className="editor-player-panel">
          <div className="player-wrapper-card">
            <div className="player-preview-container" style={{ position: 'relative', width: '100%' }}>
              {videoInfo.type === 'youtube' ? (
                <div className="yt-player-wrapper">
                  <div id="yt-editor-iframe"></div>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  src={videoInfo.url}
                  controls
                  className="local-video-player"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                />
              )}
              {currentActiveCue && (
                <div className="editor-subtitle-overlay">
                  <div className="editor-sub-en">{currentActiveCue.en}</div>
                  {currentActiveCue.es && <div className="editor-sub-es">{currentActiveCue.es}</div>}
                </div>
              )}
            </div>
            <div className="player-custom-controls-row">
              <button className="ctrl-icon-btn" onClick={() => seekTo(currentTime - 5)} title="Retroceder 5 segundos">⏪ 5s</button>
              <button className="ctrl-icon-btn" onClick={() => seekTo(currentTime - 1)} title="Retroceder 1 segundo">⏪ 1s</button>
              <button className="ctrl-icon-btn play-pause-btn" onClick={togglePlayPause} title="Reproducir / Pausar">⏯️ Play / Pausa</button>
              <button className="ctrl-icon-btn" onClick={() => seekTo(currentTime + 1)} title="Adelantar 1 segundo">1s ⏩</button>
              <button className="ctrl-icon-btn" onClick={() => seekTo(currentTime + 5)} title="Adelantar 5 segundos">5s ⏩</button>
            </div>

            <div className="player-progress-bar-row">
              <input
                type="range"
                min="0"
                max={videoDuration || 100}
                step="0.05"
                value={currentTime || 0}
                onChange={(e) => seekTo(parseFloat(e.target.value))}
                className="custom-seek-bar"
                title="Desliza para buscar en el video"
              />
            </div>

            <div className="player-shortcuts-bar">
              <span className="shortcuts-title">⌨️ Accesos Rápidos:</span>
              <span className="shortcut-item"><kbd>Espacio</kbd> Play/Pausa</span>
              <span className="shortcut-item"><kbd>A</kbd> −1s</span>
              <span className="shortcut-item"><kbd>D</kbd> +1s</span>
              <span className="shortcut-item"><kbd>S</kbd> Repetir Frase</span>
            </div>

            <div className="player-meta-row">
              <span className="current-playback-time">
                ⏱️ {formatTime(currentTime)} / {formatTime(videoDuration)}
              </span>
              <span className="badge-type">{videoInfo.type.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Right: Selected Cue Detailed Edit Card */}
        <div className="editor-detail-panel">
          {activeCue ? (
            <div className="cue-edit-card">
              <div className="card-header-row">
                <h2>Editar Bloque #{selectedCueIndex + 1}</h2>
                <button className="delete-cue-btn" onClick={deleteSelectedCue} title="Eliminar este bloque">
                  🗑️ Eliminar
                </button>
              </div>

              <div className="edit-fields-grid">
                <div className="time-edit-box">
                  <div className="time-field">
                    <label>Tiempo Inicio (s)</label>
                    <div className="time-setter">
                      <button className="step-btn" onClick={() => seekTo(Math.max(0, activeCue.start - 0.1))}>-0.1s</button>
                      <input
                        type="number"
                        step="0.05"
                        value={activeCue.start}
                        onChange={(e) => updateCueField(selectedCueIndex, 'start', Number(e.target.value))}
                      />
                      <button className="step-btn" onClick={() => seekTo(activeCue.start + 0.1)}>+0.1s</button>
                    </div>
                  </div>
                  <div className="time-field">
                    <label>Tiempo Fin (s)</label>
                    <div className="time-setter">
                      <button className="step-btn" onClick={() => seekTo(Math.max(0, activeCue.end - 0.1))}>-0.1s</button>
                      <input
                        type="number"
                        step="0.05"
                        value={activeCue.end}
                        onChange={(e) => updateCueField(selectedCueIndex, 'end', Number(e.target.value))}
                      />
                      <button className="step-btn" onClick={() => seekTo(activeCue.end + 0.1)}>+0.1s</button>
                    </div>
                  </div>
                </div>

                <div className="text-edit-box">
                  <div className="input-row-lang">
                    <span className="badge-lang en">EN</span>
                    <textarea
                      value={activeCue.en}
                      onChange={(e) => updateCueField(selectedCueIndex, 'en', e.target.value)}
                      placeholder="English subtitle text..."
                    />
                  </div>
                  <div className="input-row-lang">
                    <span className="badge-lang es">ES</span>
                    <textarea
                      value={activeCue.es}
                      onChange={(e) => updateCueField(selectedCueIndex, 'es', e.target.value)}
                      placeholder="Texto traducido al español..."
                    />
                  </div>
                </div>
              </div>

              <div className="quick-actions-row">
                <button className="btn-3d preview-btn" onClick={() => seekTo(activeCue.start)}>
                  🔄 Reproducir Fragmento
                </button>
                <button className="btn-3d add-here-btn" onClick={addCueAtPlayhead}>
                  ➕ Insertar Nuevo Bloque Aquí
                </button>
              </div>
            </div>
          ) : (
            <div className="no-cue-selected">
              <p>Ningún bloque seleccionado.</p>
              <button className="btn-3d add-here-btn" onClick={addCueAtPlayhead}>
                ➕ Crear primer bloque en {currentTime.toFixed(1)}s
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Timeline Editor: Remotion/Premiere style */}
      <div className="editor-timeline-section">
        <div className="timeline-controls">
          <div className="zoom-ctrls">
            <button className="zoom-btn" onClick={() => setZoom(Math.max(5, zoom - 3))} title="Disminuir Zoom (Menos detalle)">🔍−</button>
            <button className="zoom-btn" onClick={() => setZoom(Math.min(50, zoom + 3))} title="Aumentar Zoom (Más detalle)">🔍+</button>
            <span className="zoom-indicator">Zoom: {zoom}px/s</span>
          </div>
          <div className="timeline-hint">
            ⌨️ <strong>Accesos Rápidos:</strong> [Espacio] Play/Pausa · [A] -1s · [D] +1s · [S] Repetir Bloque (fuera de los campos de texto)
          </div>
        </div>

        <div className="timeline-viewport" ref={timelineViewportRef}>
          {/* Draggable tracks container */}
          <div
            className="timeline-tracks-area"
            style={{ width: `${timelineWidth}px` }}
            onClick={handleTimelineClick}
          >
            {/* 1. Time ticks Ruler */}
            <div className="timeline-ruler">
              {Array.from({ length: Math.ceil(timelineDuration) }).map((_, sec) => {
                // Show label every 5 seconds, small tick for each second
                const showLabel = sec % 5 === 0;
                return (
                  <div
                    key={sec}
                    className={`ruler-tick ${showLabel ? 'major' : ''}`}
                    style={{ left: `${sec * zoom}px` }}
                  >
                    {showLabel && <span className="ruler-time-label">{sec}s</span>}
                  </div>
                );
              })}
            </div>

            {/* 2. Subtitle Clips Track */}
            <div className="timeline-track">
              {subtitles.map((cue, idx) => {
                const isSelected = selectedCueIndex === idx;
                const left = cue.start * zoom;
                const width = (cue.end - cue.start) * zoom;
                const isActive = currentTime >= cue.start && currentTime <= cue.end;

                return (
                  <div
                    key={cue.id || idx}
                    className={`timeline-clip ${isSelected ? 'selected' : ''} ${isActive ? 'active' : ''}`}
                    style={{
                      left: `${left}px`,
                      width: `${Math.max(width, 24)}px`
                    }}
                    onDoubleClick={() => seekTo(cue.start)}
                    onMouseDown={(e) => handleCueMouseDown(e, idx, 'move')}
                  >
                    {/* Left drag handle */}
                    <div
                      className="resize-handle left"
                      onMouseDown={(e) => handleCueMouseDown(e, idx, 'resize-left')}
                    />

                    {/* Clip text contents */}
                    <div className="clip-label-text">
                      <span className="clip-idx">#{idx + 1}</span>
                      <span className="clip-txt">{cue.en}</span>
                    </div>

                    {/* Right drag handle */}
                    <div
                      className="resize-handle right"
                      onMouseDown={(e) => handleCueMouseDown(e, idx, 'resize-right')}
                    />
                  </div>
                );
              })}
            </div>

            {/* 3. Red Vertical Playhead indicator */}
            <div
              className="timeline-playhead"
              style={{ left: `${currentTime * zoom}px` }}
            >
              <div className="playhead-pointer">▼</div>
              <div className="playhead-line" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
