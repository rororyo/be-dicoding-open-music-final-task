
class OpenMusicHandler{
  constructor(service, validator){
    this._service = service;
    this._validator = validator;
    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    // this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    //songs
    this.postSongHandler = this.postSongHandler.bind(this);
    this.getAllSongsHandler = this.getAllSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
    // this.getSongsInAlbumHandler= this.getSongsInAlbumHandler.bind(this);
    //likes
    this.postAlbumLikeHandler = this.postAlbumLikeHandler.bind(this);
    this.deleteAlbumLikeHandler = this.deleteAlbumLikeHandler.bind(this);
    this.getAlbumLikesHandler = this.getAlbumLikesHandler.bind(this);

  }
  async postAlbumHandler(request, h){
    this._validator.validateAlbumPayload(request.payload);
    const {name,year} = request.payload;
    const albumId = await this._service.addAlbum({name,year})
    const response = h.response({
      status: 'success',
      data:{
        albumId
      }
    })
    response.code(201);
    return response
  }
  async getAlbumByIdHandler(request, h){
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    const response = h.response({
      status: 'success',
      data: {
        album
      }
    })
    response.code(200);
    return response
  }
  async putAlbumByIdHandler(request,h){
    this._validator.validateAlbumPayload(request.payload)
    const {id} = request.params
    const {name,year} = request.payload
    await this._service.editAlbumById(id,{name,year})
    const response = h.response({
      status: 'success',
      message: 'Album berhasil diperbarui'
    })
    response.code(200)
    return response
  }
  async deleteAlbumByIdHandler(request,h){
    const {id} = request.params
    await this._service.deleteAlbumById(id)
    const response = h.response({
      status: 'success',
      message: 'Album berhasil dihapus'
    })
    response.code(200)
    return response
  }
  async postSongHandler(request,h){
    this._validator.validateSongPayload(request.payload)
    const {title,year,genre,performer,duration,albumId} = request.payload
    const songId = await this._service.addSong({title,year,genre,performer,duration,albumId})
    const response = h.response({
      status: 'success',
      data:{
        songId
      }
    })
    response.code(201);
    return response
  }
  async getAllSongsHandler(request,h){
    const {title,performer} = request.query
    const songs = await this._service.getAllSongs({title,performer})
    const response = h.response({
      status: 'success',
      data: {
        songs
      }
    })
    response.code(200)
    return response
  }
  async getSongByIdHandler(request,h){
    const {id} = request.params
    const song = await this._service.getSongById(id)
    const response = h.response({
      status: 'success',
      data: {
        song
      }
    })
    response.code(200)
    return response
  }
  async putSongByIdHandler(request,h){
    this._validator.validateSongPayload(request.payload)
    const {id} = request.params
    const {title,year,genre,performer,duration,albumId} = request.payload
    await this._service.editSongById(id,{title,year,genre,performer,duration,albumId})
    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil diperbarui'
    })
    response.code(200)
    return response
  }
  async deleteSongByIdHandler(request,h){
    const {id} = request.params
    await this._service.deleteSongById(id)
    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil dihapus'
    })
    response.code(200)
    return response
  }
  // async getSongsInAlbumHandler(request,h){
  //   const {albumId} = request.params
  //   const songs = await this._service.getSongsInAlbum(albumId)
  //   const response = h.response({
  //     status: 'success',
  //     data: {
  //       album:{
  //         id: albumId,
  //         name:songs[0].name,
  //         year:songs[0].year,
  //         songs: songs[0].title?songs.map(song => {
  //           return {
  //             id: song.id,
  //             title: song.title,
  //             performer: song.performer
  //           }
  //         }):[]
  //       },

  //     }
  //   })
  //   response.code(200)
  //   return response
  // }
  async postAlbumLikeHandler(request,h){
    const {id:credentialId} = request.auth.credentials
    const {id:albumId} = request.params
    await this._service.addAlbumLike(albumId,credentialId)
    const response = h.response({
      status: 'success',
      message: 'Album berhasil di like'
    })
    response.code(201)
    return response
  }
  async deleteAlbumLikeHandler(request,h){
    const {id:credentialId} = request.auth.credentials
    const {id:albumId} = request.params
    await this._service.deleteAlbumLike(albumId,credentialId)
    const response = h.response({
      status: 'success',
      message: 'Album berhasil di unlike'
    })
    response.code(200)
    return response
  }
  async getAlbumLikesHandler(request, h) {
    const { id: albumId } = request.params;
    let { likes } = await this._service.getAlbumLikes(albumId);
    likes = parseInt(likes, 10);
    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });
    response.code(200);
    return response;
  }  
}

export default OpenMusicHandler