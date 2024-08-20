import ExportsHandler from "./handler.js";
import routes from "./routes.js";

const exportsPlugin = {
  name: "exports",
  version: "1.0.0",
  register: async (server, { ProducerService, playlistsService,validator }) => {
    const exportsHandler = new ExportsHandler(ProducerService, playlistsService, validator);
    server.route(routes(exportsHandler));
  },
};

export default exportsPlugin