import 'reflect-metadata'
import * as fs from 'fs'
import * as path from 'path'
import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import * as helmet from 'koa-helmet'
import * as morgan from 'koa-morgan'
import {
  MongoEntityManager,
  ObjectID,
  getMongoRepository,
  getMongoManager,
  MongoRepository,
} from 'typeorm'
import { asValue, Resolver } from 'awilix'
import { loadControllers, scopePerRequest } from 'awilix-koa'

export const app = new Koa()

import { container } from './container'
import { Logger } from './services/Logger'
import { Env } from './services/Env'
import { connectDatabase } from './database'
import { errorResponder } from './middlewares/error-responder'
import { generateRequestId } from './middlewares/request-id-generator'
import { setupI18n } from './middlewares/setup-i18n'

import { User } from './entity/User'

/* tslint:disable */
;(async () => {
  /* tslint:enable */
  const logger = container.resolve<Logger>('logger')
  const env = container.resolve<Env>('env')

  /* istanbul ignore next */
  if (env.REQUEST_LOGS) {
    const format =
      '[RQID=:request-id] - :remote-user' +
      ' [:date[clf]] ":method :url HTTP/:http-version" ' +
      ':status :res[content-length] ":referrer" ":user-agent"'

    morgan.token('request-id', (req: any) => req.requestId)

    if (env.NODE_ENV !== 'production') {
      const stream = fs.createWriteStream(
        path.join(process.cwd(), '/log/combined.log'),
        {
          flags: 'a',
        },
      )

      app.use(morgan(format, { stream }))
    } else {
      app.use(morgan(format))
    }
  }

  /* istanbul ignore if */
  if (require.main === module) {
    try {
      await connectDatabase()
    } catch (err) {
      logger.error('database connection error: ', err)
      process.exit(1)
    }
  }

  app
    .use(helmet())
    .use(bodyParser())
    .use(scopePerRequest(container))
    .use(generateRequestId)
    .use(setupI18n)
    .use(errorResponder)
    .use(loadControllers('./api/**/index.ts', { cwd: __dirname }))

  /* istanbul ignore if */
  if (require.main === module) {
    app.listen(env.PORT)
    logger.info(`Starting server on port ${env.PORT}`)
  }
})()
