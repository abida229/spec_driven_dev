# Todo API Specification

## Overview

**Problem**: Users need a simple way to manage their daily tasks, but we currently don't have a backend API to store and manage todo items.

**Goal**: Build a RESTful API for managing todo items with basic CRUD operations, task completion tracking, and filtering capabilities.

**Target Users**: 
- Frontend developers (who will integrate this API)
- Mobile app developers
- End users (indirectly, through client applications)

**Timeline**: 2 weeks
**Priority**: High (foundational service)

---

## Business Requirements

### Use Cases

1. **Create Tasks**: Users can add new todo items with title and optional description
2. **View Tasks**: Users can see all their todos or filter by status (completed/pending)
3. **Update Tasks**: Users can edit task details or mark them as complete/incomplete
4. **Delete Tasks**: Users can remove tasks they no longer need
5. **Task Organization**: Users can prioritize tasks (high, medium, low)

### Success Metrics

- API response time <200ms for all endpoints
- 99.9% uptime
- Support for 1000+ concurrent users
- Zero data loss

### Must Have (MVP)

- Create a todo item
- Get all todos for a user
- Get a single todo by ID
- Update todo (title, description, status, priority)
- Delete a todo
- Mark todo as complete/incomplete
- Filter todos by completion status
- Basic authentication (user-specific todos)

### Nice to Have (Future)

- Due dates and reminders
- Categories/tags for todos
- Subtasks
- Sharing todos with other users
- Bulk operations (delete multiple, complete multiple)
- Search functionality
- Task history/audit log

### Constraints

- Must be RESTful
- Must support JSON format
- Should be stateless (JWT-based auth)
- Must be horizontally scalable
- Keep infrastructure costs low

---

## Functional Requirements

### FR-1: Create Todo

- User can create a new todo item
- Required fields: `title`
- Optional fields: `description`, `priority`
- Default values:
  - `completed`: false
  - `priority`: "medium"
  - `createdAt`: current timestamp
  - `updatedAt`: current timestamp

### FR-2: Get All Todos

- User can retrieve all their todos
- Support filtering by:
  - `completed` (true/false)
  - `priority` (high/medium/low)
- Support sorting by:
  - `createdAt` (default: descending)
  - `updatedAt`
  - `priority`
- Pagination support (limit, offset)

### FR-3: Get Single Todo

- User can retrieve a specific todo by ID
- Returns 404 if todo doesn't exist
- Returns 403 if todo belongs to another user

### FR-4: Update Todo

- User can update their own todos
- Updatable fields: `title`, `description`, `completed`, `priority`
- `updatedAt` timestamp automatically updated
- Partial updates supported (only send changed fields)
- Cannot update `id`, `userId`, `createdAt`

### FR-5: Delete Todo

- User can delete their own todos
- Hard delete (permanent removal from database)
- Returns 404 if todo doesn't exist
- Returns 403 if todo belongs to another user

### FR-6: Toggle Completion Status

- Dedicated endpoint to quickly mark todo as complete/incomplete
- Simply toggles the `completed` boolean
- Updates `updatedAt` timestamp

---

## Technical Specification

### Architecture

- **Backend**: Node.js/Express OR Python/FastAPI (choose one)
- **Database**: PostgreSQL (production) / SQLite (development)
- **Authentication**: JWT (JSON Web Tokens)
- **API Style**: REST
- **Data Format**: JSON

### Data Model

#### Table: `users`

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_email (email)
);
```

#### Table: `todos`

```sql
CREATE TABLE todos (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL CHECK (char_length(title) > 0 AND char_length(title) <= 255),
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_user_id (user_id),
  INDEX idx_completed (completed),
  INDEX idx_priority (priority),
  INDEX idx_created_at (created_at)
);
```

### API Endpoints

#### Authentication Endpoints

##### `POST /api/auth/register`

**Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response**: `201 Created`
```json
{
  "userId": 1,
  "email": "user@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors**:
- `400 Bad Request` - Invalid email format or weak password
- `409 Conflict` - Email already exists

##### `POST /api/auth/login`

**Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response**: `200 OK`
```json
{
  "userId": 1,
  "email": "user@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors**:
- `401 Unauthorized` - Invalid credentials

---

#### Todo Endpoints

##### `POST /api/todos`

**Auth**: Required (JWT Bearer token)

**Body**:
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread, and vegetables",
  "priority": "high"
}
```

**Response**: `201 Created`
```json
{
  "id": 1,
  "userId": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread, and vegetables",
  "completed": false,
  "priority": "high",
  "createdAt": "2026-08-23T14:30:00Z",
  "updatedAt": "2026-08-23T14:30:00Z"
}
```

**Errors**:
- `401 Unauthorized` - Missing or invalid token
- `400 Bad Request` - Title missing or invalid priority value

##### `GET /api/todos`

**Auth**: Required (JWT Bearer token)

**Query params**: 
- `completed` (optional): true/false
- `priority` (optional): low/medium/high
- `sort` (optional): createdAt/-createdAt/updatedAt/-updatedAt/priority (prefix with - for descending)
- `limit` (default: 50, max: 100)
- `offset` (default: 0)

**Example**: `GET /api/todos?completed=false&priority=high&sort=-createdAt&limit=20`

**Response**: `200 OK`
```json
{
  "todos": [
    {
      "id": 1,
      "userId": 1,
      "title": "Buy groceries",
      "description": "Milk, eggs, bread, and vegetables",
      "completed": false,
      "priority": "high",
      "createdAt": "2026-08-23T14:30:00Z",
      "updatedAt": "2026-08-23T14:30:00Z"
    }
  ],
  "total": 45,
  "limit": 20,
  "offset": 0
}
```

**Errors**:
- `401 Unauthorized` - Missing or invalid token

##### `GET /api/todos/:id`

**Auth**: Required (JWT Bearer token)

**Response**: `200 OK`
```json
{
  "id": 1,
  "userId": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread, and vegetables",
  "completed": false,
  "priority": "high",
  "createdAt": "2026-08-23T14:30:00Z",
  "updatedAt": "2026-08-23T14:30:00Z"
}
```

**Errors**:
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Todo doesn't exist
- `403 Forbidden` - Todo belongs to another user

##### `PATCH /api/todos/:id`

**Auth**: Required (JWT Bearer token)

**Body** (all fields optional, send only what you want to update):
```json
{
  "title": "Buy groceries and pharmacy items",
  "description": "Milk, eggs, bread, vegetables, and aspirin",
  "completed": true,
  "priority": "medium"
}
```

**Response**: `200 OK` with updated todo object

**Errors**:
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Todo doesn't exist
- `403 Forbidden` - Todo belongs to another user
- `400 Bad Request` - Invalid field values

##### `DELETE /api/todos/:id`

**Auth**: Required (JWT Bearer token)

**Response**: `204 No Content`

**Errors**:
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Todo doesn't exist
- `403 Forbidden` - Todo belongs to another user

##### `POST /api/todos/:id/toggle`

**Auth**: Required (JWT Bearer token)

**Description**: Convenience endpoint to toggle completion status

**Response**: `200 OK`
```json
{
  "id": 1,
  "completed": true,
  "updatedAt": "2026-08-23T15:45:00Z"
}
```

**Errors**:
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Todo doesn't exist
- `403 Forbidden` - Todo belongs to another user

---

## Non-Functional Requirements

### Performance

- API response time: <200ms (p95)
- Database query optimization: indexed queries on user_id, completed, priority
- Connection pooling for database
- Consider Redis for caching frequently accessed todos (future)

### Security

- **Password Security**: Hash passwords with bcrypt (cost factor: 12)
- **JWT Security**: 
  - Secret stored in environment variable
  - Token expiration: 7 days
  - Include userId in token payload
- **Input Validation**: Validate and sanitize all inputs
- **SQL Injection Prevention**: Use parameterized queries/ORM
- **Rate Limiting**: 
  - Auth endpoints: 5 requests per 15 minutes per IP
  - Todo endpoints: 100 requests per minute per user
- **CORS**: Configure allowed origins (don't use wildcard in production)
- **HTTPS Only**: Enforce HTTPS in production

### Reliability

- Proper error handling with consistent error response format
- Transaction support for critical operations
- Database backups (daily)
- Logging (info, warn, error levels)
- Health check endpoint: `GET /api/health`

### Scalability

- Stateless design (JWT-based, no sessions)
- Horizontal scaling support
- Database connection pooling
- Consider read replicas for heavy read loads (future)

---

## Error Response Format

All errors follow this consistent structure:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required and must be between 1 and 255 characters",
    "statusCode": 400
  }
}
```

### Standard Error Codes

- `VALIDATION_ERROR` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `CONFLICT` (409) - duplicate email
- `RATE_LIMIT_EXCEEDED` (429)
- `INTERNAL_SERVER_ERROR` (500)

---

## Edge Cases & Validations

### Input Validation

- **Empty title**: Return 400 with "Title cannot be empty"
- **Title >255 chars**: Return 400 with "Title must be 255 characters or less"
- **Invalid priority**: Return 400 with "Priority must be low, medium, or high"
- **Invalid email format**: Return 400 with "Invalid email format"
- **Weak password**: Return 400 with "Password must be at least 8 characters"

### Authentication Edge Cases

- **Expired token**: Return 401 with "Token expired, please login again"
- **Malformed token**: Return 401 with "Invalid token"
- **Token for deleted user**: Return 401 with "User not found"

### Concurrent Updates

- **Two simultaneous updates**: Last write wins, both get 200 OK
- **Delete while updating**: Update returns 404
- **Optimistic locking** (future): Add `version` field to prevent lost updates

### Database Issues

- **Connection failure**: Return 503 with "Service temporarily unavailable"
- **Timeout**: Return 504 with "Request timeout"
- **Constraint violation**: Return 400 with specific error message

---

## Out of Scope

These are explicitly NOT included in this version:

- Due dates and calendar integration
- Recurring todos
- File attachments
- Comments on todos
- Team/collaborative todos
- Todo templates
- Email notifications
- Mobile push notifications
- OAuth/social login
- Password reset flow
- Two-factor authentication

---

## Open Questions

1. **Password Requirements**: Should we enforce complexity rules (special chars, numbers)?
   - **Decision needed by**: Week 1, Day 2
   - **Impact**: Affects validation logic

2. **Soft Delete vs Hard Delete**: Should deleted todos be recoverable?
   - **Decision needed by**: Week 1, Day 3
   - **Impact**: Database schema (add deleted_at column)

3. **Todo Limits**: Should users have a max number of todos?
   - **Decision needed by**: Week 1, Day 4
   - **Impact**: Affects business logic and user experience

---

## Acceptance Criteria

**This API is complete when:**

- [ ] User can register with email and password
- [ ] User can login and receive JWT token
- [ ] Authenticated user can create a todo with title (required) and optional fields
- [ ] User can retrieve all their todos
- [ ] User can filter todos by completion status and priority
- [ ] User can retrieve a single todo by ID
- [ ] User can update any field of their todo
- [ ] User can delete their todo
- [ ] User can toggle completion status
- [ ] User cannot access other users' todos (403 Forbidden)
- [ ] All endpoints return proper HTTP status codes
- [ ] All errors follow consistent error response format
- [ ] Passwords are hashed with bcrypt
- [ ] JWT authentication works correctly
- [ ] Rate limiting prevents abuse
- [ ] Input validation catches all invalid data
- [ ] API response time <200ms (measured under normal load)
- [ ] Health check endpoint responds correctly
- [ ] API documentation is complete (Postman/Swagger)
- [ ] Unit tests cover >80% of code
- [ ] Integration tests cover all API endpoints
- [ ] Database migrations are version controlled

---

## Implementation Notes

### Phase 1 (Week 1): Core CRUD

**Days 1-2: Setup & Authentication**
- Project setup (Node.js + Express OR Python + FastAPI)
- Database setup (PostgreSQL)
- User model and authentication
- JWT implementation
- POST /auth/register
- POST /auth/login

**Days 3-5: Todo CRUD**
- Todo model
- POST /todos (create)
- GET /todos (list with filters)
- GET /todos/:id (get one)
- PATCH /todos/:id (update)
- DELETE /todos/:id (delete)
- POST /todos/:id/toggle (toggle completion)

### Phase 2 (Week 2): Polish & Deploy

**Days 1-2: Security & Validation**
- Input validation for all endpoints
- Rate limiting
- Error handling middleware
- Security headers

**Days 3-4: Testing**
- Unit tests for models and controllers
- Integration tests for all API endpoints
- Test edge cases and error scenarios

**Day 5: Documentation & Deploy**
- API documentation (Postman collection or Swagger)
- README with setup instructions
- Deploy to staging environment
- Final testing
- Deploy to production

---

## Testing Strategy

### Unit Tests

- User model (password hashing, validation)
- Todo model (validation, default values)
- JWT utility functions
- Validation middleware

### Integration Tests

- All API endpoints (happy path)
- Authentication flow
- Authorization (user can't access other's todos)
- Error scenarios (404, 400, 401, 403)
- Filter and sort functionality
- Pagination

### Load Tests (Optional)

- 1000 concurrent users
- Response time under load
- Database performance

---

## Environment Variables

Required environment variables:

```bash
# Server
PORT=3000
NODE_ENV=development|production

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/todo_db

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRATION=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Sample API Usage

### Registration & Authentication
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

### Todo Operations
```bash
# Create todo
curl -X POST http://localhost:3000/api/todos \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "priority": "high"}'

# Get all todos
curl -X GET http://localhost:3000/api/todos \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get incomplete todos
curl -X GET http://localhost:3000/api/todos?completed=false \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Update todo
curl -X PATCH http://localhost:3000/api/todos/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# Delete todo
curl -X DELETE http://localhost:3000/api/todos/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

**Spec Version**: 1.0  
**Last Updated**: 2026-08-23  
**Author**: Development Team  
**Stakeholders**: Frontend Team, Mobile Team, Product Manager
