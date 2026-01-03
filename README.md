# Background Work

A Node.js project designed to explore and implement asynchronous communication patterns with practical business logic.
Demonstrates async/await, promises, background jobs, and event-driven architectures through real-world scenarios.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Make sure Redis is running locally (default: `localhost:6379`)

   - On Windows: Download and run Redis from [redis.io](https://redis.io/download) or use WSL
   - On Mac: `brew install redis && brew services start redis`
   - On Linux: `sudo apt-get install redis-server && sudo systemctl start redis`

3. Start the server:

```bash
npm start
```

4. In a separate terminal, start the worker process:

```bash
npm run worker
```

5. Open your browser and navigate to:

```
http://localhost:3000
```

## API Endpoints

### In-Memory Orders (Original)

- `GET /api/in-memory-orders` - Get all orders
- `POST /api/in-memory-orders` - Create a new order (processed in same process)

### Redis Orders (Pub/Sub)

- `GET /api/redis-orders` - Get all orders from JSON file
- `POST /api/redis-orders` - Create a new order (published to Redis, processed by worker)

The worker process listens for order creation events and processes them asynchronously, storing results in `data/orders.json`.
