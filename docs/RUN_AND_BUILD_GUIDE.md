# DSATrack — Run, Build & Deployment Guide

This guide walks you through setting up, seeding, developing, building, and deploying **DSATrack**.

---

## 1. Prerequisites

* **Node.js**: `v18.17.0` or higher (Node 20+ recommended)
* **npm**: `v9.0.0` or higher
* **MongoDB**: A running MongoDB instance (Local MongoDB on `mongodb://127.0.0.1:27017` or a free MongoDB Atlas cluster)

---

## 2. Environment Variables Configuration

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Populate the required environment variables:

```env
# MongoDB Connection String (Local or MongoDB Atlas)
MONGODB_URI=mongodb://127.0.0.1:27017/dsatrack

# Cryptographic secret for signing JWT cookies
JWT_SECRET=super_secret_jwt_key_dsatrack_college_2026

# Public App Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional Google OAuth Credentials (for live Google Cloud credentials)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

---

## 3. Installation & Database Seeding

### 3.1 Install Dependencies
```bash
npm install
```

### 3.2 Seed Database
DSATrack includes a complete database seed script with realistic college departments, instructors, batches (`CSE DSA 2026`, `IT DSA 2026`), students, assignments (`Array Practice`, `Binary Search Practice`), and solved submissions:

```bash
node scripts/seed.js
```

*Alternatively, with the server running, you can seed via HTTP:*
```bash
curl -X POST http://localhost:3000/api/seed
```

---

## 4. Running the Application Locally

Start the local Next.js development server:

```bash
npm run dev
```

Open your browser and navigate to:
**`http://localhost:3000`**

---

## 5. Production Build & Verification

To verify production readiness and generate the optimized standalone build:

```bash
npm run build
```

This compiles all 47 pages and dynamic API routes with 0 errors.

To run the production server locally:
```bash
npm start
```

---

## 6. Pre-Seeded Test Accounts & Credentials

The database is pre-seeded with accounts across all 3 roles:

| Role | Account Name | Login Identifier | Password / Auth | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | System Administrator | `admin@mit.ac.in` or `ADMIN001` | `admin123` | Highest privileges; manages instructors |
| **Instructor** | Prof. Rahul Sharma | `rahul@mit.ac.in` or `INS001` | `password123` | Teaches `CSE DSA 2026` (Code: `DSA-CSE-A26`) |
| **Instructor** | Dr. Sunita Rao | `sunita@miet.ac.in` or `INS002` | `password123` | Teaches `IT DSA 2026` (Code: `DSA-IT-A26`) |
| **Student** | Nikhil Sharma | `nikhil@mit.ac.in` | Google One-Click | Enrolled in CSE DSA 2026; high solve count |
| **Student** | Aman Gupta | `aman@mit.ac.in` | Google One-Click | Enrolled in CSE DSA 2026 |
| **Student** | Priya Patel | `priya@miet.ac.in` | Google One-Click | Enrolled in CSE DSA 2026 |
| **Student (New Setup)** | Kavya Nair | `kavya@mit.ac.in` | Google One-Click | Simulates first-time `/student/profile/setup` |

---

## 7. Deployment Instructions

### 7.1 Deploying to Vercel (Frontend & Serverless Backend)
1. Push this repository to GitHub/GitLab.
2. In the Vercel Dashboard, click **Add New Project** and import the repository.
3. In **Environment Variables**, add:
   * `MONGODB_URI`: Your MongoDB Atlas URI (e.g., `mongodb+srv://<user>:<password>@cluster.mongodb.net/dsatrack`)
   * `JWT_SECRET`: A secure 32+ character random string
   * `NEXT_PUBLIC_APP_URL`: Your Vercel production domain (e.g., `https://dsatrack.vercel.app`)
4. Click **Deploy**.

### 7.2 Deploying to Render / Railway / AWS ECS (Monolithic Container / Node Server)
1. Set the Start Command to: `npm start`
2. Set the Build Command to: `npm run build`
3. Supply the environment variables in the service dashboard.
4. Set Node version to `20.x`.

---

## 8. Common Troubleshooting

| Issue | Cause | Resolution |
| :--- | :--- | :--- |
| `MongooseServerSelectionError: connect ECONNREFUSED` | MongoDB is not running locally. | Start local MongoDB service via `mongod` or update `MONGODB_URI` to MongoDB Atlas. |
| `Access Restricted: Institutional domain required` | Logged in with a personal email (`@gmail.com`). | Use student emails ending in `@mit.ac.in` or `@miet.ac.in`. |
| `Duplicate Batch Code Error` | A batch with the same code already exists. | Batch codes are globally unique; change the code or allow the system to auto-generate. |
| `Sync Timeout` | External platform rate limit or slow response. | The sync engine automatically falls back to internal problem caches. Click **"Sync Now"** again. |
