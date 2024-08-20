const routes = (handler)=>[
  {
    method: 'POST',
    path:'/albums',
    handler: handler.postAlbumHandler
  },
  {
    method: 'GET',
    path: '/albums/{id}',
    handler: handler.getAlbumByIdHandler
  },
  {
    method: 'PUT',
    path: '/albums/{id}',
    handler: handler.putAlbumByIdHandler
  },
  {
    method: 'DELETE',
    path: '/albums/{id}',
    handler: handler.deleteAlbumByIdHandler
  },
  {
    method: 'POST',
    path: '/songs',
    handler: handler.postSongHandler
  },
  {
    method: 'GET',
    path: '/songs',
    handler: handler.getAllSongsHandler
  },
  {
    method: 'GET',
    path: '/songs/{id}',
    handler: handler.getSongByIdHandler
  },
  {
    method: 'PUT',
    path: '/songs/{id}',
    handler: handler.putSongByIdHandler
  },
  {
    method: 'DELETE',
    path: '/songs/{id}',
    handler: handler.deleteSongByIdHandler
  },
  //opsional
  // {
  //   method: 'GET',
  //   path: '/albums/{albumId}',
  //   handler: handler.getSongsInAlbumHandler
  // }
  {
    method: 'POST',
    path:'/albums/{id}/likes',
    handler: handler.postAlbumLikeHandler,
    options: {
      auth: 'openmusic_jwt'
    }
  },
  {
    method: 'DELETE',
    path:'/albums/{id}/likes',
    handler: handler.deleteAlbumLikeHandler,
    options: {
     auth:'openmusic_jwt' 
    }
  },
  {
    method: 'GET',
    path: '/albums/{id}/likes',
    handler: handler.getAlbumLikesHandler,
  }
]
export default routes;