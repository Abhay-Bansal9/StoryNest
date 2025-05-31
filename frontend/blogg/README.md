# BlogCraft

A modern full-stack blogging platform with authentication, auto-save drafts, and a beautiful UI.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Axios, React Router
- **State Management:** React Context API (for authentication)
- **Notifications:** Custom notification system (no external dependency)
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT (for authentication)

## Features

- User registration and login (JWT-based authentication)
- Protected routes and APIs
- Create, edit, auto-save, and publish blog posts
- Draft and published post separation
- Responsive, modern UI with Tailwind CSS
- Form validation and helpful notifications

## Setup Instructions

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- MongoDB (local or cloud instance)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd blog
```

### 2. Install dependencies
#### Backend
```bash
cd blog-app/server
npm install
```
#### Frontend
```bash
cd ../../frontend/blogg
npm install
```

### 3. Configure environment variables
#### Backend
Create a `.env` file in `blog-app/server`:
```
MONGO_URI=mongodb://localhost:27017/blogcraft
JWT_SECRET=your_jwt_secret
PORT=5000
```

### 4. Start the backend server
```bash
cd blog-app/server
npm start
```

### 5. Start the frontend dev server
```bash
cd frontend/blogg
npm start
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Folder Structure
```
blog/
├── blog-app/
│   └── server/         # Express backend
├── frontend/
│   └── blogg/          # React frontend
```

## API Endpoints (Backend)
- `POST   /api/auth/register` — Register a new user
- `POST   /api/auth/login` — Login and get JWT
- `GET    /api/auth/me` — Get current user (protected)
- `GET    /api/blogs` — List all blogs (published/drafts)
- `GET    /api/blogs/:id` — Get a single blog
- `POST   /api/blogs/save-draft` — Save a draft (protected)
- `POST   /api/blogs/publish` — Publish a blog (protected)

## Customization
- Update Tailwind config and theme in `frontend/blogg/tailwind.config.js`
- Backend config in `blog-app/server/.env`

## License
MIT
