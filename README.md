
# TutorHub v2.0

## 1. Implemented Features

This initial version focuses on establishing the frontend foundation and user interface.

### Tech Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **UI Components**: ShadCN UI
- **Styling**: Tailwind CSS
- **AI**: Genkit
- **Backend**: Firebase (Authentication, Firestore, Storage)

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
*   **Scalable Multi-Tenancy**: All data will be partitioned by an `organizationId`. A top-level `organizations` collection in Firestore will be the root. This ensures strict data security and privacy between different tutoring businesses.
*   **Unified Identity & Security**: We will leverage **Firebase Authentication** for secure user management, including third-party providers like Google. A central `users` collection will store profile metadata, associated with an organization. All data access will be governed by strict Firestore Security Rules.
*   **Real-Time Data Flow**: We will use Firestore's real-time snapshot listeners. When an admin updates a class, it will reflect instantly on the teacher's and student's dashboards without a page refresh.
*   **Integrated File Management**: We will use **Firebase Storage** for assignment submissions. It integrates seamlessly with Firebase Authentication and its security rules, allowing for secure file access.
*   **Generative AI**: **Genkit** with Google's Gemini models will power intelligent features, such as smart scheduling and automated summaries.
*   **Infrastructure**: The entire application is hosted on **Firebase App Hosting**, providing a scalable, serverless foundation that we don't have to manage manually.

### Part 3: Deep Dive - User Roles & Workflows

#### 1. SuperAdmin (The Platform Owner)
*   **Persona**: The owner of the TutorHub platform.
*   **Goal**: To manage the entire ecosystem of tutoring organizations.
*   **UI/Dashboard**: A top-level dashboard showing platform-wide metrics: total active organizations, total active users, platform-wide revenue analytics, and system health status.
*   **Key Workflows**:
    *   **Tenant Management**: Onboard new organizations, suspend, or deactivate them.
    *   **Organization Admin Assignment**: Designate a user within a new organization as the `OrganizationAdmin`.
    *   **System Configuration**: Manage platform-wide settings or feature flags.
    *   **Support & Troubleshooting**: View system-wide audit logs. A critical feature will be the ability to "Impersonate" an `OrganizationAdmin` to see the application exactly as they see it for rapid support, likely handled via Firebase custom claims.

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
    *   **Availability Management**: Set their weekly availability and one-off overrides in a UI planner.
    *   **Lesson Planning & Grading**: Create lesson plans and grade student submissions (including file uploads/downloads).
    *   **Communication**: Message with students (with parent supervision) and message privately with parents.
    *   **Session Management**: Participate in the "Smart Rescheduling" workflow.

#### 5. Student
*   **Persona**: A learner receiving tutoring.
*   **Goal**: To learn, attend classes, submit work, and communicate with their teacher.
*   **UI/Dashboard**: A clean, academic-focused view showing their agenda, assignments, and schedule. No financial information is present.
*   **Key Workflows**:
    *   **Assignment Submission**: View assignments and upload work.
    *   **Session Management**: Initiate "Smart Rescheduling" requests by marking desired slots in a planner.
    *   **Communication**: Message their teacher (with their parent automatically included).

#### 6. Parent (The Financial & Support Hub)
*   **Persona**: The parent or guardian of a student.
*   **Goal**: To have a clear, transparent view of their child's progress and manage all financial aspects.
*   **UI/Dashboard**: A dedicated portal with a switcher to select between children if they have multiple.
*   **Key Workflows**:
    *   **Financial Management**: View and pay invoices, add funds to a credit balance, and view transaction history.
    *   **Academic Oversight (Read-Only)**: View the selected child's schedule, grades, and attendance.
    *   **Communication**: Automatically included in all teacher-student conversations. Ability to initiate a private, one-on-one conversation with a teacher.

## 3. Development Plan: Role-Based Sprints

We will build the application iteratively, focusing on one user role at a time. Each "sprint" will deliver the core pages and UI for a specific role.

### Sprint 0: Foundation & Setup (Complete)
- **Status**: ✅ Done
- **Objective**: Establish the core project structure, UI framework, and initial static pages.

### Sprint 1: OrganizationAdmin
- **Status**: ⏳ To Do
- **Objective**: Build the core management features for the organization owner.
- **Features**:
    1.  **Organization Settings Page**: Create the UI for managing billing policies and default rates.
    2.  **User Management Page**: Build the UI to view, add, and edit users (`Admin`, `Teacher`, `Student`, `Parent`).
    3.  **Course Management Page**: Create a page to define subjects and courses.
    4.  **Dashboard View**: Tailor the existing dashboard to show organization-wide metrics.

### Sprint 2: Teacher
- **Status**: ⏳ To Do
- **Objective**: Create the tools tutors need to manage their work.
- **Features**:
    1.  **Teacher Dashboard**: A personalized view showing "Today's Agenda" and assigned students.
    2.  **Availability Page**: A UI planner for teachers to set their weekly availability and overrides.
    3.  **Lesson & Grading Page**: UI to create lesson plans and view student submissions.
    4.  **Communication Interface**: A basic messaging UI for communicating with students and parents.

### Sprint 3: Student
- **Status**: ⏳ To Do
- **Objective**: Build the student-facing academic portal.
- **Features**:
    1.  **Student Dashboard**: A simplified view of their schedule and upcoming assignments.
    2.  **Assignment Submission Page**: A page to view assignment details and upload files.
    3.  **"Smart Reschedule" Request UI**: A planner view for students to request new session times.

### Sprint 4: Parent
- **Status**: ⏳ To Do
- **Objective**: Create the parent portal for financial and academic oversight.
- **Features**:
    1.  **Parent Dashboard**: A portal to view/pay invoices, manage credit balance, and see transaction history.
    2.  **Child View**: A read-only view of their child's schedule, grades, and attendance.
    3.  **Communication View**: A unified inbox to see supervised conversations and message teachers directly.

### Sprint 5: Admin
- **Status**: ⏳ To Do
- **Objective**: Build the operational "Command Center" for day-to-day tasks.
- **Features**:
    1.  **Master Schedule Page**: A comprehensive schedule viewer for all organization sessions.
    2.  **Lead Management Page**: A UI to manage and convert leads.
    3.  **Financials Page**: UI for generating invoices, logging payments, and managing balances.

### Sprint 6: SuperAdmin
- **Status**: ⏳ To Do
- **Objective**: Build the platform-level management tools.
- **Features**:
    1.  **SuperAdmin Dashboard**: A top-level view of all organizations and platform metrics.
    2.  **Tenant Management Page**: UI to onboard, suspend, and manage organizations.

### Post-Sprints: Backend Integration
- **Objective**: Connect all the UI we've built to the Firebase backend. This will be an ongoing process throughout the sprints, but we'll have a dedicated phase to ensure everything is wired up, secure, and working end-to-end.

## 4. Changelog

This section documents the major milestones and feature integrations that have made the application functional and secure.

### Authentication & Authorization (Live)
- **Firebase Authentication**: Fully integrated email/password authentication. The login page (`/`) is now a functional, secure entry point using Firebase.
- **Protected Routes**: The entire `/dashboard` area is now protected. Unauthenticated users are automatically redirected to the login page.
- **Role-Based Navigation**: The dashboard sidebar is now dynamic. It fetches the logged-in user's role from their Firestore profile (`/users/{uid}`) and displays only the navigation links relevant to that role.
- **Role-Based Redirects**: After logging in, users are automatically redirected to the correct starting page based on their assigned role (e.g., an `OrganizationAdmin` goes to `/dashboard`, a `Teacher` to `/dashboard/teacher`).
- **Real User Data**: The sidebar header and user menu now display the name and email of the actual logged-in user.
- **Logout Functionality**: The logout button in the user dropdown menu is fully functional and securely signs the user out.

### Firestore Integration & Live Data
- **Multi-Tenant Data Model**: The Firestore data model has been updated to reflect a multi-tenant architecture, with public user profiles stored under `/tenants/{tenantId}/users/{userId}`.
- **Live Data on User Management Page**: The User Management page (`/dashboard/users`) now fetches and displays a live list of users from the Firestore database, replacing the previous mock data.
- **Live Data on Leads Page**: The Lead Management page (`/dashboard/leads`) is now connected to Firestore and displays real-time lead data.
- **Live Data on Main Dashboard**: The main dashboard cards (Total Students, Active Students, Leads) now calculate and display live metrics based on data from Firestore.
- **On-Demand Data Seeding**: The initial "chicken-and-egg" problem of user creation has been solved with a robust, explicit seeding process. A "Seed Database" button now appears on the User Management page, allowing an admin to safely populate all necessary collections with a comprehensive set of sample data in one click.

### Security
- **Secure Firestore Rules**: The application now has a secure set of Firestore rules that enforce a multi-tenant security model. Data is protected, ensuring that users can only access data appropriate for their role and organization.

## 5. Development Log & Challenges

This section tracks the iterative process and debugging journey of the application's development.

### Challenge 1: Initial User Authentication and Data Seeding
- **Problem**: There was no initial user to log in with, and Firestore collections for `users` and `tenants` did not exist. This created a "chicken-and-egg" scenario where a login was required to create data, but no login was possible without data.
- **Attempt 1 (Failed)**: The initial strategy was to create a user "on-the-fly" during the login process. This failed because modern Firebase Auth SDKs bundle "user not found" into a generic `auth/invalid-credential` error, making it impossible to reliably trigger a creation flow.
- **Attempt 2 (Failed)**: Subsequent attempts involved creating isolated, temporary pages for user creation. These also failed due to complexities in the Next.js routing and layout structure, which continued to trigger Firestore read attempts before the creation page could be accessed, resulting in permission errors.
- **Final Solution (Success)**: A robust, multi-step solution was implemented.
  1.  **Temporarily Open Rules**: The `firestore.rules` were temporarily set to `allow read, write: if true;`, removing all permission barriers.
  2.  **Explicit Seeding Button**: A "Seed Database" button was added to the `/dashboard/users` page, visible to the initial admin user.
  3.  **Comprehensive Seed Script**: A `seedAllData` function was created to perform a batch write that populates all necessary collections (`tenants`, `users`, `subjects`, `courses`, `leads`, etc.) in a single, atomic operation.
  4.  **Secure and Finalize**: After the initial data was successfully seeded, the Firestore rules were secured, the temporary seeding UI was cleaned up, and the application was connected to the live data.
- **Status**: ✅ **Success**. This provided a clean, predictable, and user-controlled way to initialize the database, resolving the core problem cleanly and reliably.

### Challenge 2: Minor UI & React Warnings
- **Problem**: The browser console showed React warnings related to missing `key` props in list renderings and usage of a deprecated `legacyBehavior` prop in Next.js `Link` components.
- **Solution**: These were straightforward fixes.
  1.  A unique `key` was added to the fragment in the `Breadcrumb` component's mapping logic.
  2.  The `legacyBehavior` prop was removed from the `Link` components in the `DashboardSidebar`, adopting the modern usage pattern.
- **Status**: ✅ **Success**. The console warnings have been resolved.
