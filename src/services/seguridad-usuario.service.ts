import {injectable, /* inject, */ BindingScope, service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors, response} from '@loopback/rest';
import {__await} from 'tslib';
import {Keys} from '../config/Keys';
import {CredencialesLogin, CredencialesRecuperarClave} from '../models';
import {UsuarioRepository} from '../repositories';
import {JwtService} from './jwt.service';
var generator = require('generate-password');
var MD5 = require('crypto-js/md5')
const fetch = require('node-fetch')
const params = new URLSearchParams();

@injectable({scope: BindingScope.TRANSIENT})
export class SeguridadUsuarioService {
  constructor(
    @repository(UsuarioRepository)
    private usuarioRepository: UsuarioRepository,
    @service(JwtService)
    private servicioJwt: JwtService
  ) { }

  /**
   * Metodo para la autenticación del usuario
   * @param credenciales credenciales de acceso
   * @returns una cadena con el token si todo está bien o una cadena vacia si hay algun error en la autenticación
   */
  async identificarUsuario(credenciales: CredencialesLogin): Promise<string> {
    let respuesta = "";
    let usuario = await this.usuarioRepository.findOne(
      {
        where: {
          correo: credenciales.nombreUsuario,
          clave: credenciales.clave
        }
      }
    )

    if (usuario) {
      let datos = {
        nombre: `${usuario.nombres} ${usuario.apellidos}`,
        correo: usuario.correo,
        rol: usuario.rolId
      }
      try {
        respuesta = this.servicioJwt.crearToken(datos);
        console.log(respuesta);
      } catch (error) {
        throw error;
      }
    }


    return respuesta
  }

  /**
   * método para generar una clave aleatoria de 10 caracteres
   * @returns clave generada
   */
  crearClaveAleatoria(): string {
    let password = generator.generate({
      lengh: 10,
      numbers: true,
      symbols: true,
      uppercase: true
    })
    return password
  }

  /**
   * cifra una cadena de texto en MD5
   * @param cadena cadena a cifrar
   * @returns cadena cifrada en MD5
   */
  cifrarCadena(cadena: string): string {
    let cadenaCifrada = MD5(cadena).toString();
    return cadenaCifrada;
  }

  /**
   * se recupera una clave generndola aleatoriamente y enviandola
   * @param credenciales credenciales del usuario a recuperar su clave
   */
  async recuperarClave(credenciales: CredencialesRecuperarClave):Promise<boolean> {
    let usuario = await this.usuarioRepository.findOne({
      where: {
        correo:credenciales.correo
      }
    })
    if (usuario) {
      let nuevaClave = this.crearClaveAleatoria();
      let nuevaClaveCifrada = this.cifrarCadena(nuevaClave);
      usuario.clave = nuevaClaveCifrada;
      this.usuarioRepository.replaceById(usuario._id, usuario)

      let mensaje = `hola ${usuario.nombres} <br/> Su contraseña ha sido actualizada a ${nuevaClave} satisfactoriamente, si no ha sido usted quien actualizó la contraseña, por favor tome las medidas pertinentes <br/><br/> Saludos desde AdventurePark!!`

      params.append('hash_validator', 'Admin@notification.sender');
      params.append('destination', usuario.correo);
      params.append('subject', Keys.mensajeAsuntoRecuperarClave);
      params.append('message', mensaje);

      let r = '';
      await fetch(Keys.urlEnviarCorreo, {method: 'POST', body: params}).then(async (res:any) => {
        r = await res.text();
        // console.log(r);
      })
      return r == "OK";
    } else {
      throw new HttpErrors[400]("El correo ingresado no está asociado a un usuario")
    }
  }
}
