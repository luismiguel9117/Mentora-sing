// src/utils/auth.js
// Simple client‑side password check. In production you would never store a password in the client.
// The password is read from a Vite environment variable (VITE_ADMIN_PASSWORD).

export function checkPassword(pwd) {
  const correct = import.meta.env.VITE_ADMIN_PASSWORD || 'mentora2026';
  return pwd === correct;
}
