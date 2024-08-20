
import OpenMusicHandler from "./handler.js";
import routes from "./routes.js";

const openMusicPlugin= {
  name: 'openmusic',
  version: '1.0.0',
  register:async(server,{service,validator})=>{
    const openMusicHandler = new OpenMusicHandler(service,validator)
    server.route(routes(openMusicHandler))
  }
  }
  
  export default openMusicPlugin