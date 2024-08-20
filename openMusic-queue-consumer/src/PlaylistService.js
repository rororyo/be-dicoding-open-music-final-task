import pg from 'pg';

class PlaylistService {
  constructor(){
    this._pool = new pg.Pool()
  }
  async getPlaylistSong(playlistId) {
    const query = {
      text: "select songs.id,songs.title,songs.performer,playlists.name,users.username from playlist_songs join playlists on playlists.id = playlist_songs.playlist_id join songs on songs.id = playlist_songs.song_id join users on users.id = playlists.owner_id where playlist_songs.playlist_id = $1",
      values: [playlistId],
    }
    const result = await this._pool.query(query);
    return result.rows;
  }
}

export default PlaylistService