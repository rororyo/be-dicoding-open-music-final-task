import env from 'dotenv';
import Hapi from '@hapi/hapi';
import Jwt from '@hapi/jwt'
//error handler
import ClientError from './exceptions/ClientError.js';
import ServerError from './exceptions/ServerError.js';
//openMusic plugin
import OpenMusicService from './services/postgres/OpenMusicService.js';
import OpenMusicValidator from './validator/openmusic/index.js';
import openMusicPlugin from './api/openmusic/index.js';
//authentications
import authenticationsPlugin from './api/authentications/index.js';
import AuthenticationsService from './services/postgres/AuthenticationsService.js';
import TokenManager from './tokenize/TokenManager.js';
import AuthenticationsValidator from './validator/authentications/index.js'
//playlists
import playlistsPlugin from './api/playlists/index.js';
import PlaylistsService from './services/postgres/PlaylistsServices.js';
import PlaylistsValidator from './validator/playlists/index.js';
//users
import usersPlugin from './api/users/index.js';
import UsersService from './services/postgres/UsersService.js';
import UsersValidator from './validator/users/index.js';
//collaborations
import collaborationsPlugin from './api/collaborations/index.js';
import CollaborationsService from './services/postgres/CollaborationsService.js';
import CollaborationsValidator from './validator/collaborations/index.js';
//exports
import exportsPlugin from './api/exports/index.js';
import ProducerService from './services/rabbitmq/ProducerService.js';
import ExportsValidator from './validator/exports/index.js';

const init = async () => {
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService(collaborationsService);
  const openMusicService = new OpenMusicService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  env.config('../.env');
  
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],

      },
    },
  });
  //external plugin
  await server.register([
    {
      plugin: Jwt,
    }
  ])
  // JWT authentication strategy
  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  })
  //internal plugins
  await server.register([
    {
    plugin : openMusicPlugin,
    options:{
      service: openMusicService,
      validator: OpenMusicValidator
    }
    },
    {
      plugin : usersPlugin,
      options:{
        service: usersService,
        validator: UsersValidator
      }
    },
    {
      plugin : authenticationsPlugin,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator
      }
    },
    {
      plugin : playlistsPlugin,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator
      }
    },
    {
      plugin : collaborationsPlugin,
      options: {
        collaborationsService,
        playlistsService,
        validator: CollaborationsValidator
      }
    },
    {
      plugin : exportsPlugin,
      options: {
        ProducerService,
        playlistsService,
        validator: ExportsValidator
      }
    }

  ])
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;
    if(response instanceof ClientError){
      const newResponse = h.response({
        status: 'fail',
        message: response.message
      })
      newResponse.code(response.statusCode)
      return newResponse
    }
    if (response instanceof ServerError) {
      const newResponse = h.response({
        status: 'error',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }
    return h.continue;
  })
  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();