# DSATrack — Database Schema & Data Dictionary

DSATrack utilizes **MongoDB** with **Mongoose ODM**. The schema is optimized for fast reads, high-concurrency student analytics queries, and index-backed batch operations.

---

## 1. Schema Overview

```
User (SUPER_ADMIN / INSTRUCTOR / STUDENT)
 │
 ├── (1:N) Batch [as instructorId]
 │          │
 │          ├── (N:M) Students [via students array of ObjectIds]
 │          ├── (1:N) BatchJoinRequest [via batchId & studentId]
 │          └── (1:N) Assignment [via batchId]
 │                     │
 │                     └── (1:N embedded) Questions Array
 │
 └── (1:N) Submission [via studentId, assignmentId, questionId]
```

---

## 2. Collections & Data Models

### 2.1 `User` Collection (`src/lib/models/User.js`)

Stores credentials, profile details, and platform statistics for all three user roles.

| Field | Type | Required | Default | Description / Constraints |
| :--- | :--- | :---: | :---: | :--- |
| `_id` | `ObjectId` | Auto | — | Primary Key |
| `name` | `String` | Yes | — | Full display name (e.g. "Prof. Rahul Sharma") |
| `email` | `String` | Yes | — | Unique, lowercase, indexed. Students restricted to `@mit.ac.in` / `@miet.ac.in` |
| `password` | `String` | No | — | Bcrypt hashed password (required for `INSTRUCTOR` & `SUPER_ADMIN`) |
| `role` | `String` | Yes | `'STUDENT'` | Enum: `['SUPER_ADMIN', 'INSTRUCTOR', 'STUDENT']` |
| `instructorId`| `String` | No | — | Unique, sparse identifier (e.g. `INS001`, `INS002`) |
| `googleId` | `String` | No | — | Google OAuth subject identifier |
| `avatar` | `String` | No | `''` | Profile image URL |
| `phone` | `String` | No | `''` | Contact number |
| `department` | `String` | No | `''` | Academic department (e.g. "Computer Science & Engineering") |
| `collegeRollNo`| `String`| No | `''` | Student roll number (e.g. "2022CSE042") |
| `branch` | `String` | No | `''` | Academic branch (e.g. "CSE", "IT", "ECE") |
| `section` | `String` | No | `''` | Class section (e.g. "A", "B") |
| `graduationYear`| `Number` | No | `null` | Expected year of graduation (e.g. 2026) |
| `leetcodeHandle`| `String`| No | `''` | Public LeetCode username |
| `gfgHandle` | `String` | No | `''` | Public GeeksforGeeks username |
| `leetcodeStats` | `Object` | No | `{}` | Embedded stats `{ totalSolved, easySolved, mediumSolved, hardSolved, ranking, contestRating, lastFetched }` |
| `gfgStats` | `Object` | No | `{}` | Embedded stats `{ totalSolved, easySolved, mediumSolved, hardSolved, codingScore, lastFetched }` |
| `isProfileComplete`| `Boolean`| No| `false` | Set to `true` once student completes profile setup |
| `isActive` | `Boolean` | No | `true` | Account active state (Admin can disable instructors) |
| `createdAt` | `Date` | Auto | `Date.now` | Creation timestamp |
| `updatedAt` | `Date` | Auto | `Date.now` | Last update timestamp |

#### Indexes:
* `{ email: 1 }` (Unique)
* `{ instructorId: 1 }` (Unique, Sparse)
* `{ role: 1 }`
* `{ 'leetcodeStats.totalSolved': -1 }`

---

### 2.2 `Batch` Collection (`src/lib/models/Batch.js`)

Represents a classroom or lab group created by an instructor.

| Field | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `_id` | `ObjectId` | Auto | — | Primary Key |
| `name` | `String` | Yes | — | Batch title (e.g. "CSE DSA 2026") |
| `code` | `String` | Yes | — | Unique, uppercase batch code (e.g. `DSA-CSE-A26`) |
| `branch` | `String` | Yes | — | Branch code (e.g. "CSE") |
| `section` | `String` | Yes | — | Section identifier (e.g. "A") |
| `academicYear`| `Number` | Yes | — | Academic graduating year (e.g. 2026) |
| `description` | `String` | No | `''` | Optional batch description |
| `instructorId`| `ObjectId`| Yes | — | References `User` (`role: 'INSTRUCTOR'`) |
| `students` | `[ObjectId]`| No | `[]` | Array of references to enrolled `User` documents |
| `isArchived` | `Boolean` | No | `false` | Soft archive flag |
| `createdAt` | `Date` | Auto | `Date.now` | Timestamp |
| `updatedAt` | `Date` | Auto | `Date.now` | Timestamp |

#### Indexes:
* `{ code: 1 }` (Unique)
* `{ instructorId: 1 }`
* `{ students: 1 }`

---

### 2.3 `BatchJoinRequest` Collection (`src/lib/models/BatchJoinRequest.js`)

Tracks student requests to enroll in a batch.

| Field | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `_id` | `ObjectId` | Auto | — | Primary Key |
| `studentId` | `ObjectId` | Yes | — | References `User` (`role: 'STUDENT'`) |
| `batchId` | `ObjectId` | Yes | — | References `Batch` |
| `status` | `String` | Yes | `'PENDING'`| Enum: `['PENDING', 'APPROVED', 'REJECTED']` |
| `requestedAt` | `Date` | Auto | `Date.now` | Timestamp when request was submitted |
| `reviewedAt` | `Date` | No | `null` | Timestamp when instructor reviewed |
| `reviewedBy` | `ObjectId` | No | `null` | References `User` (`role: 'INSTRUCTOR'`) |

#### Indexes:
* `{ batchId: 1, studentId: 1 }` (Unique compound index preventing duplicate pending requests)
* `{ batchId: 1, status: 1 }`
* `{ studentId: 1 }`

---

### 2.4 `Assignment` Collection (`src/lib/models/Assignment.js`)

Represents problem sets assigned to an entire batch.

| Field | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `_id` | `ObjectId` | Auto | — | Primary Key |
| `title` | `String` | Yes | — | Assignment name (e.g. "Array Practice — Week 1") |
| `description` | `String` | No | `''` | Instructions or learning objectives |
| `batchId` | `ObjectId` | Yes | — | References `Batch` |
| `instructorId`| `ObjectId`| Yes | — | References `User` (Author) |
| `deadline` | `Date` | Yes | — | Assignment submission deadline |
| `questions` | `[QuestionSchema]`| Yes| `[]` | Embedded subdocuments of assigned problems |
| `createdAt` | `Date` | Auto | `Date.now` | Timestamp |
| `updatedAt` | `Date` | Auto | `Date.now` | Timestamp |

#### Embedded `QuestionSchema`:
```javascript
{
  title: { type: String, required: true },       // e.g. "Two Sum"
  platform: { type: String, enum: ['LEETCODE', 'GFG'], required: true },
  url: { type: String, required: true },         // e.g. "https://leetcode.com/problems/two-sum/"
  slug: { type: String, required: true },        // e.g. "two-sum"
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
  topic: { type: String, default: 'General' }   // e.g. "Array", "Trees"
}
```

#### Indexes:
* `{ batchId: 1 }`
* `{ instructorId: 1 }`
* `{ deadline: 1 }`

---

### 2.5 `Submission` Collection (`src/lib/models/Submission.js`)

Stores the computed completion state of an individual student for a specific assigned question.

| Field | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `_id` | `ObjectId` | Auto | — | Primary Key |
| `studentId` | `ObjectId` | Yes | — | References `User` |
| `assignmentId`| `ObjectId`| Yes | — | References `Assignment` |
| `questionId` | `String` | Yes | — | ID or index key of question within the assignment |
| `platform` | `String` | Yes | — | Enum: `['LEETCODE', 'GFG']` |
| `questionSlug`| `String` | Yes | — | Normalized slug for comparison |
| `status` | `String` | Yes | `'PENDING'`| Enum: `['PENDING', 'COMPLETED', 'LATE']` |
| `solvedAt` | `Date` | No | `null` | Detected solve timestamp on platform |
| `lastCheckedAt`| `Date` | Auto | `Date.now` | Timestamp of last sync verification |

#### Status Logic:
* **`PENDING`**: No matching accepted submission found.
* **`COMPLETED`**: Matching accepted submission found with `solvedAt <= assignment.deadline`.
* **`LATE`**: Matching accepted submission found with `solvedAt > assignment.deadline`.

#### Indexes:
* `{ studentId: 1, assignmentId: 1, questionId: 1 }` (Unique compound index)
* `{ assignmentId: 1, status: 1 }`
* `{ studentId: 1, status: 1 }`
