# MERN Task Manager 🚀

A full-stack **Task Management Application** built with the **MERN stack** (MongoDB, Express, React, Node.js).  
This app provides role-based dashboards for **Admins** and **Users**, supports **task CRUD, status tracking, checklists, file uploads, Excel exports**, and **authentication with JWT**.

---

## ✨ Features

### 👩‍💻 Authentication & Users
- Secure login & signup with JWT
- Passwords hashed with bcrypt
- Profile management (name, email, password, profile image)
- Role-based access: **Admin** vs **Member**
- Admin invite system (via `ADMIN_INVITE_TOKEN`)

### ✅ Task Management
- Create, update, delete tasks (Admin only)
- Assign tasks to multiple users
- Track status: *Pending*, *In Progress*, *Completed*
- Add due dates, priorities, attachments
- Todo checklist inside each task
- Task progress auto-calculated

### 📊 Dashboards
- **Admin Dashboard**
  - Task distribution (pie chart by status)
  - Task summary (bar chart by priority)
  - KPIs: total tasks, users, progress
- **User Dashboard**
  - Personal stats: assigned tasks, status summary

### 📂 Reports & Exports
- Export all tasks to **Excel**
- Export users with task statistics to **Excel**

### 🖼 File Uploads
- Profile picture & task attachments via **Multer**
- Files served from `/uploads`
- (⚠️ For production, switch to S3/Cloudinary)

### 📱 Frontend (React + Vite)
- Role-based routes with React Router
- Protected routes with JWT validation
- Context + custom hooks for auth state
- Axios with interceptors (auto token injection & 401 handling)
- TailwindCSS UI + Recharts for charts
- Toast notifications for better UX

### ⚙️ Backend (Node + Express)
- RESTful API with Express
- MongoDB (Mongoose ODM)
- Middleware: JWT auth, Admin-only guard
- Multer for file uploads
- ExcelJS for report generation
- CORS support

---

## 📂 Project Structure

mern-task-manager/
│
├── backend/ # Express + MongoDB API
│ ├── config/ # DB connection
│ ├── controllers/ # Business logic
│ ├── middlewares/ # Auth & uploads
│ ├── models/ # Mongoose schemas
│ ├── routes/ # API routes
│ ├── uploads/ # Uploaded files
│ ├── server.js # Entry point
│ └── package.json
│
└── frontend/Task-Manager/ # React (Vite) app
├── public/ # Static assets
├── src/
│ ├── assets/ # Images
│ ├── components/ # Reusable UI
│ ├── context/ # User context
│ ├── hooks/ # Auth hook
│ ├── layouts/ # Layouts (Dashboard/Auth)
│ ├── pages/ # Pages (Admin/User/Auth)
│ ├── routes/ # Route protection
│ └── utils/ # Axios, API paths, helpers
└── package.json

Backend Setup
cd backend
npm install


Create .env inside backend/:

MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=super_secret
ADMIN_INVITE_TOKEN=some_key
PORT=5000
CORS_ORIGIN=http://localhost:5173


Run:

npm run dev   # for nodemon


Backend will run on: http://localhost:5000

3. Frontend Setup
cd frontend/Task-Manager
npm install


Create .env inside frontend/Task-Manager/:

VITE_API_BASE_URL=http://localhost:5000


Run:

npm run dev


Frontend will run on: http://localhost:5173


📌 API Endpoints
Auth

POST /api/auth/register

POST /api/auth/login

GET /api/auth/profile

PUT /api/auth/profile

POST /api/auth/upload-image

Tasks

GET /api/tasks

GET /api/tasks/:id

POST /api/tasks (Admin only)

PUT /api/tasks/:id

DELETE /api/tasks/:id (Admin only)

PUT /api/tasks/:id/status

PUT /api/tasks/:id/todo

GET /api/tasks/dashboard-data (Admin)

GET /api/tasks/user-dashboard-data

Users (Admin only)

GET /api/users

GET /api/users/:id

Reports (Admin only)

GET /api/reports/export/tasks

GET /api/reports/export/users
