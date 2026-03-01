# 🚀 SageInsta - Microservices Social Platform

A scalable microservices-based backend architecture built with Node.js, Redis, and RabbitMQ.  
This system follows an event-driven architecture with centralized API Gateway routing and service-to-service communication via a message broker.

---

## 🏗 Architecture Overview

| Service                 | Port | Description                               |
| ----------------------- | ---- | ----------------------------------------- |
| API Gateway             | 3000 | Entry point, routing, middleware handling |
| Identity Service (Auth) | 3001 | Authentication, JWT, Refresh Tokens       |
| Post Service            | 3002 | Post creation & management                |
| Media Service           | 3003 | Media uploads & processing                |
| Search Service          | 3004 | Search indexing & queries                 |

---

## 🧩 Tech Stack

- Node.js
- Express.js
- Redis (Caching / Pub-Sub)
- RabbitMQ (Event-driven communication)
- Docker & Docker Compose
- Cloudinary (Media Storage)

---

## 📂 Project Structure

```
.
├── api-gateway
│   ├── src
│   │   ├── middleware
│   │   │   ├── authMiddleware.js
│   │   │   └── errorhandler.js
│   │   ├── utils
│   │   └── server.js
│   ├── Dockerfile
│   ├── package.json
│   └── package-lock.json
│
├── identity-service
│   ├── src
│   │   ├── controllers
│   │   │   └── identity-controller.js
│   │   ├── middleware
│   │   │   └── errorHandler.js
│   │   ├── models
│   │   │   ├── RefreshToken.js
│   │   │   └── User.js
│   │   ├── routes
│   │   │   └── identity-service.js
│   │   ├── utils
│   │   │   ├── generateToken.js
│   │   │   ├── logger.js
│   │   │   └── validation.js
│   │   └── server.js
│   ├── Dockerfile
│   ├── package.json
│   └── package-lock.json
│
├── media-service
│   ├── src
│   │   ├── controllers
│   │   │   └── media-controller.js
│   │   ├── eventHandlers
│   │   │   └── media-event-handlers.js
│   │   ├── middleware
│   │   │   ├── authMiddleware.js
│   │   │   └── errorHandler.js
│   │   ├── models
│   │   │   └── Media.js
│   │   ├── routes
│   │   │   └── media-routes.js
│   │   ├── utils
│   │   │   ├── cloudinary.js
│   │   │   ├── logger.js
│   │   │   └── rabbitmq.js
│   │   └── server.js
│   ├── Dockerfile
│   ├── package.json
│   └── package-lock.json
│
├── post-service
│   ├── src
│   ├── Dockerfile
│   ├── package.json
│   └── package-lock.json
│
├── search-service
│   ├── src
│   ├── Dockerfile
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
├── docker-compose.yml
└── README.md
```

---

## 🔄 Communication Flow

- API Gateway handles all client requests.
- Services communicate asynchronously via RabbitMQ.
- Redis is used for caching and potential rate limiting.
- Media uploads handled via Cloudinary integration.
- JWT authentication managed by Identity Service.

---

## 🐳 Running with Docker

Make sure Docker & Docker Compose are installed.

### Start All Services

```bash
docker-compose up --build
```

---

## ⚙️ Docker Compose Configuration

```yaml
version: '3.8'

services:
  api-gateway:
    build: ./api-gateway
    ports:
      - "3000:3000"
    env_file: ./api-gateway/.env
    depends_on:
      - redis
      - rabbitmq
    environment:
      - REDIS_URL=redis://redis:6379
      - RABBITMQ_URL=amqp://rabbitmq:5672

  identity-service:
    build: ./identity-service
    ports:
      - "3001:3001"
    env_file: ./identity-service/.env
    depends_on:
      - redis
      - rabbitmq
    environment:
      - REDIS_URL=redis://redis:6379
      - RABBITMQ_URL=amqp://rabbitmq:5672

  post-service:
    build: ./post-service
    ports:
      - "3002:3002"
    env_file: ./post-service/.env
    depends_on:
      - redis
      - rabbitmq
    environment:
      - REDIS_URL=redis://redis:6379
      - RABBITMQ_URL=amqp://rabbitmq:5672

  media-service:
    build: ./media-service
    ports:
      - "3003:3003"
    env_file: ./media-service/.env
    depends_on:
      - redis
      - rabbitmq
    environment:
      - REDIS_URL=redis://redis:6379
      - RABBITMQ_URL=amqp://rabbitmq:5672

  search-service:
    build: ./search-service
    ports:
      - "3004:3004"
    env_file: ./search-service/.env
    depends_on:
      - redis
      - rabbitmq
    environment:
      - REDIS_URL=redis://redis:6379
      - RABBITMQ_URL=amqp://rabbitmq:5672

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "-q", "ping"]
      interval: 30s
      timeout: 10s
      retries: 5
```

---

## 🔐 Environment Variables

Each service requires a `.env` file:

```
PORT=
JWT_SECRET=
REDIS_URL=
RABBITMQ_URL=
DATABASE_URL=
CLOUDINARY_CONFIG=
```

---

## 📊 Service Access Points

- API Gateway → http://localhost:3000
- Identity Service → http://localhost:3001
- Post Service → http://localhost:3002
- Media Service → http://localhost:3003
- Search Service → http://localhost:3004
- RabbitMQ Dashboard → http://localhost:15672
- Redis → localhost:6379

---

## 🧠 Architecture Patterns Used

- Microservices Architecture
- API Gateway Pattern
- Event-Driven Communication
- Distributed Caching
- Containerized Deployment
- API Rate Limiting

---

## 🚀 Future Improvements

- Kubernetes Deployment
- CI/CD Integration
- Distributed Tracing
- Centralized Logging
- Advanced Search (Elasticsearch)

---

⭐ Designed for scalability, modularity, and production-ready microservices deployment.
