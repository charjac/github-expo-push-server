const Koa = require('koa');
const bodyParser = require('koa-body');
const koaConvert = require('koa-convert');
const koaRouter = require('koa-router');
const helmet = require('koa-helmet');
const { logger } = require('./services/logger');
const { generateRequestId } = require('./middleware/request-id-generator');
const { errorResponder } = require('./middleware/error-responder');
const { k } = require('./project-env');
const { authRouter } = require('./routes/auth/auth.routes');
const { pushRouter } = require('./routes/push/push.routes');
const {
  healthCheckRouter,
} = require('./routes/health-check/health-check.routes');
const { connectMongo } = require('./db');

const app = new Koa();
const router = koaRouter();

authRouter(router);
pushRouter(router);
healthCheckRouter(router);

/* istanbul ignore if */
if (k.REQUEST_LOGS) {
  const morgan = require('koa-morgan');
  const format =
    '[RQID=:request-id] - :remote-user' +
    ' [:date[clf]] ":method :url HTTP/:http-version" ' +
    ':status :res[content-length] ":referrer" ":user-agent"';
  morgan.token('request-id', req => req.requestId);
  app.use(morgan(format));
}

app
  .use(helmet())
  .use(koaConvert(bodyParser()))
  .use(generateRequestId)
  .use(errorResponder)
  .use(router.routes())
  .use(router.allowedMethods());

async function startFunction() {
  const PORT = process.env.PORT || 3000;

  await connectMongo();

  logger.info(`Starting server on port ${PORT}`);
  app.listen(PORT);
}

/* istanbul ignore if */
if (require.main === module) {
  startFunction();
}

module.exports = { app };
