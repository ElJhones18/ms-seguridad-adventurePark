import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  Usuario,
  AuditoriaLogin,
} from '../models';
import {UsuarioRepository} from '../repositories';

export class UsuarioAuditoriaLoginController {
  constructor(
    @repository(UsuarioRepository) protected usuarioRepository: UsuarioRepository,
  ) { }

  @get('/usuarios/{id}/auditoria-logins', {
    responses: {
      '200': {
        description: 'Array of Usuario has many AuditoriaLogin',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(AuditoriaLogin)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<AuditoriaLogin>,
  ): Promise<AuditoriaLogin[]> {
    return this.usuarioRepository.auditoriaLogins(id).find(filter);
  }

  @post('/usuarios/{id}/auditoria-logins', {
    responses: {
      '200': {
        description: 'Usuario model instance',
        content: {'application/json': {schema: getModelSchemaRef(AuditoriaLogin)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Usuario.prototype._id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AuditoriaLogin, {
            title: 'NewAuditoriaLoginInUsuario',
            exclude: ['_id'],
            optional: ['usuarioId']
          }),
        },
      },
    }) auditoriaLogin: Omit<AuditoriaLogin, '_id'>,
  ): Promise<AuditoriaLogin> {
    return this.usuarioRepository.auditoriaLogins(id).create(auditoriaLogin);
  }

  @patch('/usuarios/{id}/auditoria-logins', {
    responses: {
      '200': {
        description: 'Usuario.AuditoriaLogin PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AuditoriaLogin, {partial: true}),
        },
      },
    })
    auditoriaLogin: Partial<AuditoriaLogin>,
    @param.query.object('where', getWhereSchemaFor(AuditoriaLogin)) where?: Where<AuditoriaLogin>,
  ): Promise<Count> {
    return this.usuarioRepository.auditoriaLogins(id).patch(auditoriaLogin, where);
  }

  @del('/usuarios/{id}/auditoria-logins', {
    responses: {
      '200': {
        description: 'Usuario.AuditoriaLogin DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(AuditoriaLogin)) where?: Where<AuditoriaLogin>,
  ): Promise<Count> {
    return this.usuarioRepository.auditoriaLogins(id).delete(where);
  }
}
