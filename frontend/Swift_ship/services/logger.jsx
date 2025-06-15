const isSilent = true; // Passe à false pour afficher les logs

export const logError = (...args) => {
  if (!isSilent) console.error('[ERROR]', ...args);
};

export const logInfo = (...args) => {
  if (!isSilent) console.log('[INFO]', ...args);
};

export const logWarn = (...args) => {
  if (!isSilent) console.warn('[WARN]', ...args);
};