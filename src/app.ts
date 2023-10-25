import 'reflect-metadata';
import { config } from './config';
import { useContainer as routingControllersUseContainer, useExpressServer } from 'routing-controllers';
import { loadHelmet } from './middleware/helmet';
import { addLogger } from './middleware/request-logger';
import { CustomErrorHandler } from './middleware/custom-error-handler';
import { Container } from 'typedi';
import { AXPCallbackController } from './controllers/axp-callback-controller';
import { CPaaSCallbackController } from './controllers/cpaas-callback-controller';
import express from 'express';
import bodyParser from 'body-parser';
const appConfig = config.appConfig;
console.log(appConfig)

export class App {
  private app: express.Application = express();
  private port: number = appConfig.port;
  private baseURL: string = appConfig.baseURL || "http://localhost";

  public constructor() {
    this.bootstrap();
  }

  public bootstrap() {
    this.useContainers();
    this.setupMiddlewares();
    this.registerRoutingControllers();
    this.startServer();
  }

  private useContainers() {
    routingControllersUseContainer(Container);
  }

  private setupMiddlewares() {
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());
    addLogger(this.app);
    loadHelmet(this.app);
  }


  private registerRoutingControllers() {
    useExpressServer(this.app, {
      validation: { stopAtFirstError: true },
      cors: true,
      classTransformer: true,
      defaultErrorHandler: false,
      routePrefix: appConfig.routePrefix,
      controllers: [AXPCallbackController, CPaaSCallbackController],
      middlewares: [CustomErrorHandler],
    });
  }

  private startServer() {
    this.app.listen(this.port, () => console.log(`🚀 Server started at ${this.baseURL}:${this.port}${appConfig.routePrefix}\n🚨️ Environment: ${process.env.NODE_ENV}`));
  }
}