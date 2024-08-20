class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.postPlaylistSongHandler = this.postPlaylistSongHandler.bind(this);
    this.getPlaylistSongHandler = this.getPlaylistSongHandler.bind(this);
    this.deletePlaylistSongHandler = this.deletePlaylistSongHandler.bind(this);
    this.getPlaylistActivitiesHandler = this.getPlaylistActivitiesHandler.bind(this)
  }
  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    const playlistId = await this._service.addPlaylist({
      name,
      owner: credentialId,
    });
    const response = h.response({
      status: "success",
      message: "Playlist berhasil ditambahkan",
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }
  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._service.getPlaylists(credentialId);
    return {
      status: "success",
      data: {
        playlists,
      },
    };
  }
  async deletePlaylistByIdHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyPlaylistOwner(playlistId, credentialId);
    await this._service.deletePlaylistById(playlistId);
    return {
      status: "success",
      message: "Playlist berhasil dihapus",
    };
  }
  async postPlaylistSongHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    this._validator.validatePostSongInPlaylistPayload(request.payload);
    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    const { songId } = request.payload;
    await this._service.addPlaylistSong({playlistId, songId ,credentialId});
    const response = h.response({
      status: "success",
      message: "Lagu berhasil ditambahkan ke playlist",
    });
    response.code(201);
    return response;
  }
  async getPlaylistSongHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyPlaylistAccess(playlistId, credentialId);  
    const songs = await this._service.getPlaylistSong(playlistId); 
    if (songs.length === 0) {
      return {
        status: "success",
        data: {
          playlist: {
            id: playlistId,
            name: '', 
            username: '',
            songs: [] 
          },

        }
      };
    }
  
    return {
      status: "success",
      data: {
        playlist: {
          id: playlistId,
          name: songs[0].name,
          username: songs[0].username,
          songs: songs.map(song => ({
            id: song.id,
            title: song.title,
            performer: song.performer
          }))
        },
      }
    };
  }
  
  async deletePlaylistSongHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    const { songId } = request.payload;
    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.deletePlaylistSong(playlistId, songId, credentialId); 
    return {
      status: "success",
      message: "Lagu berhasil dihapus dari playlist",
    };
  }
  async getPlaylistActivitiesHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    const activities = await this._service.getPlaylistActivities(playlistId);
    return {
      status: "success",
      data: {
        playlistId,
        activities: activities
      }
    }
  }
}

export default PlaylistsHandler;
