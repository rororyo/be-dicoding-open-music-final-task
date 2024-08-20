import pg from "pg";
import NotFoundError from "../../exceptions/NotFoundError.js";
import InvariantError from "../../exceptions/InvariantError.js";
import { nanoid } from "nanoid";
import mapSongsToModel from "../../utils/index.js";

class OpenMusicService {
  constructor() {
    this._pool = new pg.Pool();
  }
  //kriteria wajib
  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const query = {
      text: "INSERT INTO albums VALUES($1, $2, $3) RETURNING id",
      values: [id, name, year],
    };
    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError("Album gagal ditambahkan");
    }
    return result.rows[0].id;
  }
  async getAlbumById(id) {
    const query = {
      text: "SELECT * FROM albums WHERE id = $1",
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Album tidak ditemukan");
    }
    return result.rows[0];
  }
  async editAlbumById(id, { name, year }) {
    const query = {
      text: "UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id",
      values: [name, year, id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Gagal memperbarui album. Id tidak ditemukan");
    }
  }
  async deleteAlbumById(id) {
    const query = {
      text: "DELETE FROM albums WHERE id = $1 RETURNING id",
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Album gagal dihapus. Id tidak ditemukan");
    }
  }
  async addSong({ title, year, genre, performer, duration, albumId }) {
    const id = `song-${nanoid(16)}`;
    const query = {
      text: `INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      values: [id, title, year, genre, performer, duration, albumId],
    }
    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError("Lagu gagal ditambahkan");
    }
    return result.rows[0].id;
  }
  async getAllSongs({title,performer}) {
    let result;
    if(title && performer){
      const query = {
        text: "SELECT id,title,performer FROM songs WHERE LOWER(title) LIKE LOWER($1) AND LOWER(performer) LIKE LOWER($2)",
        values: [`%${title}%`, `%${performer}%`],
      }
      result = await this._pool.query(query);
      return result.rows.map(mapSongsToModel);
    }
    else if(title){
      const query = {
        text: "SELECT id,title,performer FROM songs WHERE LOWER(title) LIKE LOWER($1)",
        values: [`%${title}%`],
      }
      result = await this._pool.query(query);
      return result.rows.map(mapSongsToModel);
    }
    else if(performer){
      const query = {
        text: "SELECT id,title,performer FROM songs WHERE LOWER(performer) LIKE LOWER($1)",
        values: [`%${performer}%`],
      }
      result = await this._pool.query(query);
      return result.rows.map(mapSongsToModel);
    }

    const query = {
      text: "SELECT id,title,performer FROM songs",
    };
     result = await this._pool.query(query);
     return result.rows.map(mapSongsToModel);
    
  }
  async getSongById(id) {
    const query = {
      text: "SELECT * FROM songs WHERE id = $1",
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Lagu tidak ditemukan");
    }
    return result.rows.map(mapSongsToModel)[0];
  }
  async editSongById(id, { title, year, genre, performer, duration, albumId }) {
    const query = {
      text: `UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6 WHERE id = $7 RETURNING id`,
      values: [title, year, genre, performer, duration, albumId, id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Gagal memperbarui lagu. Id tidak ditemukan");
    }
  }
  async deleteSongById(id) {
    const query = {
      text: "DELETE FROM songs WHERE id = $1 RETURNING id",
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Lagu gagal dihapus. Id tidak ditemukan");
    }
  }
  //kriteria opsional
  // async getSongsInAlbum (albumId) {
  //   const query = {
  //     text: "select albums.*,songs.id,songs.title,songs.performer from albums left join songs on songs.album_id = albums.id where albums.id = $1",
  //     values: [albumId],
  //   }
  //   const result = await this._pool.query(query);
  //   if (!result.rows.length) {
  //     throw new NotFoundError("Lagu tidak ditemukan");
  //   }
  //   return result.rows;
  // }
  // Likes
  async addAlbumLike(albumId, userId) {
    const checkQuery={
      text: "SELECT * FROM user_album_likes WHERE album_id = $1 AND user_id = $2",
      values: [albumId, userId],
    }
    const checkResult = await this._pool.query(checkQuery);
    if (checkResult.rows.length) {
      throw new InvariantError("Anda sudah menyukai lagu ini");
    }
    //check if album exists
    await this.getAlbumById(albumId);
    const query = {
      text: "INSERT INTO user_album_likes (album_id, user_id) VALUES ($1, $2) RETURNING album_id",
      values: [albumId, userId],
    }
    const result = await this._pool.query(query);
    if (!result.rows[0].album_id) {
      throw new NotFoundError("Like gagal ditambahkan");
    }
  }
  async deleteAlbumLike(albumId, userId) {
    await this.getAlbumById(albumId);
    const query = {
      text: "DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING album_id",
      values: [albumId, userId],
    }
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Like gagal dihapus. Id tidak ditemukan");
    }
  }
  async getAlbumLikes(albumId) {
    await this.getAlbumById(albumId);
    const query = {
      text: "SELECT count(*) as likes FROM user_album_likes WHERE album_id = $1",
      values: [albumId],
    }
    const result = await this._pool.query(query);
    return result.rows[0];
  }
}


export default OpenMusicService;
