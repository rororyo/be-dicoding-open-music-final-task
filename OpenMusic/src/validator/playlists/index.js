import { PostPlaylistSchema,PostSongInPlaylistSchema } from "./schema.js";
import InvariantError from "../../exceptions/InvariantError.js";

const PlaylistsValidator = {
  validatePostPlaylistPayload: (payload) => {
    const validationResult = PostPlaylistSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePostSongInPlaylistPayload: (payload) => {
    const validationResult = PostSongInPlaylistSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
}

export default PlaylistsValidator