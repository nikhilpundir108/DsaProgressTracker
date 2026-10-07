# DSATrack — College DSA Progress & Assignment Tracking Platform

DSATrack is a comprehensive full-stack platform built with Next.js 14, MongoDB, and Tailwind CSS for college computer science departments to monitor student progress across LeetCode and GeeksforGeeks.

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd ProgressTracker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Copy [.env.example](file:///.env.example) to `.env` or `.env.local`:
```bash
cp .env.example .env.local
```

Configure your variables:
```env
# Database Connection
MONGODB_URI=mongodb://127.0.0.1:27017/dsatrack

# Authentication Secret
JWT_SECRET=your_jwt_secret_key_here

# Supabase Authentication
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SECRET_KEY=your_supabase_secret_key
SUPER_ADMIN_REGISTRATION_KEY=replace_with_a_long_random_invitation_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Seed sample data (optional)
```bash
npm run seed
```

### 5. Start development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Students can register with an `@mit.ac.in` or `@miet.ac.in` email from the Student Portal. Enable Supabase Auth email confirmation and allow the app's student login URL (for local development, `http://localhost:3000/student/login`) in the Supabase redirect URL settings. The Supabase secret key is used only by server routes and must never be exposed to the browser.

Existing MongoDB users with a stored password are migrated to Supabase on their first successful sign-in. Instructor accounts remain provisioned by an administrator; Super Admin registration requires the invitation key described below.

Super Admin registration is available from the admin login form but requires `SUPER_ADMIN_REGISTRATION_KEY` in the server environment. Keep this invitation key private and share it only with trusted administrators.

---

## 📚 Documentation

For complete architecture, API reference, database schemas, and integration guides, see the [docs/](file:///docs) folder:
- [System Design & Architecture](file:///docs/SYSTEM_DESIGN.md)
- [Data Flow & Flowcharts](file:///docs/DATA_FLOW_AND_FLOWCHARTS.md)
- [API Documentation Reference](file:///docs/API_DOCUMENTATION.md)
- [Database Schema & Data Dictionary](file:///docs/DATABASE_SCHEMA.md)
- [External Platform Integrations](file:///docs/EXTERNAL_INTEGRATIONS.md)
- [Run, Build & Deployment Guide](file:///docs/RUN_AND_BUILD_GUIDE.md)
