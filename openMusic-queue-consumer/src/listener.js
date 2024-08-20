class Listener {
  constructor(playlistService, mailSender) {
    this._playlistService = playlistService;
    this._mailSender = mailSender;
    this.listen = this.listen.bind(this);
  }

  async listen(message) {
    try {
      const { playlistId, targetEmail } = JSON.parse(message.content.toString());
      const playlist = await this._playlistService.getPlaylist(playlistId);

      if (!playlist || playlist.length === 0) {
        throw new Error('Playlist not found or is empty');
      }

      const formattedPlaylist = {
        "playlist": {
          "id": playlistId,
          "name": playlist[0].name,
          "songs": playlist.map(song => ({
            "id": song.id,
            "title": song.title,
            "performer": song.performer
          }))
        }
      };
      await this._mailSender.sendEmail(targetEmail, formattedPlaylist);

    } catch (error) {
      console.error('Error processing message:', error);
    }
  }
}
export default Listener