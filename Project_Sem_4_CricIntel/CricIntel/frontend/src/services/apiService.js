import apiClient from './apiClient';

/**
 * Player API service — placeholder endpoints.
 * TODO: Add filtering, pagination, and caching when backend is live.
 */
export const playerService = {
  getAll: () => apiClient.get('/players/'),
  getById: (id) => apiClient.get(`/players/${id}/`),
  getStats: (id) => apiClient.get(`/players/${id}/stats/`),
  getActive: () => apiClient.get('/players/active/'),
};

/**
 * Match API service — placeholder endpoints.
 */
export const matchService = {
  getAll: () => apiClient.get('/matches/'),
  getById: (id) => apiClient.get(`/matches/${id}/`),
  getUpcoming: () => apiClient.get('/matches/upcoming/'),
  getByFormat: (format) => apiClient.get('/matches/by_format/', { params: { format } }),
};

/**
 * Venue API service — placeholder endpoints.
 */
export const venueService = {
  getAll: () => apiClient.get('/venues/'),
  getById: (id) => apiClient.get(`/venues/${id}/`),
  getStats: (id) => apiClient.get(`/venues/${id}/stats/`),
};

/**
 * Prediction API service — placeholder endpoints.
 * TODO: Wire to PredictPage form submission.
 */
export const predictionService = {
  getAll: () => apiClient.get('/predict/'),
  getById: (id) => apiClient.get(`/predict/${id}/`),
  create: (data) => apiClient.post('/predict/', data),
  explain: (id) => apiClient.get(`/predict/${id}/explain/`),
};

/**
 * Weather API service — placeholder endpoints.
 */
export const weatherService = {
  getAll: () => apiClient.get('/weather/'),
  getForecast: (venueId, date) =>
    apiClient.get('/weather/forecast/', { params: { venue_id: venueId, date } }),
};

/**
 * Analytics API service — placeholder endpoints.
 */
export const analyticsService = {
  getAll: () => apiClient.get('/analytics/'),
  getLeaderboard: (format, metric) =>
    apiClient.get('/analytics/leaderboard/', { params: { format, metric } }),
  getPlayerSummary: (playerId) =>
    apiClient.get('/analytics/player_summary/', { params: { player_id: playerId } }),
};
