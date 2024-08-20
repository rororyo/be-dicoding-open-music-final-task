import routes from "./routes.js";
import PlaylistsHandler from "./handler.js";

const playlistsPlugin = {
  name: "playlists",
  version: "1.0.0",
  register: async (server, { service, validator }) => {
    const handler = new PlaylistsHandler(service, validator);
    server.route(routes(handler));
  },
};

export default playlistsPlugin;