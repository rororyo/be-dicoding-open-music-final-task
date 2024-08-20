class ExportsHandler {
  constructor(ProducerService, playlistsService, validator) {
    this._ProducerService = ProducerService;
    this._validator = validator;
    this._playlistService = playlistsService;
    this.postExportPlaylistHandler = this.postExportPlaylistHandler.bind(this);
  }
  async postExportPlaylistHandler(request, h) {
    const { playlistId } = request.params;
    const { targetEmail } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    await this._validator.validateExportPlaylistPayload(request.payload);
    await this._playlistService.getPlaylistById(playlistId)
    await this._playlistService.verifyPlaylistAccess(playlistId,credentialId)
    const message = {
      playlistId,
      targetEmail,
    };
    await this._ProducerService.sendMessage(
      "export:playlists",
      JSON.stringify(message)
    );
    const response = h.response({
      status: "success",
      message: "Permintaan Anda sedang kami proses",
    });
    response.code(201);
    return response;
  }
}
export default ExportsHandler;
