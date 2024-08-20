import Joi from "joi";

const PostPlaylistSchema = Joi.object({
  name: Joi.string().required(),
});

const PostSongInPlaylistSchema = Joi.object({
  songId: Joi.string().required(),
});

export { PostPlaylistSchema, PostSongInPlaylistSchema }