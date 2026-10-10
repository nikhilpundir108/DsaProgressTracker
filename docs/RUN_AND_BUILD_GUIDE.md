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

# Supabase Auth (the secret key must remain server-side)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SECRET_KEY=your_supabase_secret_key

# Public App Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

```

Enable email confirmation in Supabase Auth and add `http://localhost:3000/student/login` to the allowed redirect URLs. For deployment, add the corresponding production student login URL. Student registration is limited to `@mit.ac.in` and `@miet.ac.in`; staff accounts must be created by a Super Admin.

### Supabase Auth Email Delivery

Supabase's built-in email service is for testing: it is limited to 2 emails per hour across the project and only delivers to authorized project team addresses. Signups, instructor creation, password recovery, and other Auth email flows share this service, so an instructor's first request can fail after another flow has already used the quota.

For real users, configure a transactional email provider such as Resend, Brevo, SendGrid, Postmark, or Amazon SES:

1. Verify a sender domain with the provider and publish its SPF/DKIM records.
2. In the Supabase Dashboard, open **Authentication > Emails > SMTP Settings**, enable custom SMTP, and enter the provider's host, port, username, password, and verified sender address/name.
3. Keep email confirmation enabled. In **Authentication > Rate Limits**, raise the email sending limit above its custom-SMTP default of 30 per hour if needed, while staying within the provider's sending quota.
4. Retry instructor creation and check the Supabase Auth logs and provider logs if delivery still fails. Avoid link tracking that rewrites confirmation URLs.

SMTP credentials belong in the Supabase dashboard, not in this app's environment variables. The existing `auth.signUp()` flow will use the configured Supabase SMTP transport; no separate email sender is needed in the application.

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
| **Student** | Nikhil Sharma | `nikhil@mit.ac.in` | Register a password | Enrolled in CSE DSA 2026; high solve count |
| **Student** | Aman Gupta | `aman@mit.ac.in` | Register a password | Enrolled in CSE DSA 2026 |
| **Student** | Priya Patel | `priya@miet.ac.in` | Register a password | Enrolled in CSE DSA 2026 |
| **Student (New Setup)** | Kavya Nair | `kavya@mit.ac.in` | Register a password | Simulates first-time `/student/profile/setup` |

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
