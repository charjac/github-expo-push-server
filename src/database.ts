import {
  createConnection,
  getMongoManager,
  getMongoRepository,
  MongoRepository,
  MongoEntityManager,
} from 'typeorm'
import { container } from './container'
import { Env } from './services/Env'
import { User } from './entity/User'
import { AwilixContainer, asValue } from 'awilix'

export const connectDatabase = async (): Promise<void> => {
  const env = container.resolve<Env>('env')

  await createConnection({
    type: env.TYPEORM_CONNECTION,
    url: env.TYPEORM_URL,
    synchronize: env.TYPEORM_SYNCHRONIZE,
    logging: env.TYPEORM_LOGGING,
    entities: [User],
  })

  container.register<MongoEntityManager>(
    'dbManager',
    asValue(getMongoManager()),
  )
  container.register<MongoRepository<User>>(
    'userRepository',
    asValue(getMongoRepository<User>(User)),
  )
}
