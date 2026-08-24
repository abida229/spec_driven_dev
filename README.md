# Todo API

A RESTful API for managing todo items with JWT authentication, built according to the specification in `todo_api_spec.md`.

## Features

- ✅ User registration and authentication (JWT)
- ✅ Create, read, update, delete todos
- ✅ Filter todos by completion status and priority
- ✅ Toggle todo completion status
- ✅ Pagination support
- ✅ Rate limiting
- ✅ Input validation
- ✅ Security headers (Helmet)
- ✅ CORS support
- ✅ PostgreSQL and SQLite support

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: PostgreSQL (production) / SQLite (development)
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt, helmet, rate limiting

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (for production) or SQLite (for development)

### Installation

1. Clone the repository
```bash
cd spec_driven_dev
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` and update the values:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=sqlite:./dev.db
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRATION=7d
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

For PostgreSQL, use:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/todo_db
```

4. Run database migrations
```bash
npm run migrate
```

5. Start the server
```bash
npm run dev  # Development with auto-reload
# or
npm start    # Production
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication

#### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

### Todos

All todo endpoints require authentication. Include the JWT token in the Authorization header:
```bash
Authorization: Bearer <your-token>
```

#### Create Todo
```bash
POST /api/todos
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "priority": "high"
}
```

#### Get All Todos
```bash
GET /api/todos
Authorization: Bearer <token>

# With filters
GET /api/todos?completed=false&priority=high&sort=-createdAt&limit=20&offset=0
```

#### Get Single Todo
```bash
GET /api/todos/:id
Authorization: Bearer <token>
```

#### Update Todo
```bash
PATCH /api/todos/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Updated title",
  "completed": true,
  "priority": "medium"
}
```

#### Delete Todo
```bash
DELETE /api/todos/:id
Authorization: Bearer <token>
```

#### Toggle Completion
```bash
POST /api/todos/:id/toggle
Authorization: Bearer <token>
```

### Health Check
```bash
GET /api/health
```

## Testing with cURL

### 1. Register a user
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

Copy the token from the response.

### 3. Create a todo
```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"title": "My first todo", "priority": "high"}'
```

### 4. Get all todos
```bash
curl -X GET http://localhost:3000/api/todos \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Project Structure

```
spec_driven_dev/
├── src/
│   ├── config/
│   │   └── index.js           # Configuration
│   ├── controllers/
│   │   ├── authController.js  # Authentication logic
│   │   └── todoController.js  # Todo CRUD logic
│   ├── db/
│   │   ├── database.js        # Database connection
│   │   └── migrate.js         # Database migrations
│   ├── middleware/
│   │   ├── authenticate.js    # JWT authentication
│   │   ├── errorHandler.js    # Global error handler
│   │   └── validation.js      # Input validation
│   ├── models/
│   │   ├── User.js           # User model
│   │   └── Todo.js           # Todo model
│   ├── routes/
│   │   ├── authRoutes.js     # Auth endpoints
│   │   └── todoRoutes.js     # Todo endpoints
│   └── server.js             # Express app
├── .env.example              # Environment variables template
├── .gitignore
├── package.json
└── todo_api_spec.md          # Full API specification
```

## Security Features

- **Password Hashing**: bcrypt with cost factor 12
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: 
  - Auth endpoints: 5 requests per 15 minutes
  - Todo endpoints: 100 requests per minute
- **Input Validation**: All inputs validated and sanitized
- **Security Headers**: Helmet middleware
- **CORS**: Configurable cross-origin requests
- **SQL Injection Prevention**: Parameterized queries

## Error Handling

All errors follow a consistent format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "statusCode": 400
  }
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Todos Table
```sql
CREATE TABLE todos (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  priority VARCHAR(20) DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run migrate` - Run database migrations
- `npm test` - Run tests (when implemented)

## Acceptance Criteria Status

- ✅ User can register with email and password
- ✅ User can login and receive JWT token
- ✅ Authenticated user can create a todo
- ✅ User can retrieve all their todos
- ✅ User can filter todos by completion status and priority
- ✅ User can retrieve a single todo by ID
- ✅ User can update any field of their todo
- ✅ User can delete their todo
- ✅ User can toggle completion status
- ✅ User cannot access other users' todos (403 Forbidden)
- ✅ All endpoints return proper HTTP status codes
- ✅ All errors follow consistent error response format
- ✅ Passwords are hashed with bcrypt
- ✅ JWT authentication works correctly
- ✅ Rate limiting prevents abuse
- ✅ Input validation catches all invalid data
- ✅ Health check endpoint responds correctly
- ✅ Database migrations are implemented

## License

MIT
