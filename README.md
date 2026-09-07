# 📸 TrizenAI Photo Sharing Platform

A full-stack photo-sharing platform built for photography and event teams.

The platform allows an Admin/Lead to create events, manage team members, review uploaded photographs, select photos for a customer-facing gallery, and publish that gallery behind a secure PIN.

Team members can access their assigned events and upload photographs, while customers can access a published gallery without creating an account.

---

## ✨ Features

### 👨‍💼 Admin / Lead

- 🔐 Register and login
- 📅 Create and manage events
- 👥 Create and manage team members
- ➕ Assign team members to events
- ➖ Remove team members from events
- 🖼️ View all photos uploaded for an event
- ☑️ Select photos for publishing
- 🏛️ Create galleries
- 🔑 Set a gallery PIN
- 🚀 Publish galleries
- 🔗 Generate shareable gallery links
- 🗑️ Delete events
- 📊 View event and upload statistics

### 📷 Team Member

- 🔐 Login
- 📅 View assigned events
- 🖼️ Upload multiple photos
- 👀 View their own uploaded photos
- 📊 Track upload counts
- 🚫 Cannot publish galleries
- 🚫 Cannot manage other users' photos
- 🔒 Cannot access events they are not assigned to

### 👤 Customer

Customers do not need an account.

They can:

- 🔗 Open a shared gallery link
- 🔑 Enter the gallery PIN
- 🖼️ View published photos
- ↔️ Browse the gallery
- 🚫 Cannot access unpublished photos
- 🚫 Cannot access a gallery without the correct PIN

---

# 🔄 Application Workflow

    ┌─────────────────┐
    │   Admin / Lead  │
    └────────┬────────┘
             │
             │ Create Event
             ▼
    ┌─────────────────┐
    │      Event      │
    └────────┬────────┘
             │
             │ Assign Team Members
             ▼
    ┌─────────────────┐
    │  Team Members   │
    └────────┬────────┘
             │
             │ Upload Photos
             ▼
    ┌─────────────────┐
    │    Cloudinary   │
    │  Image Storage  │
    └────────┬────────┘
             │
             │ Photo Metadata
             ▼
    ┌─────────────────┐
    │    MongoDB      │
    └────────┬────────┘
             │
             │ Admin Reviews
             ▼
    ┌─────────────────┐
    │ Selected Photos │
    └────────┬────────┘
             │
             │ Create & Publish
             ▼
    ┌─────────────────┐
    │     Gallery     │
    │     + PIN       │
    └────────┬────────┘
             │
             │ Shareable Link + PIN
             ▼
    ┌─────────────────┐
    │    Customer     │
    │     Gallery     │
    └─────────────────┘

---

# 🛠️ Technology Stack

## Frontend

- ⚛️ React
- ⚡ Vite
- 🎨 Tailwind CSS
- 🧭 React Router
- 🌐 Axios

## Backend

- 🟢 Node.js
- 🚂 Express.js
- 🔐 JWT Authentication
- 🔒 bcryptjs
- ✅ Zod
- 📤 Multer
- 🛡️ Helmet
- 🌐 CORS

## Database

- 🍃 MongoDB
- ☁️ MongoDB Atlas

## Image Storage

- ☁️ Cloudinary

Actual image files are stored in Cloudinary.

MongoDB stores photo metadata and the corresponding storage references.

## Deployment

- ▲ Vercel — Frontend
- 🚀 Render — Backend
- 🍃 MongoDB Atlas — Database
- ☁️ Cloudinary — Image Storage

## Testing

- 🧪 Jest
- 🔬 Supertest

---

# 🏗️ System Architecture

The application follows a layered backend architecture designed to keep responsibilities separated and maintainable.

    Client
       │
       ▼
    React Frontend
       │
       │ HTTP / REST API
       ▼
    Express API
       │
       ├── Routes
       │
       ├── Middleware
       │     ├── Authentication
       │     ├── Role Authorization
       │     ├── Validation
       │     └── Error Handling
       │
       ├── Controllers
       │
       ├── Services
       │
       ├── Models
       │
       ├──────────────► MongoDB Atlas
       │
       └──────────────► Cloudinary

### 🔁 Request Flow

    Frontend
       ↓
    Axios
       ↓
    Express Route
       ↓
    JWT Authentication Middleware
       ↓
    Role Authorization Middleware
       ↓
    Request Validation
       ↓
    Controller
       ↓
    Service Layer
       ↓
    MongoDB / Cloudinary
       ↓
    Controller Response
       ↓
    Frontend

This structure keeps business logic out of routes and controllers and makes the backend easier to maintain and extend.

---

# 🗄️ Database Design

The application uses MongoDB with four main collections:

- 👤 Users
- 📅 Events
- 📷 Photos
- 🖼️ Galleries

---

## 👤 Users

Stores Admin and Team Member accounts.

    User
    ├── _id
    ├── name
    ├── email
    ├── password
    ├── role
    ├── createdAt
    └── updatedAt

### Roles

    admin
    team_member

Passwords are never stored as plain text.

They are securely hashed using bcryptjs.

---

## 📅 Events

Represents an event managed by an Admin.

    Event
    ├── _id
    ├── name
    ├── description
    ├── eventDate
    ├── createdBy
    ├── teamMembers[]
    ├── createdAt
    └── updatedAt

### Relationships

    User (Admin)
          │
          │ createdBy
          ▼
        Event
          │
          │ teamMembers[]
          ▼
    User (Team Members)

Indexes are used for event ownership and team-member assignment queries.

---

## 📷 Photos

Stores metadata for uploaded photographs.

    Photo
    ├── _id
    ├── eventId
    ├── uploadedBy
    ├── filename
    ├── storageUrl
    ├── storagePublicId
    ├── fileSize
    ├── createdAt
    └── updatedAt

The actual image file is stored in Cloudinary.

MongoDB stores metadata and Cloudinary storage information.

    Photo
      │
      ├── Metadata ───────────► MongoDB
      │
      └── Storage URL/Public ID ─────► Cloudinary

This prevents large image files from being stored directly inside MongoDB.

---

## 🖼️ Galleries

Represents the customer-facing gallery for an event.

    Gallery
    ├── _id
    ├── eventId
    ├── photoIds[]
    ├── slug
    ├── pinHash
    ├── isPublished
    ├── publishedAt
    ├── createdBy
    ├── createdAt
    └── updatedAt

The gallery stores references to selected photos rather than duplicating image files.

The gallery PIN is stored as a bcrypt hash rather than plain text.

---

# 🔐 Authentication

The application uses JWT-based authentication for Admin and Team Member accounts.

### Authentication Flow

    User Login
        ↓
    Email + Password
        ↓
    Backend validates credentials
        ↓
    Password compared using bcrypt
        ↓
    JWT generated
        ↓
    Frontend stores authentication state
        ↓
    JWT sent with protected API requests
        ↓
    Authentication middleware verifies JWT
        ↓
    Request continues

JWT expiration is handled by the authentication flow so expired or invalid tokens cannot be used to access protected APIs.

---

# 🛡️ Role-Based Authorization

Authentication and authorization are treated as separate concerns.

### Authentication

Answers:

    "Who is this user?"

JWT authentication verifies the identity of the user.

### Authorization

Answers:

    "Is this user allowed to perform this operation?"

Role-based middleware restricts operations based on the user's role.

### Admin Permissions

    Admin
      ├── Create Events
      ├── Manage Team Members
      ├── Review Photos
      ├── Select Photos
      ├── Create Galleries
      └── Publish Galleries

### Team Member Permissions

    Team Member
      ├── View Assigned Events
      ├── Upload Photos
      └── View Own Photos

A Team Member cannot publish a gallery even by manually calling the API.

Authorization is enforced on the backend rather than relying only on frontend UI restrictions.

---

# 🔑 Gallery Authentication

Customer gallery access uses a separate authentication flow from Admin/Team Member authentication.

Customers do not create accounts.

The flow is:

    Customer
       │
       ▼
    Gallery URL
       │
       ▼
    Enter PIN
       │
       ▼
    Backend verifies PIN
       │
       ▼
    Gallery access granted
       │
       ▼
    Published Photos

The gallery PIN is stored as a bcrypt hash.

Only a customer who provides the correct PIN can access the protected gallery.

Gallery access uses a separate gallery-specific authentication mechanism instead of treating the customer as a normal application user.

---

# ☁️ Photo Upload Architecture

Photos are uploaded using multipart form data.

    Team Member
         │
         │ Multiple Photos
         ▼
    React Frontend
         │
         │ multipart/form-data
         ▼
    Express API
         │
         ▼
    Multer
         │
         ▼
    Photo Service
         │
         ├──────────────► Cloudinary
         │                    │
         │                    ▼
         │                Image File
         │
         └──────────────► MongoDB
                              │
                              ▼
                        Photo Metadata

### Supported Image Formats

- JPEG
- PNG
- WEBP

### Upload Restrictions

- Maximum file size: 10 MB per file
- Multiple photo uploads supported
- Maximum batch upload: 20 files

Uploaded files are stored in event-specific Cloudinary folders.

---

# 🌐 API Structure

The backend exposes REST APIs under:

    /api

## 🔐 Authentication

    POST /api/auth/register
    POST /api/auth/login

---

## 📅 Events

    POST /api/events
    GET /api/events
    GET /api/events/:eventId
    DELETE /api/events/:eventId

---

## 👥 Team Management

    GET /api/events/team-members
    POST /api/events/team-members

    POST /api/events/:eventId/team
    DELETE /api/events/:eventId/team/:userId

---

## 📷 Photos

    POST /api/events/:eventId/photos
    GET /api/events/:eventId/photos
    GET /api/events/:eventId/my-photos

---

## 🖼️ Galleries

Gallery APIs allow Admins to create, update, and publish event galleries.

Customer gallery access uses the public gallery route and PIN verification flow.

---

# 🔒 Authorization Rules

The backend validates both the user's role and resource ownership or assignment.

### Admin Access

An Admin can access and manage events they own.

### Team Member Access

A Team Member can access an event only when they are assigned to that event.

### Photo Access

A Team Member can retrieve their own uploaded photos but cannot manage another team member's photos.

Admins can review photos uploaded by the team for their events.

### Gallery Publishing

Gallery creation and publishing are restricted to Admin users.

### Customer Gallery Access

Customers can only access galleries through the appropriate gallery access flow and correct PIN.

### Unpublished Photos

Unpublished photos are not exposed through the customer-facing gallery.

---

# ✅ Validation & Error Handling

Input validation is handled using Zod schemas.

Validation is applied to relevant:

- Request bodies
- Route parameters
- User credentials
- Event data
- Team member data
- Gallery data

The backend also uses centralized error handling.

The application handles cases such as:

- ❌ Invalid request data
- ❌ Invalid MongoDB IDs
- ❌ Unauthorized requests
- ❌ Forbidden operations
- ❌ Missing resources
- ❌ Duplicate users
- ❌ Failed image uploads
- ❌ Invalid gallery PINs
- ❌ Unauthorized event access
- ❌ Invalid roles
- ❌ File upload errors

---

# 🛡️ Security Practices

The application follows several basic security practices:

- 🔐 JWT authentication
- 👮 Role-based authorization
- 🔒 Password hashing with bcryptjs
- 🔑 Gallery PIN hashing
- 🏠 Resource-level authorization
- ✅ Request validation
- 📁 File type validation
- 📦 File size limits
- 🔢 Upload count limits
- 🛡️ Helmet security middleware
- 🌐 CORS configuration
- 🔐 Environment variables for secrets
- 🚫 No credentials committed to Git

Sensitive configuration is provided through environment variables.

---

# 📁 Project Structure

    trizen-photo-platform/
    │
    ├── client/
    │   ├── src/
    │   │   ├── components/
    │   │   ├── context/
    │   │   ├── pages/
    │   │   │   ├── admin/
    │   │   │   ├── team/
    │   │   │   └── gallery/
    │   │   ├── services/
    │   │   ├── App.jsx
    │   │   └── main.jsx
    │   │
    │   ├── .env
    │   ├── package.json
    │   └── vite.config.js
    │
    ├── server/
    │   ├── src/
    │   │   ├── config/
    │   │   ├── controllers/
    │   │   ├── middleware/
    │   │   ├── models/
    │   │   ├── routes/
    │   │   ├── services/
    │   │   ├── validators/
    │   │   ├── app.js
    │   │   └── server.js
    │   │
    │   ├── .env
    │   └── package.json
    │
    ├── .gitignore
    └── README.md

---

# 💻 Local Development Setup

## Prerequisites

Make sure the following are installed:

- Node.js
- npm
- Git
- MongoDB Atlas account
- Cloudinary account

---

## 1. Clone the Repository

    git clone <YOUR_GITHUB_REPOSITORY_URL>
    cd <YOUR_PROJECT_DIRECTORY>

---

# ⚙️ Backend Setup

Navigate to the server directory:

    cd server

Install dependencies:

    npm install

Create a `.env` file inside the `server` directory.

Example:

    PORT=5000
    NODE_ENV=development

    MONGODB_URI=your_mongodb_connection_string

    JWT_SECRET=your_jwt_secret
    JWT_EXPIRES_IN=your_jwt_expiration

    GALLERY_TOKEN_SECRET=your_gallery_token_secret
    GALLERY_TOKEN_EXPIRES_IN=your_gallery_token_expiration

    CLIENT_URL=http://localhost:5173

    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret

Start the backend in development mode:

    npm run dev

The backend will run on:

    http://localhost:5000

---

# ⚛️ Frontend Setup

Open another terminal and navigate to the client:

    cd client

Install dependencies:

    npm install

Create a `.env` file:

    VITE_API_URL=http://localhost:5000/api

Start the frontend:

    npm run dev

The frontend will normally run on:

    http://localhost:5173

---

# 🔐 Environment Variables

## Backend

| Variable | Description |
|---|---|
| `PORT` | Backend server port |
| `NODE_ENV` | Application environment |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret used for Admin/Team JWTs |
| `JWT_EXPIRES_IN` | Admin/Team JWT expiration |
| `GALLERY_TOKEN_SECRET` | Secret used for gallery access |
| `GALLERY_TOKEN_EXPIRES_IN` | Gallery token expiration |
| `CLIENT_URL` | Frontend URL used for CORS |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

## Frontend

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |

⚠️ Never commit real secrets or credentials to Git.

---

# 🍃 MongoDB Atlas

MongoDB Atlas is used as the application's database provider.

MongoDB stores:

- 👤 User accounts
- 📅 Events
- 📷 Photo metadata
- 🖼️ Gallery information
- 🔗 Photo references
- 📊 Application metadata

Actual image files are not stored in MongoDB.

---

# ☁️ Cloudinary

Cloudinary is used as the application's image/object storage layer.

Images are uploaded to Cloudinary and the application stores the relevant Cloudinary information in MongoDB.

Example storage organization:

    events/
      ├── <eventId>/
      │     ├── photo-1
      │     ├── photo-2
      │     └── photo-3

When an event is deleted, associated image objects are also cleaned up from Cloudinary before removing the related database records.

---

# 🚀 Deployment

The application is designed for cloud deployment.

## Frontend — Vercel

The React/Vite frontend can be deployed using Vercel.

The production environment variable should contain:

    VITE_API_URL=<DEPLOYED_BACKEND_API_URL>/api

---

## Backend — Render

The Node.js/Express backend can be deployed using Render.

The backend production environment should contain the required MongoDB, JWT, gallery token, Cloudinary, and frontend URL configuration.

Example:

    NODE_ENV=production
    PORT=<PORT_PROVIDED_BY_HOST>

    MONGODB_URI=<MONGODB_ATLAS_URI>

    JWT_SECRET=<STRONG_SECRET>
    JWT_EXPIRES_IN=<JWT_EXPIRATION>

    GALLERY_TOKEN_SECRET=<STRONG_SECRET>
    GALLERY_TOKEN_EXPIRES_IN=<GALLERY_TOKEN_EXPIRATION>

    CLIENT_URL=<DEPLOYED_FRONTEND_URL>

    CLOUDINARY_CLOUD_NAME=<CLOUDINARY_CLOUD_NAME>
    CLOUDINARY_API_KEY=<CLOUDINARY_API_KEY>
    CLOUDINARY_API_SECRET=<CLOUDINARY_API_SECRET>

---

# ☁️ Production Architecture

                            Internet
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
        Vercel Frontend             Customer Gallery
              │
              │ HTTPS REST API
              ▼
        Render Backend
              │
        ┌─────┴─────┐
        │           │
        ▼           ▼
   MongoDB Atlas  Cloudinary
        │           │
        │           │
     Metadata    Image Files

---

# 🔗 Gallery Access Flow

A published gallery can be shared with a customer using its generated URL.

Example:

    https://your-domain.com/gallery/<gallery-slug>

The customer does not need an account.

### Customer Flow

1. 🔗 Open the gallery URL.
2. 🔑 Enter the gallery PIN.
3. 🔍 Backend verifies the PIN.
4. ✅ Access is granted only when the PIN is correct.
5. 🖼️ Customer browses the published photos.

---

# 🧩 Important Edge Cases

## 🔒 Unauthorized Event Access

If a user attempts to access an event they do not own or are not assigned to, the backend rejects the request.

---

## 🚫 Team Member Publishing a Gallery

Gallery publishing routes are protected by Admin-only authorization.

A Team Member cannot publish a gallery by directly calling the API.

---

## 📤 Failed Photo Upload

Upload errors are handled by the backend.

If an image is uploaded to Cloudinary but the corresponding database operation fails, the uploaded Cloudinary object can be cleaned up to avoid orphaned files.

---

## 🔑 Incorrect Gallery PIN

The supplied PIN is compared against the stored bcrypt hash.

An incorrect PIN does not grant gallery access.

---

## 👁️ Unpublished Photos

Customer gallery access is restricted to the published gallery state.

Photos that have not been selected/published are not exposed through the customer-facing gallery.

---

## 📦 Multiple Photo Uploads

The photo upload endpoint supports multiple images in a single request.

The application validates file types and file sizes before processing uploads.

---

# 🎨 Frontend UX

The frontend provides separate experiences for each role.

    Admin Dashboard
          │
          ├── 📅 Events
          ├── 📋 Event Details
          ├── 👥 Team Management
          ├── 🖼️ Photo Review
          └── 🏛️ Gallery Management

    Team Dashboard
          │
          ├── 📅 Assigned Events
          └── 📷 Photo Uploads

    Customer Gallery
          │
          ├── 🔑 Gallery PIN
          └── 🖼️ Published Photos

The UI includes:

- 📱 Responsive layouts
- ⏳ Loading states
- ❌ Error states
- 📭 Empty states
- ⚠️ Confirmation flows
- 🔎 Event filtering
- 📊 Upload statistics
- 🖼️ Photo counts
- 👤 Role-specific navigation
- 🏛️ Gallery browsing experience
- 🚪 Logout functionality

---

# 🧪 Testing

The project includes testing support using:

- Jest
- Supertest

Important testing areas include:

- Authentication
- Authorization
- Event access control
- Photo access control
- Gallery publishing
- Gallery PIN verification

---

# ⚠️ Known Limitations

The application focuses primarily on the required core functionality.

Advanced production features are intentionally outside the current scope, such as:

- Advanced image processing pipelines
- Large-scale CDN optimization
- Gallery expiration
- Advanced photo search
- Infinite scrolling for very large galleries
- Automated CI/CD pipelines
- Advanced analytics
- Enterprise-scale object storage lifecycle management

These features can be added as the application grows.

---

# 🔮 Future Improvements

Possible future improvements include:

- 🖼️ Image thumbnails and automatic resizing
- 📄 Pagination / infinite scrolling
- 🔎 Advanced photo search and filtering
- 📦 Bulk photo management
- ⬇️ Photo downloads
- ⏳ Gallery expiration
- 🌐 CDN optimization
- ⚙️ Automated CI/CD
- 📊 Gallery analytics
- 📈 Improved monitoring and logging

These features are intentionally secondary to the core event → upload → review → publish → customer workflow.

---

# 💡 Key Design Decisions

## Why MongoDB?

MongoDB fits the application's document-oriented data model and works naturally with the application's relationships.

    User
      ↓
    Event
      ↓
    Photos
      ↓
    Gallery

It also integrates naturally with the Node.js backend.

---

## Why Cloudinary?

Image files should not be stored directly in the database.

Cloudinary provides dedicated image/object storage while also providing reliable URLs and image delivery capabilities.

MongoDB therefore stores only metadata and storage references.

---

## Why JWT?

JWT provides a stateless authentication mechanism for Admin and Team Member APIs.

The backend verifies the token on protected requests and uses the authenticated user's identity and role for authorization.

---

## Why Separate Gallery Authentication?

Customers are fundamentally different from Admins and Team Members.

They do not have accounts and only need temporary access to a specific published gallery.

Therefore, gallery access is kept separate from normal application user authentication.

This prevents a customer gallery access token from being treated as an Admin or Team Member authentication token.

---

## Why Layered Backend Architecture?

The backend separates responsibilities into:

    Routes
       ↓
    Middleware
       ↓
    Controllers
       ↓
    Services
       ↓
    Models / External Services

This keeps responsibilities clear.

- Routes define API endpoints.
- Middleware handles authentication, authorization, validation, and other cross-cutting concerns.
- Controllers handle HTTP requests and responses.
- Services contain business logic.
- Models handle database interaction.
- External services handle integrations such as Cloudinary.

---

# 🔗 Core Data Relationship

                     ┌─────────────┐
                     │    User     │
                     └──────┬──────┘
                            │
                     creates / manages
                            │
                            ▼
                     ┌─────────────┐
                     │    Event    │
                     └──────┬──────┘
                            │
                 ┌──────────┴──────────┐
                 │                     │
                 ▼                     ▼
           Team Members             Photos
                                      │
                                      │ selected
                                      ▼
                                 ┌─────────┐
                                 │ Gallery │
                                 └────┬────┘
                                      │
                                 PIN protected
                                      │
                                      ▼
                                  Customer

---

# 🛡️ Core Security Model

The application follows a defense-in-depth approach.

                     Request
                        │
                        ▼
                 Authentication
                        │
                        ▼
                 Role Authorization
                        │
                        ▼
                  Input Validation
                        │
                        ▼
              Resource-Level Access
                        │
                        ▼
                  Business Logic
                        │
                        ▼
              Database / Cloudinary

Frontend restrictions are treated as a user-experience feature, not as the primary security boundary.

The backend remains responsible for enforcing permissions.

---

# 🎯 Project Goals

The project was designed around the following goals:

1. 🔐 Secure authentication and authorization
2. 👥 Clear role separation
3. 📅 Event-level access control
4. ☁️ Secure cloud image storage
5. 🏗️ Maintainable backend architecture
6. 📱 Responsive frontend experience
7. 🔑 Protected customer galleries
8. 🔄 Reliable end-to-end event workflow
9. 🗄️ Separation of image storage from database metadata
10. 📈 A structure that can be extended for production-scale features

---

# 📋 Submission Information

This project was developed as part of the **TrizenAI Full Stack Internship Challenge**.

Required submission items:

- 💻 Source Code
- 🌐 Live Application
- 📖 README
- 🏗️ Architecture / Database explanation
- 🔑 Demo credentials
- 🖼️ Demo Gallery URL
- 🔢 Gallery PIN
- 🧪 Tests
- 🚀 Deployment

### 📧 Submission Email

    talent@trizen-ai.com

### ⏰ Submission Deadline

    September 20, 2026 — 11:59 PM IST

---

# 👨‍💻 Author

**Satyam Kushwaha**

Full-Stack Developer

### Technologies Used

    React
    Node.js
    Express.js
    MongoDB
    Cloudinary
    JWT
    REST APIs
    Tailwind CSS

---

⭐ Built as a full-stack implementation of the TrizenAI Photo Sharing Platform challenge.