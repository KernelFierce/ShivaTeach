# TutorHub v2.0

This is a Next.js starter project for TutorHub, an all-in-one platform for tutoring organizations.

## 1. Implemented Features

This initial version focuses on establishing the frontend foundation and user interface.

### Tech Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **UI Components**: ShadCN UI
- **Styling**: Tailwind CSS
- **AI**: Genkit

### Core UI & Layout
- **Login Page**: A static, un-authenticated entry page located at `/`.
- **Dashboard Layout**: A responsive dashboard layout (`/dashboard`) with a collapsible sidebar and breadcrumb navigation.
- **Component Library**: A rich set of reusable UI components from ShadCN, including Cards, Tables, Buttons, and Charts.

### Feature Pages (Static)
The following pages have been created with a UI structure and use mock data. No backend functionality is implemented yet.
- **Dashboard (`/dashboard`)**: The main landing page after login, showing key metrics (Total Students, Active Students, etc.), a financial overview chart, and a list of upcoming sessions.
- **Student Management (`/dashboard/students`)**: Displays a table of all students with their status and join date. Includes a non-functional "Add Student" button.
- **Schedule (`/dashboard/schedule`)**: Placeholder page for the master schedule.
- **Financials (`/dashboard/financials`)**: Placeholder page for invoices and payments.
- **Analytics (`/dashboard/analytics`)**: Placeholder page for reports and metrics.
- **Settings (`/dashboard/settings`)**: Placeholder page for organization settings.

## 2. The Strategic Blueprint

### Part 1: The Vision & The "Why"
Our mission is to build a premier, multi-tenant tutoring platform that solves the most common frustrations for solo tutors, growing organizations, and the families they serve.

**Common Industry Pain Points We Will Solve:**
*   **Administrative Overload**: Tutors spend more time on billing, scheduling, and reminders than on teaching. **Our Solution**: Intelligent automation for scheduling, invoicing, and communication, with organization-specific business rules.
*   **Disconnected Communication**: Parents are often out of the loop, leading to confusion about progress and payments. **Our Solution**: A dedicated Parent Portal that serves as a single source of truth for financials and provides a supervised window into academic communication.
*   **Inflexible Systems**: Most platforms are rigid. They don't scale from a single tutor to a small school or handle flexible pricing. **Our Solution**: A true multi-tenant architecture with customizable roles, granular permissions, and organization-level settings.
*   **Poor User Experience**: Many LMS platforms are clunky and complicated. **Our Solution**: A clean, intuitive, and role-specific UI for every user, ensuring they only see what they need to see to perform their job effectively.

### Part 2: The Architectural Pillars
*   **Scalable Multi-Tenancy**: An `organizations` table/collection will be the root. All data will be strictly partitioned, ensuring data security and privacy between different tutoring businesses.
*   **Unified Identity & Security**: We will leverage a secure authentication provider (like Firebase Auth) for user management, including third-party providers like Google. A central `users` or `people` collection will store profile metadata. All data access will be governed by strict security rules.
*   **Real-Time Data Flow**: We will use realtime database subscriptions. When an admin updates a class, it will reflect instantly on the teacher's and student's dashboards without a page refresh.
*   **Integrated File Management**: We will use a secure cloud storage solution (like Firebase Storage) for assignment submissions, integrated with our authentication to ensure secure file access.

### Part 3: Deep Dive - User Roles & Workflows

#### 1. SuperAdmin (The Platform Owner)
*   **Persona**: The owner of the TutorHub platform.
*   **Goal**: To manage the entire ecosystem of tutoring organizations.
*   **UI/Dashboard**: A top-level dashboard showing platform-wide metrics: total active organizations, total active users, platform-wide revenue analytics, and system health status.
*   **Key Workflows**:
    *   **Tenant Management**: Onboard new organizations, suspend, or deactivate them.
    *   **Organization Admin Assignment**: Designate a user within a new organization as the `OrganizationAdmin`.
    *   **System Configuration**: Manage platform-wide settings or feature flags.
    *   **Support & Troubleshooting**: View system-wide audit logs. A critical feature will be the ability to "Impersonate" an `OrganizationAdmin` to see the application exactly as they see it for rapid support.

#### 2. OrganizationAdmin (The School Principal)
*   **Persona**: The owner of a specific tutoring company (e.g., "Acme Tutors").
*   **Goal**: To manage their specific organization's staff, students, branding, and business rules.
*   **UI/Dashboard**: An organization-wide dashboard showing their org's total revenue, teacher performance metrics, student enrollment trends, and outstanding payments.
*   **Key Workflows**:
    *   **User Management**: Create, edit, and deactivate `Admin`, `Teacher`, `Student`, and `Parent` accounts within their organization. Link Students to Parents.
    *   **Role Management**: Assign roles to users and promote/demote staff.
    *   **Course & Subject Management**: Define the subjects and courses their organization offers.
    *   **Organization Settings Dashboard**: Configure billing policies, set default hourly rates, and manage branding (logo, colors).

#### 3. Admin (The Day-to-Day Operator)
*   **Persona**: The front-desk staff or operations manager for an organization.
*   **Goal**: To handle all daily logistics: scheduling, lead conversion, invoicing, and support.
*   **UI/Dashboard**: The "Command Center," strictly scoped to their organization.
*   **Key Workflows**:
    *   **Lead Management**: Manage prospects and convert them into active Students.
    *   **Scheduling**: Master schedule view, log completed sessions, schedule new ones.
    *   **Financials**: Generate invoices, log payments, manage student credit balances, and send reminders.
    *   **Support**: Monitor reschedule/cancellation requests.

#### 4. Teacher
*   **Persona**: A tutor within an organization.
*   **Goal**: To teach, plan lessons, grade assignments, and communicate.
*   **UI/Dashboard**: Personalized dashboard focused on "Today's Agenda," their students, and pending assignments.
*   **Key Workflows**:
    *   **Availability Management**: Set their weekly availability and one-off overrides.
    *   **Lesson Planning & Grading**: Create lesson plans and grade student submissions (including file uploads/downloads).
    *   **Communication**: Message with students (with parent supervision) and message privately with parents.
    *   **Session Management**: Participate in the "Smart Rescheduling" workflow.

#### 5. Student
*   **Persona**: A learner receiving tutoring.
*   **Goal**: To learn, attend classes, submit work, and communicate with their teacher.
*   **UI/Dashboard**: A clean, academic-focused view showing their agenda, assignments, and schedule. No financial information is present.
*   **Key Workflows**:
    *   **Assignment Submission**: View assignments and upload work.
    *   **Session Management**: Initiate "Smart Rescheduling" requests.
    *   **Communication**: Message their teacher (with their parent automatically included).

#### 6. Parent (The Financial & Support Hub)
*   **Persona**: The parent or guardian of a student.
*   **Goal**: To have a clear, transparent view of their child's progress and manage all financial aspects.
*   **UI/Dashboard**: A dedicated portal with a switcher to select between children if they have multiple.
*   **Key Workflows**:
    *   **Financial Management**: View and pay invoices, add funds to a credit balance, and view transaction history.
    *   **Academic Oversight (Read-Only)**: View the selected child's schedule, grades, and attendance.
    *   **Communication**: Automatically included in all teacher-student conversations. Ability to initiate a private, one-on-one conversation with a teacher.
