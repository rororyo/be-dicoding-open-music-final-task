class ServerError extends Error {
  constructor(message = "Kesalahan pada server silahkan coba beberapa saat lagi", statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ServerError';
  }
}

export default ServerError;
