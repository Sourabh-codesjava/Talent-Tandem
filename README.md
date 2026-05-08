# Talent Tandem — Backend

A robust Spring Boot backend for Talent Tandem, a skill-sharing platform that connects mentors and learners through intelligent matching, real-time chat, and structured session management.

---

## Features

- User authentication and authorization with JWT
- Skill-based matching engine for pairing mentors and learners
- Real-time messaging via WebSocket
- Session scheduling and tracking
- Post-session feedback and rating system
- Admin dashboard with platform analytics
- Automated email notifications
- Cloud-based file uploads via Cloudinary
- AI-powered chat assistance using Google Gemini

---

## Tech Stack

| Layer          | Technology            |
|----------------|-----------------------|
| Framework      | Spring Boot 3.5.7     |
| Language       | Java 17               |
| Database       | PostgreSQL            |
| Security       | Spring Security + JWT |
| Real-time      | WebSocket             |
| AI Integration | Google Gemini AI      |
| File Storage   | Cloudinary            |
| Build Tool     | Maven                 |

---

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- PostgreSQL (running locally or remotely)
- A configured `.env` file (see [Environment Variables](#environment-variables))

---

## Getting Started

**1. Clone the repository**

```bash
git clone https://github.com/your-username/talent-tandem-backend.git
cd talent-tandem-backend
```

**2. Set up environment variables**

Create a `.env` file in the project root. See the Environment Variables section below for all required keys.

**3. Run the application**

```bash
mvn spring-boot:run
```

The server will start at `http://localhost:8080` by default.

---

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=your_database_url
DATABASE_USERNAME=your_db_username
DATABASE_PASSWORD=your_db_password

# Cloudinary (File Storage)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Google Gemini AI
GCP_PROJECT_ID=your_gcp_project_id
GEMINI_API_KEY=your_gemini_api_key

# Mail Service
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_email_password

# Security
JWT_SECRET=your_jwt_secret
```

> Never commit your `.env` file. Make sure it is listed in `.gitignore`.

---

## API Endpoints

| Prefix        | Description                              |
|---------------|------------------------------------------|
| `/auth/*`     | Registration, login, token refresh       |
| `/user/*`     | User profile and account management      |
| `/skills/*`   | Skill listing and management             |
| `/sessions/*` | Session scheduling and tracking          |
| `/feedback/*` | Ratings and reviews                      |
| `/admin/*`    | Admin operations and analytics           |
| `/ws/*`       | WebSocket connections for real-time chat |

---

## Security

- JWT-based stateless authentication on all protected routes
- Role-based access control for users, mentors, and admins
- BCrypt password hashing
- CORS configuration for restricted cross-origin access
- No secrets hardcoded in source — all managed via environment variables

---

## Contributing

1. Follow standard Java coding conventions
2. Write unit tests for all new features
3. Keep documentation up to date with your changes
4. Use clear, descriptive commit messages
5. Open a pull request with a summary of your changes

