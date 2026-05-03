import api from './api';
export const friendsApi = {
    list: () => api.get('/friends'),
    listRequests: () => api.get('/friends/requests'),
    createInvite: () => api.post('/friends/invite'),
    joinViaInvite: (code) => api.post(`/friends/join/${code}`),
    accept: (friendshipId) => api.put(`/friends/${friendshipId}/accept`),
    decline: (friendshipId) => api.put(`/friends/${friendshipId}/decline`),
    remove: (friendshipId) => api.delete(`/friends/${friendshipId}`),
    // Browse friend data
    getFriendItems: (friendId, continuationToken) => api.get('/friends/' + friendId + '/items', { params: { continuationToken } }),
    getFriendItem: (friendId, itemId) => api.get('/friends/' + friendId + '/items/' + itemId),
    getFriendVenues: (friendId, continuationToken) => api.get('/friends/' + friendId + '/venues', { params: { continuationToken } }),
    getFriendVenue: (friendId, venueId) => api.get('/friends/' + friendId + '/venues/' + venueId),
};
