# SkillBridge — Backend API

REST API and real-time server for **SkillBridge**, a MERN developer community platform where students and mentors learn, collaborate, and grow together.

**Frontend repo:** [skillbridgefronend-two-three](https://github.com/Om-Bodke384/skillbridgefronend-two-three)

## Features

- **Authentication** — email/password signup and login, **Google OAuth 2.0 sign-in**, JWT access/refresh tokens, email verification, password reset
- **Roles** — student, mentor, admin
- **Communities & Chat** — community spaces and real-time messaging (Socket.IO)
- **Townhalls, Events & Hackathons** — create, browse, and register
- **Announcements** — platform and community updates
- **Learning & Courses** — learning resources and course content
- **Peer Review & Peer Mentorship** — code/project reviews and mentor matching
- **Live Streaming** — Agora token generation for host and viewer sessions
- **SkillBot** — AI assistant powered by Groq
- **Admin panel APIs** — user and content management
- **Uploads** — images and files stored on Cloudinary

## Tech Stack

Node.js, Express, MongoDB (Mongoose), Socket.IO, JWT, Joi validation, google-auth-library, Cloudinary, Nodemailer (Brevo SMTP), Groq SDK, Agora token builder, Winston logging.

**Security:** Helmet, CORS allow-list, rate limiting, `express-mongo-sanitize`, `hpp`, bcrypt password hashing.

## API Overview

All routes are under `/api`:

| Route | Purpose |
|---|---|
| `/auth` | register, login, **google**, refresh-token, logout, me, forgot/reset password, verify email |
| `/users` | profiles and stats |
| `/communities`, `/chats` | communities and messaging |
| `/townhalls`, `/events`, `/hackathons` | events and sessions |
| `/announcements` | announcements |
| `/learning`, `/courses` | learning content |
| `/peer-reviews`, `/peer-mentorship` | peer features |
| `/live` | live streaming tokens and sessions |
| `/chatbot` | SkillBot AI |
| `/admin` | admin operations |
| `/health` | health check |

Responses use a consistent shape: `{ success, statusCode, data, message }`.

## Project Structure

```
server.js              # entry point
src/
  app.js               # express app, middleware, routes
  common/
    config/            # database, cloudinary, email, socket
    middleware/        # auth, validation, errors
    utils/             # logger, response helpers, email templates
  modules/             # auth, users, community, chat, townhall, hackathon,
                       # events, announcements, learning, courses,
                       # peer-review, peer-mentorship, live, chatbot, admin
```

## Getting Started

```bash
git clone https://github.com/Om-Bodke384/skillbridge-backend-two.git
cd skillbridge-backend-two
npm install
cp .env.example .env     # then fill in the values
npm run dev              # development (nodemon)
npm start                # production
```

## Environment Variables

| Variable | Description |
|---|---|
| `NODE_ENV`, `PORT` | environment and port (Render sets `PORT`) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | token signing secrets |
| `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` | token lifetimes |
| `CLIENT_URL` | exact frontend origin, no trailing slash |
| `GOOGLE_CLIENT_ID` | Google OAuth Web client ID |
| `EMAIL_PROVIDER`, `EMAIL_FROM_NAME`, `EMAIL_FROM_ADDRESS`, `BREVO_SMTP_USER`, `BREVO_SMTP_KEY` | email sending |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | file uploads |
| `GROQ_API_KEY` | SkillBot AI |
| `AGORA_APP_ID`, `AGORA_APP_CERTIFICATE` | live streaming |

Never commit `.env`.

## Deployment

Deployed on **Render** (Node web service): build `npm install`, start `npm start`. Set the variables above in the Render dashboard.

## Authors

Built by the SkillBridge team — Om Bodke, Shravani, and Nikita.
