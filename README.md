# ApexPrep: Dual-Track IELTS & SAT Academic Platform

## Overview
ApexPrep is a standardized exam preparation ecosystem tailored for two distinct tracks: **IELTS Academic** and **Digital SAT**.

Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM (SQLite / PostgreSQL)**.

---

## 4 Dedicated Panel Tiers

1. **Student Panel**:
   - **Central Hub (`/hub`)**: Unified dashboard for dual-enrolled students with a 1-click track switcher.
   - **IELTS Student Portal (`/ielts/student`)**: 4-skill preparation (Listening, Reading, Writing, Speaking) and full mock test simulator (`/ielts/student/exam/[id]`) with split-screen reading and live word counter.
   - **SAT Student Portal (`/sat/student`)**: Math & Reading/Writing modules and Digital SAT exam simulator (`/sat/student/exam/[id]`) with on-screen calculator, formula reference sheet, question flagging, and 400–1600 auto-scoring.
2. **Teacher Panel (`/teacher`)**:
   - **Study Materials (`/teacher/materials`)**: Upload PDF guides, listening audio files, and worksheets with track and module tagging.
   - **Grading Desk (`/teacher/grading`)**: Evaluate IELTS essays with official 4-criteria band rubrics (Task Achievement, Coherence, Lexical, Grammar) and qualitative feedback.
3. **Track Admin Panels**:
   - **IELTS Admin (`/admin/ielts`)**: Faculty roster, mock test management, essay review queues.
   - **SAT Admin (`/admin/sat`)**: Math/RW instructors, test releases, 1600-point benchmarks.
4. **Super Admin Panel (`/super-admin`)**:
   - **Global Dashboard**: Cross-platform analytics and test volume.
   - **User Manager (`/super-admin/users`)**: Searchable directory with live toggles for Roles (`STUDENT`, `TEACHER`, `TRACK_ADMIN`, `SUPER_ADMIN`) and Track Access (`IELTS`, `SAT`, `BOTH`).

---

## Test Accounts & 1-Click Role Testing

Open **[http://localhost:3000/auth/login](http://localhost:3000/auth/login)**. You can click on any persona card or sign in with password `Password123!`:

| Tier | Persona Name | Email | Permissions |
| :--- | :--- | :--- | :--- |
| **Super Admin** | Dr. Alexander Cross | `superadmin@edu.com` | Master control over both IELTS & SAT |
| **Track Admin** | Eleanor Vance | `ielts.admin@edu.com` | IELTS platform lead |
| **Track Admin** | Marcus Holloway | `sat.admin@edu.com` | SAT platform lead |
| **Teacher** | Sarah Jenkins | `ielts.teacher@edu.com` | IELTS examiner (audio/PDF upload & essay grading) |
| **Teacher** | David Chen | `sat.teacher@edu.com` | SAT math specialist |
| **Teacher** | Prof. Rachel Green | `dual.teacher@edu.com` | Dual track teacher (teaches both IELTS & SAT) |
| **Student** | Amina Al-Mansoor | `ielts.student@edu.com` | IELTS-only candidate (Target: Band 8.0) |
| **Student** | Liam O'Connor | `sat.student@edu.com` | SAT-only candidate (Target: 1550) |
| **Student** | Sofia Rodriguez | `dual.student@edu.com` | Dual student (Enrolled in both IELTS & SAT) |

---

## Available Commands

```bash
# Run local development server
npm run dev

# Run database migration / schema push
npm run db:push

# Re-seed database with demo personas and mock tests
npm run db:seed

# Production build check
npm run build
```
