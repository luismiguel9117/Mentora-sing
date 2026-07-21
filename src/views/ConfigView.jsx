// src/views/ConfigView.jsx
import React, { useState, useEffect } from 'react';
import { checkPassword } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import { getCatalog, saveVideoToCatalog, deleteVideoFromCatalog, saveSubtitles } from '../utils/supabase';
import LoginPage from '../components/ui/gaming-login';
import '../styles/config.css';

export default function ConfigView() {
  const [auth, setAuth] = useState(() => sessionStorage.getItem('mentora_admin_auth') === '1');
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Form states for adding new video
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newType, setNewType] = useState('youtube');
  const [newCategory, setNewCategory] = useState('');
  const [newEmoji, setNewEmoji] = useState('🎬');
  const [newThumbnail, setNewThumbnail] = useState('');
  const [editingThumbnailVideoId, setEditingThumbnailVideoId] = useState(null);
  const [tempThumbnailUrl, setTempThumbnailUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleCoverUpload = async (file, onUploadSuccess) => {
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result;
      try {
        const res = await fetch('/api/upload-cover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            base64Data
          })
        });
        if (!res.ok) throw new Error('Error al subir el archivo al servidor.');
        const data = await res.json();
        if (data.success && data.url) {
          onUploadSuccess(data.url);
        } else {
          throw new Error('Respuesta inválida del servidor');
        }
      } catch (err) {
        console.error(err);
        alert('Error al subir la imagen: ' + err.message);
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => {
      alert('Error al leer el archivo de imagen.');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Load catalog from Supabase
  useEffect(() => {
    async function fetchCatalog() {
      try {
        const data = await getCatalog();
        setCatalog(data);
      } catch (e) {
        console.error('Failed to fetch catalog:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchCatalog();
  }, []);

  const handleLoginSubmit = (password) => {
    if (checkPassword(password)) {
      sessionStorage.setItem('mentora_admin_auth', '1');
      setAuth(true);
    } else {
      alert('Contraseña incorrecta');
    }
  };

  // Helper to extract YouTube ID from standard URL formats (includes shorts, youtu.be, embeds)
  const extractYoutubeId = (url) => {
    if (!url) return '';
    url = url.trim();
    if (url.length === 11 && !url.includes('/') && !url.includes('?')) {
      return url;
    }
    const matchers = [
      /youtu\.be\/([^#\&\?\/]+)/,
      /youtube\.com\/watch\?v=([^#\&\?]+)/,
      /youtube\.com\/embed\/([^#\&\?\/]+)/,
      /youtube\.com\/shorts\/([^#\&\?\/]+)/,
      /youtube\.com\/v\/([^#\&\?\/]+)/,
      /youtube\.com\/u\/\w\/([^#\&\?\/]+)/,
      /watch\?v=([^#\&\?]+)/,
      /\&v=([^#\&\?]+)/
    ];
    for (const regex of matchers) {
      const match = url.match(regex);
      if (match && match[1] && match[1].length === 11) {
        return match[1];
      }
    }
    return url;
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    if (!newTitle || !newUrl) {
      alert('Por favor completa el título y la URL/ID del video.');
      return;
    }

    let finalId = '';
    let finalUrl = newUrl.trim();

    if (newType === 'youtube') {
      // Extract ID if it is a full URL, or keep if it's already an ID
      finalId = extractYoutubeId(finalUrl);
      finalUrl = finalId;
    } else {
      // Generate a unique ID for local video from the title
      finalId = 'local_' + Date.now();
    }

    // Check if ID already exists
    if (catalog.some(v => v.id === finalId)) {
      alert('Ya existe un video con este ID en el catálogo.');
      return;
    }

    const newVideo = {
      id: finalId,
      title: newTitle.trim(),
      url: finalUrl,
      type: newType,
      category: newCategory.trim() || 'General',
      emoji: newEmoji.trim() || '🎬',
      thumbnail: newThumbnail.trim()
    };

    const updatedCatalog = [...catalog, newVideo];

    try {
      // 1. Save video to Supabase Catalog
      await saveVideoToCatalog(newVideo);

      // 2. Initialize empty subtitle template for this video ID to prevent 404s
      await saveSubtitles(finalId, [
        {
          id: 1,
          start: 1.0,
          end: 4.0,
          en: 'Welcome to your new video. Click to edit this subtitle.',
          es: 'Bienvenido a tu nuevo video. Haz clic para editar este subtítulo.'
        }
      ]);

      setCatalog(updatedCatalog);
      
      // Reset form
      setNewTitle('');
      setNewUrl('');
      setNewCategory('');
      setNewEmoji('🎬');
      setNewThumbnail('');
      alert('Video agregado exitosamente al catálogo en Supabase.');
    } catch (err) {
      console.error(err);
      alert('Error al agregar el video: ' + err.message);
    }
  };

  const handleRemoveVideo = async (videoId) => {
    if (!window.confirm('¿Seguro que deseas quitar este video de la web general? Los subtítulos cargados no se borrarán del disco duro pero ya no aparecerán en la lista.')) {
      return;
    }

    const updatedCatalog = catalog.filter(v => v.id !== videoId);

    try {
      // Remove video from Supabase Catalog
      await deleteVideoFromCatalog(videoId);

      setCatalog(updatedCatalog);
      alert('Video removido del catálogo de Supabase exitosamente.');
    } catch (err) {
      console.error(err);
      alert('Error al remover el video: ' + err.message);
    }
  };

  const handleSaveThumbnail = async (videoId) => {
    const updatedCatalog = catalog.map(v => {
      if (v.id === videoId) {
        return { ...v, thumbnail: tempThumbnailUrl.trim() };
      }
      return v;
    });

    try {
      const targetVideo = updatedCatalog.find(v => v.id === videoId);
      if (targetVideo) {
        // Save the updated video to Supabase Catalog (includes the new thumbnail)
        await saveVideoToCatalog(targetVideo);
      }

      setCatalog(updatedCatalog);
      setEditingThumbnailVideoId(null);
      setTempThumbnailUrl('');
      alert('Portada actualizada exitosamente en Supabase.');
    } catch (err) {
      console.error(err);
      alert('Error al guardar la portada: ' + err.message);
    }
  };

  const goToEditor = (videoId) => {
    navigate(`/config/editor/${videoId}`);
  };

  if (loading) {
    return (
      <div className="config-loading">
        <div className="spinner"></div>
        <p>Cargando catálogo...</p>
      </div>
    );
  }

  return (
    <div className="config-container">
      {!auth ? (
        <div style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999
        }}>
          <LoginPage.VideoBackground />
          
          {/* Back button overlay */}
          <button 
            onClick={() => navigate('/')}
            style={{
              position: 'absolute',
              top: '24px',
              left: '24px',
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '9999px',
              padding: '10px 24px',
              color: '#ffffff',
              cursor: 'pointer',
              zIndex: 100,
              fontSize: '0.85rem',
              fontWeight: 700,
              transition: 'background 0.2s',
              fontFamily: "'Outfit', sans-serif"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.4)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
          >
            ← Volver a Cine Reactor
          </button>

          <div style={{ position: 'relative', zIndex: 10, animation: 'fadeIn 0.6s ease-out' }}>
            <LoginPage.LoginForm onSubmit={handleLoginSubmit} />
          </div>
        </div>
      ) : (
        <>
          <div className="config-header">
            <button className="back-to-app-btn" onClick={() => navigate('/')}>
              ← Volver a Cine Reactor
            </button>
          </div>
        <div className="admin-workspace-grid">
          {/* Left: Content manager list */}
          <div className="video-management-card">
            <h2>Gestión de Contenidos y Subtítulos</h2>
            <p className="config-subtitle">Administra los videos que se muestran en el catálogo y edita sus tiempos y traducciones.</p>
            
            <div className="video-list-container">
              {catalog.length === 0 ? (
                <p className="empty-catalog-text">No hay videos en el catálogo. Agrega uno a la derecha.</p>
              ) : (
                catalog.map((v) => (
                  <div key={v.id} className="video-list-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div className="video-item-emoji">{v.emoji}</div>
                      <div className="video-item-details" style={{ flex: 1 }}>
                        <h3>{v.title}</h3>
                        <div className="video-item-submeta">
                          <span className="video-item-cat">{v.category}</span>
                          <span className={`video-item-badge ${v.type}`}>{v.type.toUpperCase()}</span>
                        </div>
                      </div>
                      <div className="video-item-actions">
                        <button
                          className="btn-3d edit-btn"
                          onClick={() => goToEditor(v.id)}
                        >
                          ✏️ Subtítulos
                        </button>
                        <button
                          className="remove-btn"
                          onClick={() => handleRemoveVideo(v.id)}
                          title="Quitar video del catálogo"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Inline Cover Image editor */}
                    {editingThumbnailVideoId === v.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', backgroundColor: '#111827', padding: '10px', borderRadius: '10px', border: '1px solid #374151', margin: '6px 0' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af' }}>Editar Portada de Video</span>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input 
                            type="text" 
                            placeholder="URL de la imagen de portada (.jpg, .png, etc.)"
                            value={tempThumbnailUrl}
                            onChange={(e) => setTempThumbnailUrl(e.target.value)}
                            style={{ flex: 1, padding: '6px 10px', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid #4b5563', backgroundColor: '#1f2937', color: '#fff' }}
                          />
                          {tempThumbnailUrl && (
                            <button 
                              type="button" 
                              onClick={() => setTempThumbnailUrl('')}
                              style={{ padding: '6px 10px', fontSize: '0.75rem', border: '1px solid #4b5563', borderRadius: '6px', background: '#374151', color: '#d1d5db', cursor: 'pointer' }}
                            >
                              Limpiar
                            </button>
                          )}
                        </div>
                        
                        <div style={{
                          border: '1.5px dashed #4b5563',
                          borderRadius: '8px',
                          padding: '8px',
                          textAlign: 'center',
                          backgroundColor: '#1f2937',
                          cursor: 'pointer',
                          position: 'relative'
                        }}>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleCoverUpload(e.target.files[0], (url) => setTempThumbnailUrl(url))}
                            style={{
                              position: 'absolute',
                              inset: 0,
                              opacity: 0,
                              cursor: 'pointer',
                              width: '100%',
                              height: '100%'
                            }}
                            disabled={uploading}
                          />
                          <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>
                            {uploading ? '⏳ Subiendo imagen...' : '📂 Subir nueva imagen desde PC'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                          <button 
                            type="button"
                            className="btn-3d" 
                            style={{ padding: '6px 12px', fontSize: '0.75rem', backgroundColor: '#10b981', color: '#fff', borderBottom: '3px solid #065f46', borderRadius: '8px', cursor: 'pointer' }}
                            onClick={() => handleSaveThumbnail(v.id)}
                          >
                            Guardar
                          </button>
                          <button 
                            type="button"
                            className="btn-3d" 
                            style={{ padding: '6px 12px', fontSize: '0.75rem', backgroundColor: '#ef4444', color: '#fff', borderBottom: '3px solid #991b1b', borderRadius: '8px', cursor: 'pointer' }}
                            onClick={() => {
                              setEditingThumbnailVideoId(null);
                              setTempThumbnailUrl('');
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', paddingLeft: '3.2rem' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingThumbnailVideoId(v.id);
                            setTempThumbnailUrl(v.thumbnail || '');
                          }}
                          style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: 0, textDecoration: 'underline', fontWeight: 600 }}
                        >
                          {v.thumbnail ? '🖼️ Cambiar Portada' : '🖼️ Agregar Portada/Miniatura'}
                        </button>
                        {v.thumbnail && (
                          <a 
                            href={v.thumbnail} 
                            target="_blank" 
                            rel="noreferrer" 
                            style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.7rem' }}
                          >
                            (Ver Portada ↗️)
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Add new video form */}
          <div className="add-video-card">
            <h2>Agregar Nuevo Video</h2>
            <p className="config-subtitle">Introduce los detalles del video (YouTube o archivo directo) para añadirlo al catálogo.</p>
            
            <form onSubmit={handleAddVideo} className="add-video-form">
              <div className="form-group">
                <label>Título del Video</label>
                <input
                  type="text"
                  placeholder="Ej: Tráiler Oficial de Gladiador 2"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Tipo de Video</label>
                  <select value={newType} onChange={(e) => setNewType(e.target.value)}>
                    <option value="youtube">YouTube</option>
                    <option value="local">Archivo Local (MP4/WebM URL)</option>
                  </select>
                </div>

                <div className="form-group flex-1">
                  <label>Emoji del Ícono</label>
                  <input
                    type="text"
                    placeholder="Ej: 🍿, 🎬, 🚀"
                    value={newEmoji}
                    onChange={(e) => setNewEmoji(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>{newType === 'youtube' ? 'URL o ID del Video de YouTube' : 'Enlace Directo del Archivo de Video'}</label>
                <input
                  type="text"
                  placeholder={newType === 'youtube' ? 'https://www.youtube.com/watch?v=...' : 'https://ejemplo.com/video.mp4'}
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  required
                />
              </div>

               <div className="form-group">
                 <label>Portada / Miniatura (Opcional)</label>
                 <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                   <input
                     type="text"
                     placeholder="URL de la imagen (o sube una abajo)"
                     value={newThumbnail}
                     onChange={(e) => setNewThumbnail(e.target.value)}
                     style={{ flexGrow: 1 }}
                   />
                   {newThumbnail && (
                     <button 
                       type="button" 
                       onClick={() => setNewThumbnail('')}
                       style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#f1f5f9', cursor: 'pointer', fontSize: '0.8rem' }}
                     >
                       Limpiar
                     </button>
                   )}
                 </div>
                 <div style={{
                   border: '1.5px dashed #cbd5e1',
                   borderRadius: '8px',
                   padding: '10px',
                   textAlign: 'center',
                   backgroundColor: '#f8fafc',
                   cursor: 'pointer',
                   position: 'relative'
                 }}>
                   <input
                     type="file"
                     accept="image/*"
                     onChange={(e) => handleCoverUpload(e.target.files[0], (url) => setNewThumbnail(url))}
                     style={{
                       position: 'absolute',
                       inset: 0,
                       opacity: 0,
                       cursor: 'pointer',
                       width: '100%',
                       height: '100%'
                     }}
                     disabled={uploading}
                   />
                   <span style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: 700 }}>
                     {uploading ? '⏳ Subiendo imagen...' : '📂 Subir desde PC (Buscador de archivos)'}
                   </span>
                 </div>
               </div>

              <div className="form-group">
                <label>Categoría / Etiqueta</label>
                <input
                  type="text"
                  placeholder="Ej: Acción / Aventura"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-3d add-submit-btn">
                ➕ Agregar al Catálogo
              </button>
            </form>
          </div>
        </div>
      </>)}
    </div>
  );
}
