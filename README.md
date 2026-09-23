<div align="center">

# 📸 TrizenAI Photo Sharing Platform

### Capture · Organize · Review · Publish · Share

A production-oriented full-stack photography platform connecting **event organizers, photographers and customers** through a secure event-to-gallery workflow.

<p>
<a href="https://trizen-photo-platform.vercel.app/"><img src="https://img.shields.io/badge/Live%20Demo-2563eb?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo"></a>
<a href="https://github.com/Satyakush/trizen-photo-platform"><img src="https://img.shields.io/badge/Source%20Code-111827?style=for-the-badge&logo=github&logoColor=white" alt="Source Code"></a>
<img src="https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=111827" alt="React">
<img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
<img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
</p>

</div>

---

## 🌐 Live Platform

**[Open TrizenAI →](https://trizen-photo-platform.vercel.app/)**

**Admin Creates Event → Assigns Team → Photos Uploaded → Admin Reviews → Gallery Published → Customer Accesses Gallery**

---

## ✨ Key Features

### 👨‍💼 Admin / Lead
- Create and manage events
- Assign photographers and team members
- Track upload activity
- Review and select photographs
- Publish customer galleries

### 📷 Team Members
- View assigned events
- Upload batches of photographs
- Track upload progress
- Work within assigned event boundaries

### 🧑‍💻 Customers
- Access published galleries
- Secure gallery authentication
- PIN-protected photo access
- View selected event photographs

---

## 🔐 Security First

- JWT authentication
- Role-based access control
- Event-level ownership checks
- Team assignment validation
- Photo ownership boundaries
- Gallery publishing restrictions
- Hashed gallery PINs
- Zod request validation
- Helmet and CORS security middleware
- Backend-enforced authorization

---

## 🔄 End-to-End Workflow

~~~
             ┌──────────────┐
             │    Admin     │
             └──────┬───────┘
                    │ Create Event
                    │ Assign Team
                    ▼
             ┌──────────────┐
             │ Team Member  │
             └──────┬───────┘
                    │ Batch Upload
                    ▼
             ┌──────────────┐
             │  Cloudinary  │
             └──────┬───────┘
                    │ Metadata
                    ▼
             ┌──────────────┐
             │   MongoDB    │
             └──────┬───────┘
                    │
                    ▼
             ┌──────────────┐
             │ Admin Review │
             └──────┬───────┘
                    │ Select
                    ▼
             ┌──────────────┐
             │ Gallery + PIN│
             └──────┬───────┘
                    │
                    ▼
             ┌──────────────┐
             │   Customer   │
             └──────────────┘
~~~

---

## 🏗️ Architecture

~~~
React + Vite
     │ REST / Axios
     ▼
Express API
     │
     ├── Routes
     ├── Middleware
     ├── Controllers
     ├── Services
     └── Models
          │
          ├──────────────► MongoDB Atlas
          └──────────────► Cloudinary
~~~

Request flow:

**Route → Authentication → Role Check → Validation → Controller → Service → Database / Cloudinary**

---

## 🧰 Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express.js |
| Authentication | JWT, bcryptjs |
| Validation | Zod |
| Database | MongoDB, Mongoose, Atlas |
| Storage | Cloudinary, Multer |
| Security | Helmet, CORS |
| Testing | Jest, Supertest |
| Deployment | Vercel, Render |

---

## 🧪 Testing

Testing support covers authentication, authorization, event access, photo access, gallery publishing and PIN verification.

---

## ⚙️ Local Development

### Backend
~~~bash
cd server
npm install
npm run dev
~~~

### Frontend
~~~bash
cd client
npm install
npm run dev
~~~

Use the repository .env.example files for local configuration.

---

## 🚀 Future Improvements

- Image thumbnails and resizing
- Pagination for large galleries
- Advanced photo search
- Bulk photo management
- Gallery expiration
- CDN optimization
- CI/CD improvements
- Production monitoring

---

## 👨‍💻 Author

**Satyam Kushwaha**

[GitHub](https://github.com/Satyakush) · [Portfolio](https://satyakush.github.io/Portfolio/) · [LinkedIn](https://www.linkedin.com/in/satyam-kushwaha-06b7a5244)

<div align="center">

**From event capture to customer gallery — one workflow, one platform.**

</div>
