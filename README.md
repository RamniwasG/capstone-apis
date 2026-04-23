# Capstone APIs

REST API for a simple team/project/task management system built with Node.js, Express, MongoDB, and JWT authentication.

This backend supports:
- user signup and signin
- admin approval of members
- project creation/updates/deletion and member assignment
- task creation, assignment, status updates, and deletion

## Tech Stack

- Node.js
- Express 5
- MongoDB with Mongoose
- JWT authentication
- bcrypt password hashing
- Helmet, CORS, Morgan, and rate limiting

## server live url to play with https://capstone-apis-0x24.onrender.com/api

## frontend live url to play with: https://capstone-app-wq6c.onrender.com

## Project Structure

```text
config/        MongoDB connection
controllers/   Route handler logic
middlewares/   Auth and global error middleware
models/        Mongoose schemas
routes/        Express route definitions
utils/         Custom validator and AppError helper
index.js       App entry point
```

## How The Project Works

There are 3 main resources:

1. Users
2. Projects
3. Tasks

Role model:

- `admin`: can view users, approve/suspend members, create/update/delete projects, manage project members, and view/delete all tasks
- `member`: can sign in after admin activation, view their project tasks, create/update tasks, assign tasks, and update task status

User status values:

- `pending`
- `active`
- `suspended`

Task status values:

- `pending`
- `in-progress`
- `completed`

Task priority values:

- `low`
- `medium`
- `high`

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

The app loads:

- `.env.development` when `NODE_ENV=development`
- `.env.production` when `NODE_ENV=production`

You can create `.env.development` with:

```env
PORT=5000
NODE_ENV=development
MONGO_CLOUD_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
JWT_SECRET=your_jwt_secret
```

Important note:

- `config/db.js` also calls `dotenv.config()` without an environment-specific path.
- For the smoothest local setup, keep the same variables available in `.env.development` and, if needed, `.env`.

### 3. Start the server

```bash
npm run dev
```

or

```bash
npm start
```

Base URL:

```text
http://localhost:5000
```

## Security and Middleware

- `helmet()` for secure headers
- `cors()` allowing `http://localhost:3000`
- `morgan('dev')` for request logging
- rate limit: `100` requests per `15` minutes per IP
- JWT-based route protection through `Authorization: Bearer <token>`

## Authentication

After signin, protected routes require this header:

```http
Authorization: Bearer <JWT_TOKEN>
```

JWT payload includes:

- `id`
- `email`
- `role`

Token expiry:

- `1h`

## Data Models

### User

```json
{
  "username": "string, unique, 3-30 chars, letters/numbers/_/- only",
  "email": "string, unique, valid email",
  "password": "string, strong password",
  "phone": "string, valid Indian mobile number",
  "role": "admin | member",
  "status": "pending | active | suspended"
}
```

Notes:

- only one admin can be created
- admin signup creates `status: active`
- member signup creates `status: pending`

### Project

```json
{
  "name": "string, unique, 3-50 chars",
  "description": "string, max 500 chars",
  "members": ["User ObjectId"],
  "createdBy": "User ObjectId"
}
```

### Task

```json
{
  "title": "string, 3-100 chars",
  "description": "string, max 500 chars",
  "status": "pending | in-progress | completed",
  "priority": "low | medium | high",
  "projectId": "Project ObjectId",
  "assignedTo": "User ObjectId"
}
```

## Step-By-Step API Flow

This is the safest sequence to test the whole project end to end.

### Step 1. Create the admin account

`POST /api/auth/signup`

Request:

```json
{
  "username": "admin1",
  "password": "Admin@123",
  "email": "admin@example.com",
  "phone": "9876543210",
  "role": "admin"
}
```

Expected result:

- admin user is created
- status becomes `active`
- only one admin is allowed in the system

### Step 2. Sign in as admin

`POST /api/auth/signin`

Request:

```json
{
  "username": "admin1",
  "password": "Admin@123"
}
```

Save the returned token for all admin-only APIs.

### Step 3. Create member accounts

`POST /api/auth/signup`

Request:

```json
{
  "username": "member1",
  "password": "Member@123",
  "email": "member1@example.com",
  "phone": "9876543211",
  "role": "member"
}
```

Expected result:

- member is created with `status: pending`
- member cannot sign in until activated by admin

### Step 4. Admin fetches users

`GET /api/users/`

Use admin token.

This returns all non-admin users.

### Step 5. Admin activates a member

`PATCH /api/users/update/:userId/status`

Request:

```json
{
  "status": "active"
}
```

Allowed values:

- `pending`
- `active`
- `suspended`

### Step 6. Member signs in

`POST /api/auth/signin`

Request:

```json
{
  "username": "member1",
  "password": "Member@123"
}
```

Save the member token.

### Step 7. Admin creates a project

`POST /api/projects/create`

Request:

```json
{
  "name": "Capstone Portal",
  "description": "Internal project tracking system"
}
```

Project names must be unique.

### Step 8. Admin gets user IDs from email addresses

`POST /api/users/emails-to-ids`

Request:

```json
{
  "emails": ["member1@example.com"]
}
```

This is useful before assigning project members.

### Step 9. Admin assigns members to a project

`POST /api/projects/:projectId/add-member`

Request:

```json
{
  "memberIds": ["<member_object_id>"]
}
```

### Step 10. View projects

Admin can use:

- `GET /api/projects/getAll`

Member can use:

- `GET /api/projects/getMemberProjects`

### Step 11. Create a task inside a project

`POST /api/tasks/:projectId/create`

Admin or member can call this route.

Request:

```json
{
  "title": "Design dashboard",
  "description": "Prepare the first dashboard draft",
  "priority": "high",
  "assignedTo": "<member_object_id>"
}
```

Task title must be unique within the same project.

### Step 12. View tasks

Admin can use:

- `GET /api/tasks/getAll`

Admin or member can use:

- `GET /api/tasks/:projectId`

### Step 13. Reassign a task

`PATCH /api/tasks/assign/:taskId`

Request:

```json
{
  "assignedTo": "<member_object_id>"
}
```

### Step 14. Update a task

`PUT /api/tasks/:projectId/update/:taskId`

Request:

```json
{
  "title": "Design dashboard v2",
  "description": "Refine wireframes and layout",
  "priority": "medium"
}
```

### Step 15. Update task status

`PATCH /api/tasks/status/:taskId`

Request:

```json
{
  "status": "in-progress"
}
```

Allowed values:

- `pending`
- `in-progress`
- `completed`

### Step 16. Remove project members if needed

`POST /api/projects/:projectId/remove-member`

Request:

```json
{
  "memberIds": ["<member_object_id>"]
}
```

### Step 17. Delete resources if needed

Admin-only routes:

- `DELETE /api/projects/delete/:projectId`
- `DELETE /api/tasks/delete/:taskId`

## Complete API Reference

### Auth APIs

#### `POST /api/auth/signup`

Public route.

Body:

```json
{
  "username": "string",
  "password": "string",
  "email": "string",
  "phone": "string",
  "role": "admin | member"
}
```

Success:

- `201 Created`

#### `POST /api/auth/signin`

Public route.

Body:

```json
{
  "username": "username_or_email",
  "password": "string"
}
```

Success:

- `200 OK`

### User APIs

#### `GET /api/users/`

Protected: `admin`

Returns all non-admin users.

#### `POST /api/users/emails-to-ids`

Protected: `admin`

Body:

```json
{
  "emails": ["member1@example.com", "member2@example.com"]
}
```

#### `PATCH /api/users/update/:userId/status`

Protected: `admin`

Body:

```json
{
  "status": "pending | active | suspended"
}
```

#### `PATCH /api/users/update/:userId/profile`

Protected: authenticated user

Body:

```json
{
  "username": "optional",
  "email": "optional",
  "phone": "optional"
}
```

### Project APIs

#### `GET /api/projects/getAll`

Protected: `admin`

#### `GET /api/projects/getMemberProjects`

Protected: authenticated user

#### `POST /api/projects/create`

Protected: `admin`

Body:

```json
{
  "name": "string",
  "description": "string"
}
```

#### `PATCH /api/projects/update/:projectId`

Protected: `admin`

Body:

```json
{
  "name": "optional",
  "description": "optional"
}
```

#### `DELETE /api/projects/delete/:projectId`

Protected: `admin`

#### `POST /api/projects/:projectId/add-member`

Protected: `admin`

Body:

```json
{
  "memberIds": ["userId1", "userId2"]
}
```

#### `POST /api/projects/:projectId/remove-member`

Protected: `admin`

Body:

```json
{
  "memberIds": ["userId1", "userId2"]
}
```

### Task APIs

#### `GET /api/tasks/getAll`

Protected: `admin`

#### `GET /api/tasks/:projectId`

Protected: `admin | member`

#### `POST /api/tasks/:projectId/create`

Protected: `admin | member`

Body:

```json
{
  "title": "string",
  "description": "string",
  "assignedTo": "userId",
  "priority": "low | medium | high"
}
```

#### `PUT /api/tasks/:projectId/update/:taskId`

Protected: `admin | member`

Body:

```json
{
  "title": "optional",
  "description": "optional",
  "priority": "low | medium | high"
}
```

#### `PATCH /api/tasks/assign/:taskId`

Protected: `admin | member`

Body:

```json
{
  "assignedTo": "userId"
}
```

#### `PATCH /api/tasks/status/:taskId`

Protected: `admin | member`

Body:

```json
{
  "status": "pending | in-progress | completed"
}
```

#### `DELETE /api/tasks/delete/:taskId`

Protected: `admin`

## Sample cURL Requests

### Signup

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username":"admin1",
    "password":"Admin@123",
    "email":"admin@example.com",
    "phone":"9876543210",
    "role":"admin"
  }'
```

### Signin

```bash
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "username":"admin1",
    "password":"Admin@123"
  }'
```

### Create project

```bash
curl -X POST http://localhost:5000/api/projects/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "name":"Capstone Portal",
    "description":"Internal project tracking system"
  }'
```

### Create task

```bash
curl -X POST http://localhost:5000/api/tasks/<PROJECT_ID>/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "title":"Design dashboard",
    "description":"Prepare initial design",
    "priority":"high",
    "assignedTo":"<USER_ID>"
  }'
```

## Recommended Testing Order

1. Create admin
2. Sign in as admin
3. Create members
4. Activate members
5. Sign in as member
6. Create project
7. Add members to project
8. Create tasks
9. Assign or update tasks
10. Move task status from `pending` to `in-progress` to `completed`
