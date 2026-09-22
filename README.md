# 📸 TrizenAI Photo Sharing Platform

A full-stack photo workflow for photography and event teams.

**Admin creates event → assigns photographers → photos are uploaded → admin reviews/selects → customer receives a PIN-protected gallery.**

## 🎯 Roles

| Role | Responsibilities |
|---|---|
| Admin / Lead | Events, team management, photo review, gallery publishing |
| Team Member | Assigned events, batch photo uploads, upload tracking |
| Customer | Access published gallery with link + PIN |

## ✨ Key Features

- JWT authentication and backend-enforced RBAC.
- Event-level ownership and assignment checks.
- Batch image uploads with Multer.
- Cloudinary image storage + MongoDB metadata.
- Photo review and selection workflow.
- PIN-protected customer galleries.
- Zod request validation.
- Helmet/CORS security middleware.
- Jest + Supertest testing support.
- Responsive role-specific dashboards.

## 🔄 Workflow

```text
Admin
  │
  ├── Create Event
  └── Assign Team
          │
          ▼
     Team Member
          │ Upload
          ▼
      Cloudinary ─── metadata ───► MongoDB
          │
          ▼
       Admin Review
          │ Select
          ▼
       Gallery + PIN
          │
          ▼
       Customer
```

## 🏗️ Architecture

```text
React + Vite
     │ REST
     ▼
Express API
     │
     ├── Routes
     ├── Middleware
     ├── Controllers
     ├── Services
     └── Models
          │
          ├── MongoDB Atlas
          └── Cloudinary
```

Request flow: **Route → Auth → Role Check → Validation → Controller → Service → Database/Cloudinary**

## 🧰 Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express.js |
| Auth | JWT, bcryptjs |
| Validation | Zod |
| Database | MongoDB, Mongoose, Atlas |
| Storage | Cloudinary, Multer |
| Security | Helmet, CORS |
| Testing | Jest, Supertest |
| Deployment | Vercel, Render |

## 🔐 Security Model

Authentication identifies the user; authorization determines what they can access.

- Admin-only event/team/gallery operations.
- Team-member assignment and event access checks.
- Photo ownership boundaries.
- Gallery publishing restrictions.
- Hashed gallery PINs.
- Backend enforcement rather than frontend-only restrictions.

## ⚙️ Local Development

### Backend
```bash
cd server
npm install
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

Use the repository `.env.example` files for local configuration.

## 🧪 Testing

Testing support covers authentication, authorization, event access, photo access, gallery publishing and PIN verification.

## 🚀 Future Improvements

- Image thumbnails/resizing.
- Pagination for large galleries.
- Advanced photo search.
- Bulk photo management.
- Gallery expiration.
- CDN optimization.
- CI/CD and production monitoring.

## 👨‍💻 Author

**Satyam Kushwaha** · [GitHub](https://github.com/Satyakush) · [Portfolio](https://satyakush.github.io/Portfolio/)