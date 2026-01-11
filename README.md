# 📌 BE AWARE

This project relies on [node-youtube-ext](https://github.com/zyrouge/node-youtube-ext) created by [zyrouge](https://github.com/zyrouge). His package in current state is not providing the results and crashing with "maxRedirects" error in console. Better to use my fork of his project [yt-ext](https://github.com/uniqbtw/yt-ext) and setting up as local npm package. Error will be fixed in next commit.

# 🎬 YouTube API Server

A production-ready REST API server for fetching YouTube channel and video information with built-in caching, rate limiting, and comprehensive API key management.

## ✨ Features

- 🔐 **API Key Authentication** - Secure access with configurable keys
- 🛤️ **Route Control** - Enable/disable routes globally or per-key
- ⏰ **Key Expiration** - Set usage limits and expiration dates
- 📊 **Analytics** - Track usage statistics per API key
- 💾 **Persistent Caching** - File-based cache with configurable TTL
- 🚦 **Rate Limiting** - Configurable rate limits with persistence
- 🎨 **Admin Panel** - Web-based GUI for management
- 🌐 **IP Binding** - Restrict keys to specific IP addresses

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.x or higher
- **npm** or **pnpm** (recommended)

### Installation

```bash
# Clone or download this repository
git clone https://github.com/uniqbtw/youtube-api-server
cd youtube-api-server

# Install dependencies
npm install
# or
pnpm install

# Copy environment file
cp .env.example .env

# Start the server
npm start
# or
pnpm start
```

Server will start on `http://localhost:3321`

### First Run

On first run, an **Admin API Key** is automatically generated. Check the console:
```
[API Keys] Created admin key: XXXXXX-XXXXXX-XXXXXX-XXXXXX
```

**Save this key!** You'll need it to access the admin panel.

### Access Admin Panel
```
http://localhost:3321/admin?key=YOUR-ADMIN-KEY
```

## 📚 API Endpoints

### Public (No Authentication)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information |
| GET | `/health` | Health check |

### Protected (API Key Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/youtube/channel/:id` | Full channel info |
| GET | `/youtube/channel/basic/:id` | Basic channel info |
| GET | `/youtube/channel/more/:id` | Extended channel info |
| GET | `/youtube/video/:id` | Video information |
| GET | `/analytics/me` | Your usage statistics |
| GET | `/cache/stats` | Cache statistics |

### Authentication

**Header (Recommended):**
```bash
curl -H "X-API-Key: YOUR-KEY" http://localhost:3321/youtube/channel/UCxxx
```

**Query Parameter:**
```bash
curl "http://localhost:3321/youtube/channel/UCxxx?apiKey=YOUR-KEY"
```

## ⚙️ Configuration

Edit `.env` file:

```bash
# Server
PORT=3321
ADDRESS=0.0.0.0
NODE_ENV=production

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000      # 1 minute window
RATE_LIMIT_MAX_REQUESTS=100     # Max requests per window

# Cache
CACHE_DURATION_MINUTES=30       # Cache TTL (0 for infinite)

# CORS
CORS_ORIGIN=*                   # Allowed origins
```

## 📖 Documentation

See the [docs](./docs/) folder for full documentation:

- [Documentation Home](./docs/HOME.md)
- [Installation Guide](./docs/INSTALLATION.md)
- [API Endpoints](./docs/API_ENDPOINTS.md)
- [API Key Management](./docs/API_KEYS.md)
- [Configuration](./docs/CONFIGURATION.md)
- [Error Codes](./docs/ERROR_CODES.md)

## 📁 Project Structure

```
youtube-api-server/
├── .cache/              # Data files (auto-created)
│   ├── api-keys.json    # API keys database
│   ├── routes-config.json
│   ├── analytics.db
│   ├── youtube-cache.json
│   └── rate-limit.json
├── public/
│   └── admin.html       # Admin panel GUI
├── docs/                # Documentation
├── server.js            # Main Express server
├── api-keys.js          # API key management
├── cache.js             # Cache manager
├── db.js                # SQLite analytics
├── middleware.js        # Express middleware
├── youtube.js           # YouTube API functions
├── utils.js             # Utility functions
├── ip-utils.js          # IP address utilities
├── rate-limit-store.js  # Rate limiter store
├── .env.example         # Environment template
├── .gitignore
├── package.json
└── README.md
```

## 📦 Data Files

All data is automatically stored in `.cache/` directory:

| File | Description |
|------|-------------|
| `api-keys.json` | API keys database |
| `routes-config.json` | Route settings |
| `analytics.db` | Usage analytics (SQLite) |
| `youtube-cache.json` | Response cache |
| `rate-limit.json` | Rate limiter state |

## 🔒 Security Notes

- ⚠️ **Never commit `.env`** - Contains secrets
- ⚠️ **Never commit `.cache/`** - Contains API keys
- Admin panel returns standard 404 for unauthorized access
- API keys support IP binding for extra security
- Route-level access control per key

## 🚀 Production Deployment

### Using PM2 (Recommended)
```bash
npm install -g pm2
pm2 start server.js --name youtube-api
pm2 save
pm2 startup
```

### Using Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3321
CMD ["node", "server.js"]
```

### Behind Nginx
```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://127.0.0.1:3321;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 🤖 Development Notes

AI was used to create this project.

## 📝 License

MIT License
