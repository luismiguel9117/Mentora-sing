import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, Gamepad2 } from 'lucide-react';
import '../../styles/gaming-login.css'; // Import the translated stylesheet

// Custom SVG components to replace missing brand/social icons in modern Lucide versions
const ChromeIcon = (props) => (
  <svg viewBox="0 0 24 24" width={props.size || 18} height={props.size || 18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <line x1="21.17" y1="8" x2="12" y2="8" />
    <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
    <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
  </svg>
);

const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" width={props.size || 18} height={props.size || 18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

// FormInput Component
const FormInput = ({ icon, type, placeholder, value, onChange, required }) => {
  return (
    <div className="gaming-input-wrapper">
      <div className="gaming-input-icon">
        {icon}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="gaming-input"
      />
    </div>
  );
};

// SocialButton Component
const SocialButton = ({ icon }) => {
  return (
    <button className="gaming-social-btn">
      {icon}
    </button>
  );
};

// ToggleSwitch Component
const ToggleSwitch = ({ checked, onChange, id }) => {
  return (
    <div className="gaming-toggle-switch">
      <input
        type="checkbox"
        id={id}
        className="gaming-toggle-input"
        checked={checked}
        onChange={onChange}
        readOnly
      />
      <div className="gaming-toggle-slider" />
    </div>
  );
};

// Corporate animated canvas background (plexus network — no external video URL needed)
const VideoBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animId;
    const PARTICLE_COUNT = 80;
    const MAX_DIST = 160;
    const particles = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Init particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        r: Math.random() * 2 + 1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Corporate dark gradient background
      const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bg.addColorStop(0, '#060b18');
      bg.addColorStop(0.5, '#0b1329');
      bg.addColorStop(1, '#080e20');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update & draw particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99,102,241,0.85)';
        ctx.fill();
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.4;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Subtle radial glow in center
      const glow = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.55
      );
      glow.addColorStop(0, 'rgba(79,70,229,0.08)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="gaming-video-bg-container">
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
    </div>
  );
};


// Main LoginForm Component
const LoginForm = ({ onSubmit }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulated network latency
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSuccess(true);
    await new Promise(resolve => setTimeout(resolve, 400));

    onSubmit(password);
    setIsSubmitting(false);
    setIsSuccess(false);
  };

  return (
    <div className="gaming-login-card">
      <div className="gaming-login-title-container">
        <div className="gaming-glow-effect"></div>
        <h2 className="gaming-login-title">
          Mentora
        </h2>
        <div className="gaming-login-subtitle">
          <span>Panel de Administración</span>
          <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>
            [Presiona Enter para acceder]
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="gaming-input-wrapper">
          <div className="gaming-input-icon">
            <Lock size={18} />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña de Administrador"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="gaming-input"
            style={{ paddingRight: '42px' }}
          />
          <button
            type="button"
            className="gaming-password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`gaming-submit-btn ${isSuccess ? 'success' : ''}`}
          style={{ marginTop: '0.5rem' }}
        >
          {isSubmitting ? 'Verificando...' : 'Acceder al Portal'}
        </button>
      </form>
    </div>
  );
};

// Export as default components
const LoginPage = {
  LoginForm,
  VideoBackground
};

export default LoginPage;
