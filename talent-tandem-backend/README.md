# Talent Tandem Backend

A Spring Boot application for connecting mentors and learners in a skill-sharing platform.

## Features

- User authentication and authorization with JWT
- Skill-based matching engine
- Real-time chat and messaging
- Session management and scheduling
- Feedback and rating system
- Admin dashboard and analytics
- Email notifications
- File upload with Cloudinary integration
- AI-powered chat assistance

## Tech Stack

- **Framework**: Spring Boot 3.5.7
- **Language**: Java 17
- **Database**: PostgreSQL
- **Security**: Spring Security with JWT
- **Real-time**: WebSocket
- **AI Integration**: Google Gemini AI
- **File Storage**: Cloudinary
- **Build Tool**: Maven

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- PostgreSQL database
- Environment variables configured

## Setup

1. Clone the repository
2. Configure environment variables in `.env` file
3. Run the application:
   ```bash
   mvn spring-boot:run
   ```

## Environment Variables

Create a `.env` file with the following variables:

```
DATABASE_URL=your_database_url
DATABASE_USERNAME=your_db_username
DATABASE_PASSWORD=your_db_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
GCP_PROJECT_ID=your_gcp_project_id
GEMINI_API_KEY=your_gemini_api_key
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_email_password
JWT_SECRET=your_jwt_secret
```

## API Endpoints

- `/auth/*` - Authentication endpoints
- `/user/*` - User management
- `/skills/*` - Skill management
- `/sessions/*` - Session management
- `/feedback/*` - Feedback system
- `/admin/*` - Admin operations
- `/ws/*` - WebSocket connections

## Security

- JWT-based authentication
- Role-based access control
- CORS configuration
- Environment variable protection
- Password encryption with BCrypt

## Contributing

1. Follow Java coding standards
2. Write unit tests for new features
3. Update documentation as needed
4. Use meaningful commit messages