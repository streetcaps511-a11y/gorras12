/**
 * 🚀 NITRO CACHE UTILITY
 * Maneja la persistencia de datos en localStorage para una experiencia instantánea.
 * Persiste incluso después de cerrar el navegador.
 */

const CACHE_PREFIX = 'nitro_cache_v29_'; // Eliminación total de bloqueos de DB

// 🧹 LIMPIEZA DE GHOSTS: Elimina rastros de versiones anteriores
try {
  const oldPrefixes = [
    'nitro_cache_v1_', 'nitro_cache_v2_', 'nitro_cache_v3_', 
    'nitro_cache_v4_', 'nitro_cache_v5_', 'nitro_cache_v7_', 
    'nitro_cache_v8_', 'nitro_cache_v9_', 'gm_cat_v2_',
  ];
  Object.keys(localStorage).forEach(k => {
    if (oldPrefixes.some(p => k.startsWith(p))) {
      localStorage.removeItem(k);
    }
  });
} catch {
  // Silenciar
}

export const NitroCache = {
  /**
   * Guarda datos en la caché persistente (localStorage)
   */
  set: (key, data) => {
    try {
      const payload = {
        data,
        timestamp: Date.now(),
        isInitialized: true
      };
      localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(payload));
    } catch (error) {
      if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        console.warn(`⚠️ [NitroCache] Storage full for ${key}. skipping save.`);
        localStorage.clear(); 
      } else {
        console.error(`❌ [NitroCache] Error saving ${key}:`, error);
      }
    }
  },

  /**
   * Recupera datos de la caché.
   */
  get: (key, defaultValue = null, maxAgeMs = null) => {
    try {
      const saved = localStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!saved) return defaultValue;
      
      const parsed = JSON.parse(saved);

      if (maxAgeMs != null && parsed.timestamp) {
        const age = Date.now() - parsed.timestamp;
        if (age > maxAgeMs) {
          localStorage.removeItem(`${CACHE_PREFIX}${key}`);
          return defaultValue;
        }
      }

      return parsed;
    } catch (error) {
      console.error(`❌ [NitroCache] Error reading ${key}:`, error);
      return defaultValue;
    }
  },

  /**
   * Verifica si una clave existe y no ha expirado
   */
  isFresh: (key, maxAgeMs = 3600000) => { // Default 1 hora para localStorage
    try {
      const saved = localStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!saved) return false;
      const parsed = JSON.parse(saved);
      if (!parsed?.timestamp) return false;
      return (Date.now() - parsed.timestamp) < maxAgeMs;
    } catch {
      return false;
    }
  },

  /**
   * Limpia una entrada o toda la caché
   */
  clear: (key = null) => {
    if (key) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
    } else {
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(k);
        }
      });
    }
  }
};
