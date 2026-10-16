# COMP3123 Assignment 1 — Employee Management API

**Student:** Nicole Diamantino  
**Student ID:** 101394035  
**Course:** COMP3123 — Full Stack Development I  
**Semester:** Fall 2026

## Project Description

This project is a RESTful Employee Management API developed using Node.js, Express.js, and MongoDB.

The application supports user registration, login, JWT authentication, and employee CRUD operations. Each employee is associated with the authenticated user, preventing users from accessing or modifying employee records belonging to other accounts.

## Technologies Used

- Node.js
- Express.js
- MongoDB and Mongoose
- JSON Web Tokens (JWT)
- bcrypt
- express-validator
- Helmet
- express-rate-limit
- Morgan
- Postman

## Installation and Setup

1. Clone the repository:

```bash
git clone https://github.com/nicolediamantino/101394035_COMP3123_Assignment1.git
```

2. Navigate into the project:

```bash
cd 101394035_COMP3123_Assignment1
```

3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file based on `.env.example` and configure:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

5. Start the application:

```bash
npm start
```

For development:

```bash
npm run dev
```

The application runs on `http://localhost:3000`.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/user/signup` | Register a user |
| POST | `/api/v1/user/login` | Authenticate and receive JWT |
| POST | `/api/v1/emp/employees` | Create employee |
| GET | `/api/v1/emp/employees` | Retrieve authenticated user's employees |
| GET | `/api/v1/emp/employees/:eid` | Retrieve an employee by ID |
| PUT | `/api/v1/emp/employees/:eid` | Update an employee |
| DELETE | `/api/v1/emp/employees?eid=ID` | Delete an employee |
| GET | `/health` | Check server health |

Employee endpoints require JWT authentication.

## Employee Data

Employee records contain:

- First name
- Last name
- Email
- Position
- Salary
- Date of joining
- Department
- User ID

## Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Employee ownership authorization
- Input validation using express-validator
- HTTP security headers using Helmet
- API rate limiting
- Security event logging
- Centralized error handling

## API Testing

Postman is used to test registration, login, employee CRUD operations, authentication, validation, and authorization.

Expected response codes include:

- `200 OK` — Successful retrieval or update
- `201 Created` — Successful resource creation
- `204 No Content` — Successful deletion
- `400 Bad Request` — Invalid input
- `401 Unauthorized` — Missing or invalid authentication
- `403 Forbidden` — Access denied, where applicable
- `404 Not Found` — Resource not found

## Repository

https://github.com/nicolediamantino/101394035_COMP3123_Assignment1.git

## Author

Nicole Diamantino  
George Brown Polytechnic  
COMP3123 — Fall 2026