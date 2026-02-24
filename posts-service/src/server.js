require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Redis = require("ioredis");
const cors = require("cors");
const helmet = require("helmet");
const postRoutes = require("./routes/post-routes");
const errorHandler = require("./middleware/errorHandler");
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const logger = require("./utils/logger");
const { connectToRabbitMQ } = require("./utils/rabbitmq");


const app = express();
const PORT = process.env.PORT || 3002;

//connect to mongodb
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.info("Connected to mongodb"))
  .catch((e) => logger.error("Mongo connection error", e));

const redisClient = new Redis(process.env.REDIS_URL);

//middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body, ${req.body}`);
  next();
});

// GET limiter → 100 requests per 15 mins
const getLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
    }),
    handler: (req, res) => {
      logger.warn(`GET limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        success: false,
        message: "Too many GET requests",
      });
    },
  });
  
  // POST limiter → 10 requests per 15 mins
  const postLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
    }),
    handler: (req, res) => {
      logger.warn(`POST limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        success: false,
        message: "Too many POST requests",
      });
    },
  });
  
  // PUT limiter → 30 requests
  const putLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    store: new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
    }),
  });
  
  // DELETE limiter → 20 requests
  const deleteLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    store: new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
    }),
  });

//routes -> pass redisclient to routes
//now added ip based rate limiting
app.use("/api/posts", (req, res, next) => {
    req.redisClient = redisClient;
  
    switch (req.method) {
      case "GET":
        return getLimiter(req, res, next);
      case "POST":
        return postLimiter(req, res, next);
      case "PUT":
        return putLimiter(req, res, next);
      case "DELETE":
        return deleteLimiter(req, res, next);
      default:
        return next();
    }
  }, postRoutes);



app.use(errorHandler);

async function startServer() {
  try {
    await connectToRabbitMQ();
    app.listen(PORT, () => {
      logger.info(`Post service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to connect to server", error);
    process.exit(1);
  }
}

startServer();

//unhandled promise rejection

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at", promise, "reason:", reason);
});