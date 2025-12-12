import { Logger } from "@nestjs/common";
import { NestFactory, Reflector } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { RedisStore } from "connect-redis";
import session, { Store } from "express-session";
import { createClient } from "redis";
import { ErrorFilter, ResponseInterceptor } from "@/core";
import { AppModule } from "./app.module";
import { requireEnv } from "./lib/utils";

declare const module: {
  hot: {
    accept: () => void;
    dispose: (fn: () => void) => void;
  };
};

const logger = new Logger("Bootstrap");
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix("/api");
  app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new ErrorFilter());

  const { SESSION_SECRET } = requireEnv("SESSION_SECRET");

  let store: Store | undefined;

  if (process.env.REDIS_URL) {
    logger.log("Using Redis store with express-session");
    const redisClient = createClient({
      url: process.env.REDIS_URL,
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
    });

    await redisClient.connect();

    store = new RedisStore({
      client: redisClient,
      prefix: "session:",
    });
  } else {
    logger.log("Using Local store with express-session");
  }

  app.use(
    session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 30,
      },
      store,
    }),
  );

  app.enableCors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  });

  app.set("trust proxy", "loopback");

  await app.listen(process.env.PORT ?? 3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

void bootstrap();
