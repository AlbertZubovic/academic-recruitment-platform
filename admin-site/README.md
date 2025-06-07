# TT Admin Site

Two independent projects for the admin dashboard:

## 🖥️ Backend (GraphQL Server)
```bash
cd admin-backend
npm install
npm run dev
# Server: http://localhost:4000/graphql
```

## 🌐 Frontend (Next.js App)  
```bash
cd admin-frontend
npm install  
npm run dev
# Dashboard: http://localhost:3000
```

## 🔐 Login Credentials
- **Username**: `admin`
- **Password**: `admin`

## 🏗️ Architecture
- **Backend**: Apollo GraphQL server with hardcoded admin authentication
- **Frontend**: Next.js 15 + React 19 + Apollo Client + Tailwind CSS
- **Authentication**: JWT tokens (server-side validation)

**Important**: Keep both projects completely independent as per assignment requirements. 