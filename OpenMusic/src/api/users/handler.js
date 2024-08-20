import ClientError from "../../exceptions/ClientError.js";

class UsersHandler{
  constructor(service, validator){
    this._service = service;
    this._validator = validator;
    this.postUserHandler = this.postUserHandler.bind(this);
    this.getUserByIdHandler = this.getUserByIdHandler.bind(this);
    this.getUsersByUsernameHandler = this.getUsersByUsernameHandler.bind(this);
  }

  async postUserHandler(request, h){
    this._validator.validateUserPayload(request.payload);
    const {username, password, fullname} = request.payload;
    const userId = await this._service.addUser({username,password,fullname});
    const response = h.response({
      status: 'success',
      message:'User berhasil ditambahkan',
      data:{
        userId,
      },
    })
    response.code(201);
    return response;
  }
  async getUserByIdHandler(request){
    const {id} = request.params;
    const user = await this._service.getUserById(id);
    return{
      status: 'success',
      data: {
        user,
      },
    }
  }
  async getUsersByUsernameHandler(request, h) {
   try{
    const {username = ''} = request.query;
    const users = await this._service.getUsersByUsername(username)
    return{
      status: 'success',
      data: {
        users
      }
    }
   }
   catch(err){
    if(err instanceof ClientError){
      const response = h.response({
        status: 'fail',
        message: err.message
      })
      response.code(err.statusCode)
      return response
    }
    const response = h.response({
      status: 'error',
      message: 'Maaf, terjadi kegagalan pada server kami.'
    })
    response.code(500)
    console.error(err)
    return response
   }
  }
}
export default UsersHandler;