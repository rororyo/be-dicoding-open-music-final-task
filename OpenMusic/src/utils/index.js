const mapSongsToModel = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  album_id
})=>({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId: album_id,
})

export default mapSongsToModel