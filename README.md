# HPPCHRI Campaign

A full-stack campaign and registration platform for the **Homi Bhabha Cancer Hospital & Research Institute (HPPCHRI)** youth awareness campaign. The application combines a responsive public campaign website, participant registration, digital registration passes, public registration verification, an authenticated administration dashboard, MongoDB persistence, and transactional email support.

> **Live application:** https://hppchri-campaign.vercel.app/
>
> **Repository:** https://github.com/Shrestha-Gupta/HPPCHRI-Campaign

---

## Overview

HPPCHRI Campaign is a production-oriented web platform created to support a youth-focused awareness and registration campaign. It uses a lightweight HTML/CSS/JavaScript frontend with a structured Node.js/Express backend for persistent data, administration, authentication, and email delivery.

The platform provides four main experiences:

1. **Public campaign website** — campaign, hospital, awareness, and interactive quiz content.
2. **Participant registration** — validated registration with persistent MongoDB storage.
3. **Digital pass and verification** — a unique registration ID and printable/shareable pass.
4. **Administration** — authenticated registration management through an admin dashboard.

---

## Key Features

### Public Website

- Responsive campaign landing page.
- Campaign and institutional information.
- Awareness-focused content and pledge flow.
- Mobile-friendly navigation and UI.
- Countdown and interactive UI elements.
- Campaign social/communication links.

### Registration

- Public registration form.
- Client-side and server-side validation.
- Required email and contact information.
- Category-based/conditional registration fields.
- Unique registration ID generation.
- MongoDB-backed persistent records.
- Registration success/pass experience.

### Digital Registration Pass

- Registration-ID-based participant pass.
- Participant details displayed after registration.
- Print-friendly pass.
- Download/print support.
- WhatsApp sharing support.
- Green pass presentation preserved for print output.

### Registration Verification

- Public verification using registration ID.
- Public endpoint exposes only the information required for verification rather than the complete administrative record.

### Awareness Quiz

- Interactive tobacco-awareness quiz.
- Client-side quiz logic.
- Result/interaction handling without a separate quiz account.

### Admin Dashboard

- Dedicated admin login.
- JWT-based authenticated session.
- HttpOnly authentication cookie.
- Protected administration endpoints.
- Registration listing and search/filtering.
- Registration details.
- Add, update, and delete registrations.
- Registration statistics.
- CSV export.
- Legacy registration migration support.
- Logout/session validation.

### Email

- EmailJS integration from the backend.
- Registration confirmation email support.
- Email delivery status returned separately from registration persistence.
- Registration is not rolled back solely because an email provider fails.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Authentication | JWT + HttpOnly cookies |
| Password security | bcrypt/bcryptjs-based password hashing |
| Email | EmailJS REST integration |
| Deployment | Vercel |
| API style | REST/JSON |
| Development | npm |

The project does not require React, Next.js, or another frontend framework. The public interface is implemented with standard HTML, CSS, and JavaScript.

---

## Architecture

The architecture is intentionally simple: the browser communicates with the Express API, while the API handles authentication, database operations, and email delivery.

```text
                 HPPCHRI Campaign
                        |
        +---------------+---------------+
        |                               |
   Public Website                  Admin Dashboard
 HTML/CSS/JavaScript             HTML/CSS/JavaScript
        |                               |
        +---------------+---------------+
                        |
                   Vercel / API
                        |
                  Express.js API
                        |
             +----------+----------+
             |                     |
        MongoDB Atlas           EmailJS
        (registrations)       (confirmation mail)
```

### Production routing

```text
Browser → Vercel → api/index.js → Express app → MongoDB / EmailJS
```

The same Express application is used locally through `server/server.js` and on Vercel through `api/index.js`.

---

## Application Flow

The application flow is kept intentionally simple:

```text
Visit Website
     ↓
Register
     ↓
Backend validates & saves data
     ↓
Registration ID generated
     ↓
Digital Pass displayed
     ↓
Confirmation Email sent
```

For administration:

```text
Admin Login
     ↓
JWT Authentication
     ↓
Admin Dashboard
     ↓
Manage Registrations
```

---

## Project Structure

```text
HPPCHRI-Campaign/
│
├── api/
│   └── index.js                  # Vercel serverless Express entry point
│
├── assets/                       # Campaign images, logos and static assets
│   ├── hppchri_logo.png
│   ├── golden_jubilee_logo.png
│   ├── hospital_building.jpg
│   ├── hospital_interior.png
│   ├── cm_yogi_adityanath.jpg
│   ├── governor_anandiben_patel.jpg
│   └── ...
│
├── css/
│   └── style.css                 # Main responsive stylesheet
│
├── js/
│   ├── app.js                    # Global UI/navigation/countdown/client utilities
│   ├── quiz.js                   # Awareness quiz logic
│   └── registration.js            # Registration and pass workflow
│
├── server/
│   ├── config/
│   │   └── db.js                 # MongoDB/Mongoose connection
│   ├── controllers/
│   │   ├── adminController.js    # Admin authentication/management logic
│   │   └── registrationController.js
│   │                              # Registration/business logic
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT authentication middleware
│   ├── models/
│   │   ├── Admin.js              # Admin schema/model
│   │   └── Registration.js       # Registration schema/model
│   ├── routes/
│   │   ├── adminRoutes.js        # Admin API routes
│   │   └── registrationRoutes.js # Public registration routes
│   ├── scripts/
│   │   └── seedAdmin.js          # Initial/admin account seeding utility
│   ├── services/
│   │   └── emailService.js       # EmailJS integration
│   ├── app.js                    # Express app configuration
│   ├── server.js                 # Local server entry point
│   └── package.json              # Backend dependencies/scripts
│
├── admin.html                    # Admin login/dashboard UI
├── index.html                    # Public campaign website
├── pass.html                     # Registration pass/verification page
├── package.json                  # Root/Vercel dependencies
├── package-lock.json             # Locked root dependencies
└── vercel.json                   # Vercel routing/deployment configuration
```

> The asset list above is representative rather than exhaustive; the `assets/` directory contains the campaign's static media used by the frontend.

---

## Frontend

### `index.html`

The main public-facing application contains the campaign presentation, awareness information, registration experience, campaign links, and quiz entry point.

### `js/app.js`

Handles client-side application behavior such as navigation, interactive sections, countdown/UI behavior, and browser-side utilities. It also contains legacy/sample-data handling used by the existing application flow.

### `js/registration.js`

Handles:

- Required-field validation.
- Email format validation.
- API submission.
- Registration success handling.
- Registration ID/pass rendering.
- Pass download/print behavior.
- WhatsApp sharing.
- Submit-button state management.

### `js/quiz.js`

Contains the client-side awareness quiz logic.

### `css/style.css`

Contains the primary responsive visual system for the campaign website, registration experience, pass presentation, navigation, cards, sections, and print behavior.

### `admin.html`

Provides the administration interface for login and authenticated registration management.

### `pass.html`

Provides the pass/verification experience associated with registration IDs.

---

## Backend

The backend follows a conventional Express layered architecture:

```text
Request → Route → Controller → Model/Service → Database/Email → Response
```

### `server/app.js`

Creates/configures the Express application and mounts middleware and API routes. It is reusable by both local development and the Vercel serverless entry point.

### `server/server.js`

Local development entry point that starts the Express HTTP server.

### `server/routes/`

Defines API endpoints and delegates request processing to controllers.

### `server/controllers/`

Contains application/business logic for registration and administrative operations.

### `server/models/`

Contains Mongoose schemas and models used for persistent storage.

### `server/middleware/authMiddleware.js`

Validates the JWT authentication cookie before allowing protected administration requests to continue.

### `server/services/emailService.js`

Provides the backend abstraction for sending registration confirmation emails through EmailJS's REST API.

### `server/scripts/seedAdmin.js`

Provides a controlled way to create the initial admin account from environment-provided credentials.

---

## Database Design

MongoDB Atlas is the persistent datastore and Mongoose is used as the ODM.

### Registration collection

The registration model stores participant registration and campaign information, including fields such as:

- Unique registration ID.
- Participant name.
- Email address.
- Phone/contact information.
- Participant category.
- Institution/organization information where applicable.
- City/location information where collected.
- Social/communication information where collected.
- Awareness/pledge information.
- Registration metadata/timestamps.

The exact schema in `server/models/Registration.js` is the source of truth for field names and validation rules.

### Admin collection

The admin model stores:

- Admin identifier.
- Password hash.
- Creation/update timestamps.
- Password verification behavior.

Passwords are not stored as plain text.

### Data flow

```text
Registration Form → Express Controller → Mongoose → MongoDB Atlas
```

---

## API Reference

### Base URLs

Production:

```text
https://hppchri-campaign.vercel.app/api
```

Local development:

```text
http://localhost:5000/api
```

### Public Registration API

#### `POST /registrations`

Creates a new participant registration.

**Authentication:** None

Typical request:

```json
{
  "name": "Participant Name",
  "email": "participant@example.com",
  "phone": "9876543210",
  "category": "Student"
}
```

The actual accepted request body follows the validation implemented in `registrationController.js`; additional campaign-specific fields may be required depending on the selected category.

Typical successful response:

```json
{
  "success": true,
  "registrationId": "HPP-YS-50-1234",
  "emailSent": true
}
```

`emailSent` represents email-service status. Successful database registration is not made dependent on successful email delivery.

#### `GET /registrations/:registrationId`

Retrieves public verification/pass information associated with a registration ID.

**Authentication:** None

Example:

```text
GET /api/registrations/HPP-YS-50-1234
```

---

## Admin API

All endpoints below except login/logout are protected by JWT authentication.

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/admin/login` | Authenticate administrator |
| `POST` | `/admin/logout` | End admin session |
| `GET` | `/admin/me` | Check current admin session |
| `GET` | `/admin/registrations` | List registrations |
| `GET` | `/admin/registrations/:registrationId` | View one registration |
| `POST` | `/admin/registrations` | Create registration |
| `PUT` | `/admin/registrations/:registrationId` | Update registration |
| `DELETE` | `/admin/registrations/:registrationId` | Delete registration |
| `POST` | `/admin/migrate` | Migrate legacy registration data |
| `GET` | `/health` | API health check |

For exact request/response fields and validation behavior, `server/routes/` and the corresponding controllers are the authoritative implementation.

---

## Authentication and Security

The administration layer uses:

- JWT-based authentication.
- HttpOnly cookies for the authentication token.
- Password hashing rather than plain-text password storage.
- Middleware-based protection of admin endpoints.
- Separate public and protected API routes.
- Server-side validation in addition to browser-side validation.
- Environment variables for secrets and provider credentials.

### Authentication model

```text
Admin credentials
       ↓
POST /admin/login
       ↓
Password verification
       ↓
JWT created
       ↓
HttpOnly cookie
       ↓
Protected admin request
```

### Important security rule

Never commit the following to GitHub:

- MongoDB connection strings containing credentials.
- JWT secrets.
- Admin passwords.
- EmailJS private keys.
- Production API credentials.
- Any `.env` file containing real secrets.

Use `.env` locally and Vercel Environment Variables in production.

---

## Environment Variables

Configure the following values through the backend environment. Use placeholders locally and Vercel Environment Variables in production.

```env
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=
NODE_ENV=
PORT=
FRONTEND_URL=

ADMIN_ID=
ADMIN_PASSWORD=

EMAILJS_SERVICE_ID=
EMAILJS_TEMPLATE_ID=
EMAILJS_PUBLIC_KEY=
EMAILJS_PRIVATE_KEY=
```

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret used to sign/verify admin JWTs |
| `JWT_EXPIRES_IN` | JWT lifetime configuration |
| `NODE_ENV` | Runtime environment configuration |
| `PORT` | Local HTTP server port |
| `FRONTEND_URL` | Frontend/production origin configuration where used |
| `ADMIN_ID` | Initial admin identifier used by the seeding workflow |
| `ADMIN_PASSWORD` | Initial admin password used by the seeding workflow |
| `EMAILJS_SERVICE_ID` | EmailJS service identifier |
| `EMAILJS_TEMPLATE_ID` | EmailJS template identifier |
| `EMAILJS_PUBLIC_KEY` | EmailJS public key |
| `EMAILJS_PRIVATE_KEY` | EmailJS private/server credential |

> Never place real credentials in this README or commit them to Git.

---

## Prerequisites

- Node.js (an actively supported LTS release is recommended).
- npm.
- MongoDB Atlas account/database.
- EmailJS account if confirmation emails are required.
- Git.

Verify Node/npm:

```bash
node --version
npm --version
```

---

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/Shrestha-Gupta/HPPCHRI-Campaign.git
cd HPPCHRI-Campaign
```

### 2. Install dependencies

```bash
npm install
cd server
npm install
cd ..
```

### 3. Configure environment variables

Create the backend environment file and provide the values described in [Environment Variables](#environment-variables). Do not commit the real file.

### 4. Start the backend

```bash
cd server
npm start
```

Use the development script defined in `server/package.json` if it differs from the command above.

### 5. Serve the frontend

The frontend is made from static HTML/CSS/JavaScript. Use a local static server during development rather than relying on `file://` when API requests are required.

### 6. Test the API

```text
http://localhost:5000/api/health
```

Then test registration and admin flows from the browser.

---

## Admin Setup

The project includes `server/scripts/seedAdmin.js` for creating an initial administrative account.

1. Configure `ADMIN_ID` and `ADMIN_PASSWORD`.
2. Configure `MONGODB_URI`.
3. Run the admin seeding script from the `server` directory using the script exposed by `server/package.json`.
4. Open `admin.html`.
5. Authenticate using the seeded credentials.
6. Rotate credentials according to your deployment policy when moving beyond development.

Never hard-code production credentials into source code.

---

## MongoDB Setup

1. Create a MongoDB Atlas project.
2. Create a database deployment/cluster.
3. Create a database user with the minimum required permissions.
4. Configure Network Access.
5. Copy the application connection string.
6. Set it as `MONGODB_URI`.
7. Start the backend and verify the database connection.

For temporary development/testing, broader IP access may be used when necessary. For production, restrict MongoDB network access to trusted sources and avoid leaving an unrestricted `0.0.0.0/0` rule enabled without a deliberate security decision.

---

## EmailJS Setup

Registration confirmation emails are handled by:

```text
server/services/emailService.js
```

### Setup

1. Configure an EmailJS service.
2. Create the registration confirmation template.
3. Obtain the required EmailJS credentials.
4. Set:

```env
EMAILJS_SERVICE_ID=
EMAILJS_TEMPLATE_ID=
EMAILJS_PUBLIC_KEY=
EMAILJS_PRIVATE_KEY=
```

5. Deploy/restart the backend.
6. Submit a test registration.
7. Verify both the registration record and email delivery status.

### Important behavior

Registration persistence and email delivery are separate operations. If MongoDB successfully saves the participant but EmailJS fails, the registration can still be successful while the API reports `emailSent: false`.

---

## Vercel Deployment

The repository contains:

```text
api/index.js
vercel.json
```

### Deployment model

```text
GitHub → Vercel → Static Frontend
                 ↓
              /api/*
                 ↓
           Express Serverless API
                 ↓
        MongoDB Atlas + EmailJS
```

### Deployment steps

1. Import the GitHub repository into Vercel.
2. Use the repository root as the project root.
3. Keep the existing `vercel.json` configuration.
4. Add all production environment variables in Vercel.
5. Deploy.
6. Test:
   - Public campaign page.
   - Registration submission.
   - Registration pass.
   - Public registration verification.
   - Admin login.
   - Admin registration management.
   - CSV export.
   - Email delivery.

### Why `api/index.js` exists

Vercel's serverless runtime needs an exported request handler rather than a long-running `app.listen()` process. `api/index.js` provides that bridge while `server/server.js` remains suitable for local execution.

---

## Troubleshooting

### Registration fails

Check:

1. Browser network request/response.
2. Backend deployment/runtime logs.
3. `MONGODB_URI`.
4. MongoDB Atlas Network Access.
5. MongoDB user permissions.
6. Server-side validation errors.

### Registration succeeds but email is not received

Check:

1. EmailJS service ID.
2. EmailJS template ID.
3. EmailJS public/private credentials.
4. Template variables.
5. EmailJS service logs/status.
6. Spam/junk folder.
7. API response's `emailSent` value.

### Admin login fails

Check:

1. Admin credentials were seeded correctly.
2. `MONGODB_URI` points to the intended database.
3. Stored password is hashed through the model/seeding workflow.
4. `JWT_SECRET` is configured.
5. Authentication cookies are being sent by the browser.
6. Production cookie/origin configuration.

### Admin dashboard loads but API requests fail

Check:

1. Browser Network tab.
2. `/api/admin/me` response.
3. Authentication cookie.
4. Vercel function logs.
5. `vercel.json` routing.
6. Backend environment variables.

### Vercel page works but API does not

Check:

1. `api/index.js` exists at the repository root.
2. `vercel.json` is deployed.
3. `/api/*` routing is configured.
4. Production environment variables are configured.
5. MongoDB Atlas allows the deployment to connect.

---

## Production and Security Guidelines

Before treating a deployment as production-ready:

- Use strong, unique admin credentials.
- Keep all secrets outside Git.
- Restrict MongoDB network access as much as practical.
- Use a least-privilege MongoDB user.
- Keep dependencies updated and review security advisories.
- Keep public verification responses limited to required information.
- Do not expose administrative endpoints without authentication.
- Review Vercel logs for failed requests and unexpected behavior.
- Do not reuse development credentials in production.
- Test email delivery after production configuration changes.
- Back up important registration data according to operational requirements.

---

## Current Implementation Notes

### Registration IDs

The application uses a human-readable registration identifier in the form:

```text
HPP-YS-50-XXXX
```

The generated identifier is persisted with the registration and used by the pass/verification workflow.

### Email delivery is not the source of truth

MongoDB is the source of truth for registration persistence. EmailJS is a notification channel. A participant should not be considered unregistered solely because an email could not be delivered.

### Legacy data migration

The application includes a migration path for legacy registration data for compatibility with the earlier client-side registration/data workflow.

### Sample/legacy client-side data

The existing frontend contains legacy/sample-data handling. Production registration data should be considered authoritative when it is persisted by the backend in MongoDB.

### Public vs. administrative access

Public registration verification and administrative registration management are separate access levels. Public verification is not a substitute for admin authentication.

### Print behavior

The registration pass includes print-specific styling so that the pass remains visually usable when printed or saved through the browser's print flow.

---

## Future Improvements

Potential improvements include:

- Automated API/integration tests.
- Automated frontend tests.
- Formal OpenAPI/Swagger documentation.
- Stronger server-side rate limiting for public registration endpoints.
- More granular admin roles/permissions.
- Audit logging for administrative changes.
- Pagination for large registration datasets.
- Server-side CSV generation for very large datasets.
- Automated database backup/retention policy.
- CI/CD checks for linting, tests, and dependency vulnerabilities.
- Centralized structured logging and monitoring.
- Stronger registration-ID generation for higher-scale deployments.
- Dedicated production email monitoring and retry handling.
- Automated end-to-end deployment smoke tests.

These are future opportunities, not claims about functionality already present in the repository.

---

## Contributing

1. Fork the repository.
2. Create a feature branch:

```bash
git checkout -b feature/your-feature
```

3. Make focused changes.
4. Test frontend, backend, database, and deployment behavior relevant to the change.
5. Commit with a clear message:

```bash
git commit -m "feat: describe the change"
```

6. Push the branch.
7. Open a pull request with the problem, implementation summary, testing performed, and deployment/configuration considerations.

---

## License

No `LICENSE` file is currently present in the repository. Therefore, this project should **not** be assumed to have an open-source license. Copyright and reuse permissions should be clarified by the project owner before redistribution or commercial reuse.

---

## Acknowledgements

- **Homi Bhabha Cancer Hospital & Research Institute (HPPCHRI)** for the campaign/institutional context represented by the platform.
- Campaign stakeholders and contributors involved in the youth awareness initiative.
- The open-source Node.js, Express, Mongoose, MongoDB, Vercel, and related tooling ecosystems used to build and deploy the platform.

---

## Author

**Shrestha Gupta**

- GitHub: https://github.com/Shrestha-Gupta
- Project Repository: https://github.com/Shrestha-Gupta/HPPCHRI-Campaign
- Live Project: https://hppchri-campaign.vercel.app/

---

## Project Snapshot

| Area | Implementation |
|---|---|
| Frontend | HTML + CSS + Vanilla JavaScript |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas + Mongoose |
| Authentication | JWT + HttpOnly cookie |
| Admin | Protected dashboard with registration management |
| Email | EmailJS backend integration |
| Deployment | Vercel serverless architecture |
| Public verification | Registration ID based |
| Registration pass | Digital + print/share workflow |
| Quiz | Client-side awareness quiz |

---

**Built as a complete campaign registration and administration platform with a lightweight frontend, structured backend, persistent database, authenticated operations, and cloud deployment.**
