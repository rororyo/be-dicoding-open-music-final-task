import pg from "pg";
import InvariantError from "../../exceptions/InvariantError.js";
import NotFoundError from "../../exceptions/NotFoundError.js";
import AuthorizationError from "../../exceptions/AuthorizationError.js";
import { nanoid } from "nanoid";
class PlaylistsService {
  constructor(collaborationsService) {
    this._pool = new pg.Pool();
    this._collaborationService = collaborationsService;
  }
  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: "INSERT INTO playlists VALUES($1, $2,$3) RETURNING id",
      values: [id, name, owner],
    };
    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError("Playlist gagal ditambahkan");
    }
    return result.rows[0].id;
  }
  async getPlaylists(id) {
    const query = {
      text: `
        SELECT playlists.id, playlists.name, users.username
        FROM playlists
        JOIN users ON users.id = playlists.owner_id
        WHERE playlists.owner_id = $1
        UNION
        SELECT playlists.id, playlists.name, users.username
        FROM collaborations
        LEFT JOIN playlists ON playlists.id = collaborations.playlist_id
        LEFT JOIN users ON users.id = playlists.owner_id
        WHERE collaborations.user_id = $1
      `,
      values: [id],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }
  
  async deletePlaylistById(id) {
    const query = {
      text: "DELETE FROM playlists WHERE id = $1 RETURNING id",
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError("Playlist gagal dihapus. Id tidak ditemukan");
    }
    return result.rows[0].id;
  }
  async addPlaylistSong({ playlistId,songId,credentialId}) {
    // Check if the song exists
    const checkSongQuery = {
      text: "SELECT * FROM songs WHERE id = $1",
      values: [songId],
    };
    const checkSongResult = await this._pool.query(checkSongQuery);
    if (!checkSongResult.rows.length) {
      throw new NotFoundError("Lagu tidak ditemukan");
    }
    // Insert the song into the playlist
    const id = `playlistsong-${nanoid(16)}`;
    const insertSongQuery = {
      text: "INSERT INTO playlist_songs (id,playlist_id, song_id) VALUES ($1, $2, $3) RETURNING id",
      values: [id,playlistId, songId],
    };
    const insertSongResult = await this._pool.query(insertSongQuery);

    if (!insertSongResult.rows[0].id) {
      throw new InvariantError("Lagu gagal ditambahkan ke playlist");
    }
    //insert song to activity
    const idActivity = `activity-${nanoid(16)}`;
    const insertActivityQuery = {
      text: "INSERT INTO playlist_song_activities (id,playlist_id, song_id,user_id,action) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      values: [idActivity,playlistId,songId,credentialId,'add'],
    }
    await this._pool.query(insertActivityQuery);
    return insertSongResult.rows[0].id;
  }

  async getPlaylistSong(playlistId) {
    const query = {
      text: "select songs.id,songs.title,songs.performer,playlists.name,users.username from playlist_songs join playlists on playlists.id = playlist_songs.playlist_id join songs on songs.id = playlist_songs.song_id join users on users.id = playlists.owner_id where playlist_songs.playlist_id = $1",
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }
  async deletePlaylistSong(playlistId, songId, credentialId) {
    const query = {
      text: "DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id",
      values: [playlistId, songId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError("Lagu gagal dihapus dari playlist");
    }
    //insert song to activity
    const idActivity = `activity-${nanoid(16)}`;
    const insertActivityQuery = {
      text: "INSERT INTO playlist_song_activities (id,playlist_id, song_id,user_id,action) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      values: [idActivity,playlistId,songId,credentialId,'delete'],
    }
    await this._pool.query(insertActivityQuery);
  }
  async getPlaylistActivities(playlistId) {
    const query = {
      text: "SELECT users.username,songs.title,playlist_song_activities.action,playlist_song_activities.time FROM playlist_song_activities join songs on songs.id = playlist_song_activities.song_id join users on users.id = playlist_song_activities.user_id WHERE playlist_id = $1",
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }
  // Helper functions
  async getPlaylistById(id) {
    const query = {
      text: "SELECT * FROM playlists WHERE id = $1",
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }
    return result.rows[0];
  }
  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: "SELECT * FROM playlists WHERE id = $1",
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }
    const playlist = result.rows[0];
    if (playlist.owner_id !== owner) {
      throw new AuthorizationError("Anda tidak berhak mengakses resource ini");
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
  
}
export default PlaylistsService;
