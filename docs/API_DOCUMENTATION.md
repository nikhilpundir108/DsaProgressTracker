# DSATrack — API Documentation Reference

All API routes in DSATrack are standard Next.js Route Handlers located under `/src/app/api/`. They communicate via JSON and handle authentication using HttpOnly JWT cookies (`dsatrack_token`).

---

## 🔒 Authentication & Headers

### Authentication Mechanism
Requests authenticate via an `HttpOnly` cookie named `dsatrack_token` set upon login. When calling APIs programmatically or in testing, pass the cookie or the standard `Authorization` header:

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Standard Response Format
All successful responses return JSON:
```json
{
  "success": true,
  "data": { ... }
}
```

All error responses return:
```json
{
  "success": false,
  "error": "Human readable error description"
}
```

---

## 1. Authentication APIs

### 1.1 `POST /api/auth/login`
Authenticates a Super Admin or Instructor using Identifier (Email or Instructor ID) and Password.

* **Access**: Public
* **Request Body**:
```json
{
  "identifier": "INS001",
  "password": "password123",
  "role": "INSTRUCTOR"
}
```
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "user": {
    "id": "66fb10b248a31e8c0b291a11",
    "name": "Prof. Rahul Sharma",
    "email": "rahul@mit.ac.in",
    "role": "INSTRUCTOR",
    "instructorId": "INS001",
    "department": "Computer Science & Engineering"
  }
}
```
* **Error Responses**:
  * `400 Bad Request`: Missing identifier or password.
  * `401 Unauthorized`: Invalid credentials.
  * `403 Forbidden`: Account is disabled (`isActive: false`).

---

### 1.2 `POST /api/auth/google`
Authenticates a student via Google OAuth. Enforces institutional domain restriction (`@mit.ac.in` or `@miet.ac.in`).

* **Access**: Public
* **Request Body**:
```json
{
  "email": "nikhil@mit.ac.in",
  "name": "Nikhil Sharma",
  "googleId": "google_oauth_1234567890",
  "avatar": "https://lh3.googleusercontent.com/..."
}
```
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "user": {
    "id": "66fb10b248a31e8c0b291a22",
    "name": "Nikhil Sharma",
    "email": "nikhil@mit.ac.in",
    "role": "STUDENT",
    "isProfileComplete": true,
    "collegeRollNo": "2022CSE042"
  }
}
```
* **Error Responses**:
  * `403 Forbidden`: Email domain is not `@mit.ac.in` or `@miet.ac.in`.

---

### 1.3 `GET /api/auth/me`
Fetches the currently authenticated user's session profile.

* **Access**: Authenticated (`SUPER_ADMIN`, `INSTRUCTOR`, `STUDENT`)
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "user": {
    "id": "66fb10b248a31e8c0b291a22",
    "name": "Nikhil Sharma",
    "email": "nikhil@mit.ac.in",
    "role": "STUDENT",
    "leetcodeHandle": "nikhil_dsa",
    "gfgHandle": "nikhil_code",
    "isProfileComplete": true
  }
}
```

---

### 1.4 `POST /api/auth/logout`
Clears the `dsatrack_token` session cookie.

* **Access**: Public / Authenticated
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 1.5 `POST /api/auth/change-password`
Changes the password for the current authenticated user.

* **Access**: Authenticated (`SUPER_ADMIN`, `INSTRUCTOR`)
* **Request Body**:
```json
{
  "currentPassword": "password123",
  "newPassword": "newSecurePassword456"
}
```
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 2. Super Admin APIs

### 2.1 `GET /api/admin/stats`
Returns system-wide aggregated metrics.

* **Access**: `SUPER_ADMIN`
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "stats": {
    "totalInstructors": 4,
    "activeInstructors": 4,
    "inactiveInstructors": 0,
    "totalBatches": 3,
    "totalStudents": 112,
    "totalAssignments": 24,
    "totalQuestions": 180
  }
}
```

---

### 2.2 `GET /api/admin/instructors`
Lists all instructor accounts with batch counts and status.

* **Access**: `SUPER_ADMIN`
* **Query Parameters**: `?search=rahul&status=active` (optional)
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "instructors": [
    {
      "id": "66fb10b248a31e8c0b291a11",
      "name": "Prof. Rahul Sharma",
      "instructorId": "INS001",
      "email": "rahul@mit.ac.in",
      "department": "Computer Science & Engineering",
      "phone": "+91 98765 43210",
      "batchCount": 2,
      "studentCount": 80,
      "isActive": true,
      "createdAt": "2026-09-01T10:00:00.000Z"
    }
  ]
}
```

---

### 2.3 `POST /api/admin/instructors`
Creates a new Instructor account with an auto-generated Instructor ID.

* **Access**: `SUPER_ADMIN`
* **Request Body**:
```json
{
  "name": "Dr. Vikas Verma",
  "email": "vikas@mit.ac.in",
  "department": "Information Technology",
  "phone": "+91 91234 56789",
  "password": "initialPassword123"
}
```
* **Success Response (201 Created)**:
```json
{
  "success": true,
  "instructor": {
    "id": "66fb10b248a31e8c0b291a99",
    "name": "Dr. Vikas Verma",
    "instructorId": "INS003",
    "email": "vikas@mit.ac.in",
    "department": "Information Technology",
    "isActive": true
  }
}
```

---

### 2.4 `PUT /api/admin/instructors/[id]`
Updates instructor details, resets passwords, or toggles active status.

* **Access**: `SUPER_ADMIN`
* **Request Body** (Partial updates supported):
```json
{
  "name": "Dr. Vikas Verma",
  "department": "CSE & AI",
  "isActive": false,
  "newPassword": "newTemporaryPassword"
}
```
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Instructor updated successfully"
}
```

---

## 3. Batch Management APIs

### 3.1 `GET /api/batches`
Fetches batches accessible to the caller (Instructors see their created batches; Students see their enrolled batches).

* **Access**: `INSTRUCTOR`, `STUDENT`, `SUPER_ADMIN`
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "batches": [
    {
      "id": "66fb10b248a31e8c0b291b01",
      "name": "CSE DSA 2026",
      "code": "DSA-CSE-A26",
      "branch": "CSE",
      "section": "A",
      "academicYear": 2026,
      "studentCount": 42,
      "assignmentCount": 8,
      "pendingRequests": 2
    }
  ]
}
```

---

### 3.2 `POST /api/batches`
Creates a new batch and auto-generates a unique Batch Code.

* **Access**: `INSTRUCTOR`
* **Request Body**:
```json
{
  "name": "CSE DSA 2026",
  "branch": "CSE",
  "section": "A",
  "academicYear": 2026,
  "description": "3rd Year Data Structures & Algorithms Core Lab"
}
```
* **Success Response (201 Created)**:
```json
{
  "success": true,
  "batch": {
    "id": "66fb10b248a31e8c0b291b01",
    "name": "CSE DSA 2026",
    "code": "DSA-CSE-A26",
    "branch": "CSE",
    "section": "A",
    "academicYear": 2026
  }
}
```

---

### 3.3 `GET /api/batches/[id]`
Retrieves full batch details, stats, students list, and pending join requests.

* **Access**: `INSTRUCTOR` (owner), `STUDENT` (if enrolled), `SUPER_ADMIN`
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "batch": {
    "id": "66fb10b248a31e8c0b291b01",
    "name": "CSE DSA 2026",
    "code": "DSA-CSE-A26",
    "branch": "CSE",
    "section": "A",
    "academicYear": 2026,
    "students": [
      {
        "id": "66fb10b248a31e8c0b291a22",
        "name": "Nikhil Sharma",
        "email": "nikhil@mit.ac.in",
        "collegeRollNo": "2022CSE042",
        "leetcodeSolved": 125,
        "gfgSolved": 180
      }
    ]
  }
}
```

---

### 3.4 `GET /api/batches/[id]/requests` & `PATCH /api/batches/[id]/requests`
Manages batch join requests.

* **`GET` Access**: `INSTRUCTOR` (owner)
* **`PATCH` Request Body**:
```json
{
  "requestId": "66fb10b248a31e8c0b291c55",
  "action": "APPROVE"
}
```
*(Action can be `"APPROVE"` or `"REJECT"`)*

* **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Student join request approved successfully"
}
```

---

### 3.5 `GET /api/batches/[id]/progress`
Returns comprehensive progress metrics for all enrolled students in a batch.

* **Access**: `INSTRUCTOR` (owner), `SUPER_ADMIN`
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "batchStats": {
    "totalStudents": 42,
    "totalAssignments": 8,
    "totalQuestions": 80,
    "overallProgress": 76.5
  },
  "students": [
    {
      "id": "66fb10b248a31e8c0b291a22",
      "name": "Rahul Kumar",
      "email": "rahul@mit.ac.in",
      "lcSolved": 125,
      "gfgSolved": 180,
      "assigned": 40,
      "completed": 38,
      "pending": 2,
      "progressPercentage": 95
    }
  ]
}
```

---

### 3.6 `GET /api/batches/[id]/leaderboard`
Returns the ranked batch leaderboard based on solved questions and assignment progress.

* **Access**: `INSTRUCTOR` (owner), `STUDENT` (enrolled), `SUPER_ADMIN`
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "leaderboard": [
    {
      "rank": 1,
      "studentId": "66fb10b248a31e8c0b291a22",
      "name": "Rahul Kumar",
      "lcSolved": 125,
      "gfgSolved": 180,
      "totalSolved": 305,
      "assignmentCompletion": 95,
      "score": 495
    }
  ]
}
```

---

## 4. Assignment & Problem Management APIs

### 4.1 `POST /api/batches/[id]/assignments`
Creates a new assignment with curated questions and assigns it to the entire batch.

* **Access**: `INSTRUCTOR` (owner)
* **Request Body**:
```json
{
  "title": "Array Practice — Week 1",
  "description": "Solve two-pointer and sliding window foundation problems",
  "deadline": "2026-10-10T23:59:59.000Z",
  "questions": [
    {
      "title": "Two Sum",
      "platform": "LEETCODE",
      "url": "https://leetcode.com/problems/two-sum/",
      "slug": "two-sum",
      "difficulty": "Easy",
      "topic": "Array"
    },
    {
      "title": "Binary Search",
      "platform": "LEETCODE",
      "url": "https://leetcode.com/problems/binary-search/",
      "slug": "binary-search",
      "difficulty": "Easy",
      "topic": "Binary Search"
    }
  ]
}
```
* **Success Response (201 Created)**:
```json
{
  "success": true,
  "assignment": {
    "id": "66fb10b248a31e8c0b291d01",
    "title": "Array Practice — Week 1",
    "batchId": "66fb10b248a31e8c0b291b01",
    "questionCount": 2,
    "deadline": "2026-10-10T23:59:59.000Z"
  }
}
```

---

### 4.2 `GET /api/assignments/[id]`
Retrieves detailed assignment information and the current student's completion status per question.

* **Access**: Authenticated
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "assignment": {
    "id": "66fb10b248a31e8c0b291d01",
    "title": "Array Practice — Week 1",
    "deadline": "2026-10-10T23:59:59.000Z",
    "totalQuestions": 10,
    "completedQuestions": 6,
    "questions": [
      {
        "id": "q1",
        "title": "Two Sum",
        "platform": "LEETCODE",
        "url": "https://leetcode.com/problems/two-sum/",
        "difficulty": "Easy",
        "topic": "Array",
        "status": "COMPLETED",
        "solvedAt": "2026-10-02T14:30:00.000Z"
      },
      {
        "id": "q2",
        "title": "Product of Array Except Self",
        "platform": "LEETCODE",
        "url": "https://leetcode.com/problems/product-of-array-except-self/",
        "difficulty": "Medium",
        "topic": "Array",
        "status": "PENDING",
        "solvedAt": null
      }
    ]
  }
}
```

---

## 5. Student & Synchronization APIs

### 5.1 `POST /api/student/join-batch`
Submits a batch code to request enrollment into a batch.

* **Access**: `STUDENT`
* **Request Body**:
```json
{
  "code": "DSA-CSE-A26"
}
```
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "status": "PENDING",
  "message": "Join request sent to instructor for approval"
}
```

---

### 5.2 `POST /api/student/sync`
Triggers synchronization of LeetCode and GeeksforGeeks data and recalculates assignment submission statuses.

* **Access**: `STUDENT` (syncs self) or `INSTRUCTOR` (syncs studentId in body)
* **Request Body** (optional):
```json
{
  "studentId": "66fb10b248a31e8c0b291a22"
}
```
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Progress synchronized successfully",
  "stats": {
    "leetcodeSolved": 125,
    "gfgSolved": 180,
    "assignmentsUpdated": 3,
    "lastSyncedAt": "2026-10-04T15:30:00.000Z"
  }
}
```

---

### 5.3 `POST /api/student/verify-handle`
Verifies a LeetCode or GFG username before saving it to the student profile.

* **Access**: `STUDENT`
* **Request Body**:
```json
{
  "platform": "LEETCODE",
  "handle": "nikhil_dsa"
}
```
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "valid": true,
  "data": {
    "totalSolved": 125,
    "easySolved": 65,
    "mediumSolved": 48,
    "hardSolved": 12,
    "ranking": 45120
  }
}
```

---

### 5.4 `GET /api/students/[id]`
Returns individual student deep analytics, solve counts, and per-assignment progress.

* **Access**: `INSTRUCTOR`, `SUPER_ADMIN`, or the `STUDENT` themselves
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "student": {
    "id": "66fb10b248a31e8c0b291a22",
    "name": "Nikhil Sharma",
    "email": "nikhil@mit.ac.in",
    "collegeRollNo": "2022CSE042",
    "leetcodeStats": {
      "totalSolved": 125,
      "easySolved": 65,
      "mediumSolved": 48,
      "hardSolved": 12,
      "ranking": 45120
    },
    "gfgStats": {
      "totalSolved": 180,
      "codingScore": 1240
    },
    "assignments": [
      {
        "title": "Array Practice — Week 1",
        "completed": 10,
        "total": 10
      },
      {
        "title": "String Practice — Week 2",
        "completed": 8,
        "total": 10
      }
    ],
    "overall": {
      "totalAssigned": 40,
      "completed": 30,
      "pending": 10,
      "progressPercentage": 75
    }
  }
}
```
