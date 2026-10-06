# DSATrack — Data Flow & Flowcharts

This document provides visual diagrams and Mermaid flowcharts representing all primary data flows, lifecycle states, and interactions within **DSATrack**.

---

## 1. Complete System Flowchart

The high-level end-to-end user and data journey from provisioning down to batch progress analytics:

```mermaid
flowchart TD
    SA([Super Admin]) -->|Creates Account| INS([Instructor])
    INS -->|Generates ID & Password| INS_CREDS[Instructor ID e.g. INS001 & Password]
    INS -->|Logs In| INS_DASH[Instructor Dashboard]
    INS_DASH -->|Creates Batch| BATCH[Batch Created: e.g. CSE DSA 2026<br/>Unique Code: DSA-CSE-A26]
    
    ST([Student]) -->|Logs In with Google| ST_AUTH{Domain Check<br/>@mit.ac.in or @miet.ac.in?}
    ST_AUTH -- No --> REJECT_ST[Show Access Restricted Screen]
    ST_AUTH -- Yes --> ST_PROFILE{Profile Complete?}
    ST_PROFILE -- No --> ST_SETUP[Redirect to /student/profile/setup<br/>Collect Handles & Roll No]
    ST_PROFILE -- Yes --> ST_DASH[Student Dashboard]
    
    ST_DASH -->|Enters Batch Code| JOIN_REQ[BatchJoinRequest Created<br/>Status: PENDING]
    JOIN_REQ -->|Appears in Batch Tab| INS_REVIEW{Instructor Review}
    INS_REVIEW -- Reject --> REJ_STATUS[Request Marked REJECTED]
    INS_REVIEW -- Approve --> APP_STATUS[Request Marked APPROVED<br/>Student added to Batch.students array]
    
    INS_DASH -->|Creates Assignment| ASSIGN[Assignment Created<br/>Problems: Two Sum, Binary Search, etc.]
    ASSIGN -->|Auto-Broadcasts| BATCH_ENROLL[Assigned to Entire Batch]
    
    ST_DASH -->|Opens Assignment| ST_SOLVE[Clicks Open Question<br/>Solves on LeetCode or GFG]
    ST_DASH -->|Clicks Sync Now or Auto-Sync| SYNC_ENG[Sync Engine Triggered]
    
    SYNC_ENG -->|Fetches Stats| TASHIF[Tashif LeetCode API & GFG Scraper]
    TASHIF -->|Matches Slug & Timestamp| SUB_UPDATE{Problem Solved?}
    SUB_UPDATE -- Not Solved --> PEND[Status: PENDING]
    SUB_UPDATE -- Solved <= Deadline --> COMP[Status: COMPLETED]
    SUB_UPDATE -- Solved > Deadline --> LATE[Status: LATE]
    
    COMP --> DB_SUB[(Submissions & User Stats Updated)]
    LATE --> DB_SUB
    
    DB_SUB --> ST_PROGRESS[Student Dashboard Progress Updated]
    DB_SUB --> INS_PROGRESS[Instructor Batch Progress & Student Analytics Updated]
    DB_SUB --> LEADERBOARD[Batch Leaderboard Recalculated]
```

---

## 2. Super Admin & Instructor Provisioning Flow

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Super Admin
    participant UI as Admin Dashboard UI
    participant API as /api/admin/instructors
    participant DB as MongoDB (User Collection)

    Admin->>UI: Clicks "+ Create Instructor"
    Admin->>UI: Fills Name, Email, Dept, Password
    UI->>API: POST /api/admin/instructors with payload
    API->>DB: Check if Email or Instructor ID exists
    API->>API: Generate next unique ID (e.g. INS003)
    API->>API: Hash password with bcryptjs (salt=10)
    API->>DB: Save new Instructor document (role: INSTRUCTOR)
    DB-->>API: Document saved
    API-->>UI: Return 201 Created with sanitized Instructor object
    UI-->>Admin: Display Success Card with ID (INS003) & raw password to share
```

---

## 3. Student Domain-Enforced OAuth & Profile Setup Flow

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student
    participant UI as /student/login
    participant API as /api/auth/google
    participant DB as MongoDB (User Collection)

    Student->>UI: Clicks "Continue with Google"
    UI->>API: POST /api/auth/google with email & googleId
    API->>API: Validate email.endsWith('@mit.ac.in') or ('@miet.ac.in')
    alt Invalid Email Domain
        API-->>UI: 403 Forbidden: "Access Restricted: Institutional account required"
        UI-->>Student: Display Access Restricted Banner
    else Valid College Domain
        API->>DB: Find or create student document
        API->>API: Generate JWT session token
        API-->>UI: Set HttpOnly Cookie (dsatrack_token) + user status
        alt Profile Incomplete (missing roll, branch, or handles)
            UI->>Student: Redirect to /student/profile/setup
            Student->>UI: Enters College Roll No, Branch, LeetCode & GFG handle
            UI->>API: PUT /api/student/profile
            API->>DB: Update User (isProfileComplete = true)
            UI->>Student: Redirect to /student/dashboard
        else Profile Already Complete
            UI->>Student: Redirect directly to /student/dashboard
        end
    end
```

---

## 4. Batch Lifecycle & Join Request Approval Flow

```mermaid
stateDiagram-v2
    [*] --> BatchCreated: Instructor creates batch (Code: DSA-CSE-A26)
    
    state StudentAction {
        [*] --> CodeEntered: Student submits batch code
        CodeEntered --> JoinRequestPending: BatchJoinRequest (Status: PENDING)
    }
    
    state InstructorAction {
        JoinRequestPending --> RequestApproved: Instructor clicks [Approve]
        JoinRequestPending --> RequestRejected: Instructor clicks [Reject]
    }
    
    RequestApproved --> StudentEnrolled: Student ID pushed to Batch.students
    StudentEnrolled --> AssignmentAccess: Student gets full access to Batch Assignments
    RequestRejected --> AccessDenied: Request marked REJECTED (Student sees reason)
    AccessDenied --> [*]
    AssignmentAccess --> [*]
```

---

## 5. Platform Data Sync & Problem Matching Flow

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student
    participant Dash as Student Dashboard
    participant API as /api/student/sync
    participant Sync as Sync Engine (sync.js)
    participant Tashif as Tashif API (leetcode-stats.tashif.codes)
    participant GFG as GeeksforGeeks Scraper
    participant DB as MongoDB

    Student->>Dash: Clicks "Sync Now" (or on page load)
    Dash->>API: POST /api/student/sync
    API->>Sync: syncStudentData(studentId)
    
    par Fetch LeetCode
        Sync->>Tashif: GET https://leetcode-stats.tashif.codes/{handle}
        Tashif-->>Sync: Solved Counts (Total, Easy, Med, Hard, Ranking)
        Sync->>Sync: Fetch recent AC submissions & normalize slugs
    and Fetch GFG
        Sync->>GFG: Fetch GFG public profile & solved problems
        GFG-->>Sync: Total Solved, Coding Score, recent problems
    end

    Sync->>DB: Update User (leetcodeStats, gfgStats, lastSyncedAt)
    Sync->>DB: Find active assignments for student's enrolled batches
    
    loop For each assigned question
        Sync->>Sync: Compare question.slug / question.title with solvedSlugs
        alt Question Matched in Solved List
            alt Solved Timestamp <= Assignment Deadline
                Sync->>DB: Upsert Submission (status: 'COMPLETED', solvedAt)
            else Solved Timestamp > Assignment Deadline
                Sync->>DB: Upsert Submission (status: 'LATE', solvedAt)
            end
        else Not Solved
            Sync->>DB: Upsert Submission (status: 'PENDING')
        end
    end

    Sync-->>API: Return sync summary (solvedCount, assignmentsUpdated)
    API-->>Dash: 200 OK + Refreshed Stats
    Dash-->>Student: Update UI badges, progress bars, and stats cards
```

---

## 6. Database Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    USER ||--o{ BATCH : "teaches (as Instructor)"
    USER ||--o{ BATCH_JOIN_REQUEST : "requests to join"
    USER ||--o{ SUBMISSION : "submits"
    BATCH ||--o{ BATCH_JOIN_REQUEST : "receives"
    BATCH ||--o{ ASSIGNMENT : "contains"
    BATCH }o--o{ USER : "enrolls (students array)"
    ASSIGNMENT ||--o{ SUBMISSION : "tracks"

    USER {
        ObjectId _id PK
        String name
        String email UK
        String password
        String role "SUPER_ADMIN | INSTRUCTOR | STUDENT"
        String instructorId UK "e.g. INS001"
        String googleId
        String collegeRollNo
        String branch
        String section
        Number graduationYear
        String leetcodeHandle
        String gfgHandle
        Object leetcodeStats
        Object gfgStats
        Boolean isProfileComplete
        Boolean isActive
        Date createdAt
    }

    BATCH {
        ObjectId _id PK
        String name "e.g. CSE DSA 2026"
        String code UK "e.g. DSA-CSE-A26"
        String branch
        String section
        Number academicYear
        String description
        ObjectId instructorId FK
        Array students "Array of User ObjectIds"
        Boolean isArchived
        Date createdAt
    }

    BATCH_JOIN_REQUEST {
        ObjectId _id PK
        ObjectId studentId FK
        ObjectId batchId FK
        String status "PENDING | APPROVED | REJECTED"
        Date requestedAt
        Date reviewedAt
        ObjectId reviewedBy FK
    }

    ASSIGNMENT {
        ObjectId _id PK
        String title
        String description
        ObjectId batchId FK
        ObjectId instructorId FK
        Date deadline
        Array questions "Embedded Question Subdocuments"
        Date createdAt
    }

    SUBMISSION {
        ObjectId _id PK
        ObjectId studentId FK
        ObjectId assignmentId FK
        String questionId
        String platform "LEETCODE | GFG"
        String questionSlug
        String status "PENDING | COMPLETED | LATE"
        Date solvedAt
        Date lastCheckedAt
    }
```
