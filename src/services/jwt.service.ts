import {injectable, /* inject, */ BindingScope} from '@loopback/core';
import {Keys} from '../config/Keys';
var jwt = require('jsonwebtoken');

@injectable({scope: BindingScope.TRANSIENT})
export class JwtService {
  constructor(/* Add @inject to inject parameters */) { }

  /**
   * se genera un token con la información en formato jwt
   * @param info datos que quedarán en el token
   * @returns token firmado con la clave secreta
   */
  crearToken(info: Object): string {
    try {
      var token = jwt.sign(info, Keys.JwtSecretKey);
      return token
    } catch (error) {
      throw error
    }
  }

  /**
   * Se valida un token si es correcto o no
   * @param tk token a validar
   * @returns valor booleano con la respuesta
   */
  validarToken(tk: Object): string {
    try {
      let info =  jwt.verify(tk, Keys.JwtSecretKey);
      return info.rol
    } catch (error) {
      return "";
    }
  }
}
