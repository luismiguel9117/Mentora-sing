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

  // Form states for adding a new song
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newLevel, setNewLevel] = useState('B1 Intermediate');
  const [newGenre, setNewGenre] = useState('Pop Hits');
  const [newUrl, setNewUrl] = useState('');
  const [newCoverImage, setNewCoverImage] = useState('');
  const [newDuration, setNewDuration] = useState(180);

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

  const handleAddSong = async (e) => {
    e.preventDefault();
    if (!newTitle || !newUrl || !newArtist) {
      alert('Por favor completa el título, el artista y la URL/ID del video de YouTube.');
      return;
    }

    const finalId = extractYoutubeId(newUrl.trim());
    if (finalId.length !== 11) {
      alert('Por favor introduce un enlace o ID de YouTube de 11 caracteres válido.');
      return;
    }

    // Check if ID already exists
    if (catalog.some(v => v.id === finalId)) {
      alert('Ya existe una canción con este ID de video en el catálogo.');
      return;
    }

    const defaultImage = `https://img.youtube.com/vi/${finalId}/hqdefault.jpg`;
    const coverImage = newCoverImage.trim() || defaultImage;

    const newSong = {
      id: finalId,
      title: newTitle.trim(),
      artist: newArtist.trim(),
      level: newLevel,
      genre: newGenre,
      durationSeconds: Number(newDuration) || 180,
      videoImage: defaultImage,
      coverImage
    };

    try {
      // 1. Save video to Supabase Catalog
      await saveVideoToCatalog(newSong);

      // 2. Initialize empty subtitle template for this video ID to prevent 404s
      await saveSubtitles(finalId, [
        {
          id: 1,
          start: 1.0,
          end: 4.0,
          en: 'Welcome to your new karaoke track. Click to edit this subtitle.',
          es: 'Bienvenido a tu nueva pista de karaoke. Haz clic para editar este subtítulo.'
        }
      ]);

      setCatalog(prev => [...prev, newSong]);
      
      // Reset form
      setNewTitle('');
      setNewArtist('');
      setNewUrl('');
      setNewCoverImage('');
      setNewDuration(180);
      alert('Canción agregada exitosamente al catálogo en Supabase.');
    } catch (err) {
      console.error(err);
      alert('Error al agregar la canción: ' + err.message);
    }
  };

  const handleRemoveSong = async (songId) => {
    if (!window.confirm('¿Seguro que deseas quitar esta canción del catálogo? Las letras guardadas en la base de datos no se borrarán pero ya no aparecerá en el dashboard.')) {
      return;
    }

    try {
      // Remove video from Supabase Catalog
      await deleteVideoFromCatalog(songId);
      setCatalog(prev => prev.filter(v => v.id !== songId));
      alert('Canción removida del catálogo de Supabase exitosamente.');
    } catch (err) {
      console.error(err);
      alert('Error al remover la canción: ' + err.message);
    }
  };

  const handleSaveThumbnail = async (songId) => {
    const targetSong = catalog.find(v => v.id === songId);
    if (!targetSong) return;

    const updatedSong = { ...targetSong, coverImage: tempThumbnailUrl.trim() };

    try {
      await saveVideoToCatalog(updatedSong);
      setCatalog(prev => prev.map(v => v.id === songId ? updatedSong : v));
      setEditingThumbnailVideoId(null);
      setTempThumbnailUrl('');
      alert('Portada de la canción actualizada exitosamente en Supabase.');
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
    <div className="config-container text-slate-800">
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
            ← Volver a Mentora Sing
          </button>

          <div style={{ position: 'relative', zIndex: 10, animation: 'fadeIn 0.6s ease-out' }}>
            <LoginPage.LoginForm onSubmit={handleLoginSubmit} />
          </div>
        </div>
      ) : (
        <>
          <div className="config-header">
            <button className="back-to-app-btn" onClick={() => navigate('/')}>
              ← Volver a Mentora Sing
            </button>
          </div>
        <div className="admin-workspace-grid">
          {/* Left: Content manager list */}
          <div className="video-management-card">
            <h2>Gestión de Canciones y Letras</h2>
            <p className="config-subtitle">Administra los temas musicales de Mentora Sing y edita su sincronización de subtítulos.</p>
            
            <div className="video-list-container">
              {catalog.length === 0 ? (
                <p className="empty-catalog-text">No hay canciones en el catálogo. Agrega una a la derecha.</p>
              ) : (
                catalog.map((v) => (
                  <div key={v.id} className="video-list-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img 
                        src={v.coverImage} 
                        alt={v.title} 
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} 
                      />
                      <div className="video-item-details" style={{ flex: 1 }}>
                        <h3 className="font-bold text-sm text-slate-800" style={{ margin: 0 }}>{v.title}</h3>
                        <p className="text-xs text-slate-500 font-medium" style={{ margin: '2px 0 4px 0' }}>{v.artist}</p>
                        <div className="video-item-submeta" style={{ display: 'flex', gap: '6px', fontSize: '9px' }}>
                          <span style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '2px 6px', borderRadius: '9999px', fontWeight: 700 }}>{v.level}</span>
                          <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '9999px', fontWeight: 700 }}>{v.genre}</span>
                        </div>
                      </div>
                      <div className="video-item-actions">
                        <button
                          className="btn-3d edit-btn"
                          onClick={() => goToEditor(v.id)}
                        >
                          ✏️ Letra
                        </button>
                        <button
                          className="remove-btn"
                          onClick={() => handleRemoveSong(v.id)}
                          title="Quitar canción"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Inline Cover Image editor */}
                    {editingThumbnailVideoId === v.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', margin: '6px 0' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Editar Portada de la Canción</span>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input 
                            type="text" 
                            placeholder="URL de la portada (.jpg, .png)"
                            value={tempThumbnailUrl}
                            onChange={(e) => setTempThumbnailUrl(e.target.value)}
                            style={{ flex: 1, padding: '6px 10px', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#000' }}
                          />
                          {tempThumbnailUrl && (
                            <button 
                              type="button" 
                              onClick={() => setTempThumbnailUrl('')}
                              style={{ padding: '6px 10px', fontSize: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#f1f5f9', color: '#475569', cursor: 'pointer' }}
                            >
                              Limpiar
                            </button>
                          )}
                        </div>
                        
                        <div style={{
                          border: '1.5px dashed #cbd5e1',
                          borderRadius: '8px',
                          padding: '8px',
                          textAlign: 'center',
                          backgroundColor: '#fff',
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
                          <span style={{ fontSize: '0.75rem', color: '#4f46e5', fontWeight: 700 }}>
                            {uploading ? '⏳ Subiendo imagen...' : '📂 Subir nueva portada desde PC'}
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', paddingLeft: '4rem' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingThumbnailVideoId(v.id);
                            setTempThumbnailUrl(v.coverImage || '');
                          }}
                          style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', padding: 0, textDecoration: 'underline', fontWeight: 600 }}
                        >
                          {v.coverImage ? '🖼️ Cambiar Portada' : '🖼️ Agregar Portada/Miniatura'}
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Add new song form */}
          <div className="add-video-card">
            <h2>Agregar Nueva Canción</h2>
            <p className="config-subtitle">Introduce los detalles del video musical de YouTube para añadirlo al juego de Karaoke.</p>
            
            <form onSubmit={handleAddSong} className="add-video-form">
              <div className="form-group">
                <label>Título de la Canción</label>
                <input
                  type="text"
                  placeholder="Ej: Flowers"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Nombre del Artista</label>
                <input
                  type="text"
                  placeholder="Ej: Miley Cyrus"
                  value={newArtist}
                  onChange={(e) => setNewArtist(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Nivel de Dificultad (CEFR)</label>
                  <select value={newLevel} onChange={(e) => setNewLevel(e.target.value)}>
                    <option value="A1 Beginner">A1 Beginner</option>
                    <option value="A2 Elementary">A2 Elementary</option>
                    <option value="B1 Intermediate">B1 Intermediate</option>
                    <option value="B2 Upper Int">B2 Upper Int</option>
                    <option value="C1 Advanced">C1 Advanced</option>
                  </select>
                </div>

                <div className="form-group flex-1">
                  <label>Género Musical</label>
                  <input
                    type="text"
                    placeholder="Ej: Pop Hits, Rock, R&B"
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Enlace o ID del Video de YouTube</label>
                <input
                  type="text"
                  placeholder="Ej: https://www.youtube.com/watch?v=2Vv-BfVoq4g"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  required
                />
              </div>

               <div className="form-group">
                 <label>Portada del Álbum / Canción (Opcional)</label>
                 <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                   <input
                     type="text"
                     placeholder="URL de la imagen (o sube una abajo)"
                     value={newCoverImage}
                     onChange={(e) => setNewCoverImage(e.target.value)}
                     style={{ flexGrow: 1 }}
                   />
                   {newCoverImage && (
                     <button 
                       type="button" 
                       onClick={() => setNewCoverImage('')}
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
                     onChange={(e) => handleCoverUpload(e.target.files[0], (url) => setNewCoverImage(url))}
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
                     {uploading ? '⏳ Subiendo imagen...' : '📂 Subir portada desde PC'}
                   </span>
                 </div>
               </div>

              <div className="form-group">
                <label>Duración del Video (segundos)</label>
                <input
                  type="number"
                  placeholder="Ej: 180"
                  value={newDuration}
                  onChange={(e) => setNewDuration(Number(e.target.value))}
                />
              </div>

              <button type="submit" className="btn-3d add-submit-btn">
                ➕ Agregar Canción al Catálogo
              </button>
            </form>
          </div>
        </div>
      </>)}
    </div>
  );
}
