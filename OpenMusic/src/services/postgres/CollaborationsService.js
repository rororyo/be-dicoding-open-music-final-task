import pg from 'pg';
import InvariantError from '../../exceptions/InvariantError.js';
import { nanoid } from 'nanoid';
import NotFoundError from '../../exceptions/NotFoundError.js';
class CollaborationsService {
  constructor() {
    this._pool = new pg.Pool();
  }
  async addCollaboration(playlistId,userId){
    const id = `collab-${nanoid(16)}`;
    //check userId
    const queryUserId = {
      text: 'SELECT id FROM users WHERE id = $1',
      values: [userId]
    }
    const resultUserId = await this._pool.query(queryUserId);
    if (!resultUserId.rows.length) {
      throw new NotFoundError('User tidak ditemukan')
    }
    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId]
    }
    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Kolaborasi gagal ditambahkan')
    }
    return result.rows[0].id
  }
  async deleteCollaboration(playlistId,userId){
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId]
    }
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal dihapus')
    }
  }
  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId]
    }
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal diverifikasi')
    }
  }
}
export default CollaborationsService