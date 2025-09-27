
# TutorHub v2.0

## 1. The Strategic Blueprint

### Part 1: The Vision & The "Why"
Our mission is to build a premier, multi-tenant tutoring platform that solves the most common frustrations for solo tutors, growing organizations, and the families they serve.

**Common Industry Pain Points We Will Solve:**
*   **Administrative Overload**: Tutors spend more time on billing, scheduling, and reminders than on teaching. **Our Solution**: Intelligent automation for scheduling, invoicing, and communication, with organization-specific business rules.
*   **Disconnected Communication**: Parents are often out of the loop, leading to confusion about progress and payments. **Our Solution**: A dedicated Parent Portal that serves as a single source of truth for financials and provides a supervised window into academic communication.
*   **Inflexible Systems**: Most platforms are rigid. They don't scale from a single tutor to a small school or handle flexible pricing. **Our Solution**: A true multi-tenant architecture with customizable roles, granular permissions, and organization-level settings.
*   **Poor User Experience**: Many LMS platforms are clunky and complicated. **Our Solution**: A clean, intuitive, and role-specific UI for every user, ensuring they only see what they need to see to perform their job effectively.

### Part 2: The Architectural Pillars
*   **Scalable Multi-Tenancy**: All data will be partitioned by an `organizationId`. A top-level `organizations` collection in Firestore will be the root. This ensures strict data security and privacy between different tutoring businesses.
*   **Unified Identity & Security**: We will leverage **Firebase Authentication** for secure user management. A central `users` collection will store profile metadata, including a flexible `roles` array to support users with multiple responsibilities. All data access will be governed by strict Firestore Security Rules.
*   **Real-Time Data Flow**: We will use Firestore's real-time snapshot listeners. When an admin updates a class, it will reflect instantly on the teacher's and student's dashboards without a page refresh.
*   **Integrated File Management**: We will use **Firebase Storage** for assignment submissions. It integrates seamlessly with Firebase Authentication and its security rules, allowing for secure file access.
*   **Generative AI**: **Genkit** with Google's Gemini models will power intelligent features, such as smart scheduling and automated summaries.
*   **Infrastructure**: The entire application is hosted on **Firebase App Hosting**, providing a scalable, serverless foundation that we don't have to manage manually.

## 2. Development Plan: Role-Based Sprints

We will build the application iteratively, focusing on one user role at a time. Each "sprint" will deliver the core pages and UI for a specific role.

### Sprint 0: Foundation & Live Data (Complete)
- **Status**: ✅ Complete
- **Objective**: Establish the core project structure, UI framework, authentication, security, and connect initial pages to a live, seeded Firestore database.
- **Key Outcomes**:
    - Project setup with Next.js, ShadCN, and Tailwind.
    - Full implementation of Firebase email/password authentication.
    - Protected routes for the entire `/dashboard` area.
    - **Multi-Role Architecture**: User profiles updated to support an array of roles (e.g., `roles: ['Admin', 'Teacher']`).
    - **Role-Based Navigation**: The dashboard sidebar is now fully dynamic. It fetches the logged-in user's roles and displays only the navigation links relevant to them.
    - Role-based redirects are in place.
    - **Live Data on All Dashboards**: All mock data has been removed. The Main, Teacher, and Student dashboards are all connected to and display live data from Firestore.
    - **Robust Data Seeding**: A safe, isolated seeding page (`/seed`) allows for the reliable population of the database with a comprehensive, clean set of sample data for all collections.
    - Secure, multi-tenant Firestore security rules are in place.

### Sprint 1: OrganizationAdmin Core Functionality (Complete)
- **Status**: ✅ Complete
- **Objective**: Build the essential management features for the organization owner, enabling them to configure their business and manage users and courses.
- **Features**:
    1.  **Activate Settings Page**: ✅ Connected the Organization Settings UI to Firestore to allow fetching and updating of billing policies, default rates, etc.
    2.  **Implement "Add/Edit User"**: ✅ Built the "Add User" feature (dialog, auth creation, Firestore writes) and "Edit User" (dialog to modify a user's roles and status).
    3.  **Build Course Management UI**: ✅ Created the interface for viewing, adding, and managing subjects and courses within the organization.
    4.  **Connect Leads Page**: ✅ The lead management page is now connected to live Firestore data.
    5.  **Implement Toasts**: ✅ Added toast notifications for all create, update, and delete operations to provide user feedback.

### Sprint 2: Teacher Enablement (Complete)
- **Status**: ✅ Complete
- **Objective**: Create the tools tutors need to manage their daily work and interact with students.
- **Features**:
    1.  **Availability Management**: ✅ Built the UI planner for teachers to set their weekly availability. Data is saved to and fetched from Firestore.
    2.  **Communication Interface**: ✅ Implemented a static UI for teachers to communicate with students and parents, now connected to live Firestore data.

### Sprint 3: Student & Parent Experience (Complete)
- **Status**: ✅ Complete
- **Objective**: Build the student-facing academic portal and the parent financial portal.
- **Features**:
    1.  **Assignment Submission**: ✅ Created a page where students can view assignment details and upload their work to Firebase Storage. The UI is connected to Firestore and the upload functionality is fully implemented.
    2.  **Parent Financials**: ✅ Built the UI for parents to view invoices and transaction history, connected to live Firestore data.

### Sprint 4: Advanced Features & SuperAdmin (Complete)
- **Status**: ✅ Complete
- **Objective**: Implement platform-level tools and intelligent features.
- **Features**:
    1.  **SuperAdmin Tenant Management**: ✅ Built the UI for the SuperAdmin to view and manage all organizations on the platform.
    2.  **AI-Powered Summaries**: ✅ Integrated Genkit to create a text summarization flow and exposed it in the admin dashboard.
    3.  **Smart Scheduling**: ✅ Used Genkit and a custom tool to analyze teacher availability and student requests to suggest optimal session times. The feature is fully integrated into the student dashboard.

## 3. Strategic Review & Go-Forward Plan

This section outlines a high-level strategic review, establishing a clear path forward for building an enterprise-grade application.

### 1. Database & Architecture
*   **Current Strength:** The multi-tenant data model in Firestore (`/tenants/{tenantId}/...`) is a robust and scalable foundation. The user model now supports a `roles` array, allowing for flexible, multi-role assignments. The session and assignment data models have been refactored for improved security by using per-user subcollections.
*   **Identified Weakness:** The current Firestore Security Rules are temporarily open for development. They are not yet suitable for a production environment.
*   **Go-Forward Plan:** **Role-Based Access Control (RBAC)** must be implemented in `firestore.rules` before going live. For example, only users with the `OrganizationAdmin` or `Admin` role should be permitted to `list` documents in the `/tenants/{tenantId}/users` collection. This will be addressed in a dedicated "hardening" sprint.

### 2. UI/UX & Feature Parity
*   **Current Strength:** The use of a modern component library (ShadCN) provides a professional and consistent look and feel. The application UI is now almost entirely data-driven. Key administrative C.R.U.D. actions like adding and editing users are now implemented.
*   **Identified Weakness:** While "Add" and "Edit" are functional, "Delete" operations and more advanced management features are still missing for most data types (e.g., courses, leads).
*   **Go-Forward Plan:** Future sprints will progressively add more C.R.U.D. capabilities as needed by each user role.

### 3. Development & Testing
*   **Current Strength:** The project has a robust and isolated data seeding script (`/lib/seed.ts` accessible via the `/seed` page), which is excellent for creating a predictable database state for development and testing. All mock data has been eradicated. The script now correctly populates new data structures like per-user session references, assignments, and conversations.
*   **Go-Forward Plan:** The seed script will be maintained as the single source of truth for initial setup. All components will continue to fetch data exclusively from Firestore.

### 4. Quality Assurance & User Experience
*   **Current Strength:** The application has a clean, well-organized codebase and is now fully data-driven.
*   **Identified Weakness:** There is a lack of immediate user feedback for some data operations. Error reporting has been improved but can be more robust.
*   **Go-Forward Plan:** Continue to implement a consistent feedback mechanism for all data mutations. The `Toast` component will be used to provide non-intrusive notifications for success ("Settings Saved!") and failure ("Error: Could not update user") events, dramatically improving the user experience.

---

This strategic plan will guide our upcoming development sprints, ensuring we are not just adding features, but building a secure, reliable, and user-friendly platform.

## 4. Changelog

This section documents the major milestones and feature integrations that have made the application functional and secure.

### Authentication & Authorization (Live)
- **Firebase Authentication**: Fully integrated email/password authentication. The login page (`/`) is now a functional, secure entry point using Firebase.
- **Protected Routes**: The entire `/dashboard` area is now protected. Unauthenticated users are automatically redirected to the login page.
- **Multi-Role Architecture**: The user data model has been upgraded from a single `role` string to a `roles` array (e.g., `roles: ['Admin', 'Teacher']`). This allows for flexible, enterprise-grade permission structures.
- **Role-Based Navigation**: The dashboard sidebar is now fully dynamic. It reads the logged-in user's roles from their Firestore profile and displays a combined, unique set of navigation links relevant to their responsibilities.
- **Role-Based Redirects**: After logging in, users are automatically redirected to the correct starting page based on their highest-priority role. The routing logic also prevents users from accessing pages they are not authorized to view.
- **Real User Data**: The sidebar header and user menu now display the name and email of the actual logged-in user.
- **Logout Functionality**: The logout button is fully functional and securely signs the user out.

### Firestore Integration & Live Data
- **All Mock Data Removed**: All static and mock data files and references have been completely removed from the project.
- **Live Data on All Dashboards**: The Main Dashboard, Teacher Dashboard, Student Dashboard, Parent Portal, Leads, Courses, and SuperAdmin pages are now all 100% powered by live data from Firestore.
- **Functional Admin Pages**:
    - **User Management**: Admins can now add and edit users directly from the UI. User creation and updates are handled securely on the client-side using batch writes.
    - **Organization Settings**: The settings page is now fully active, allowing admins to fetch and update tenant-level configuration in real-time.
    - **Course Management**: The courses page now displays a live, structured view of all subjects and their associated courses from the database.
- **Teacher Availability**: Teachers can now set and save their weekly availability, with data being written to and read from Firestore.
- **Student & Parent Portals**: The student dashboard displays live assignment and session data. The parent portal displays live invoice and payment data. The full assignment submission workflow is implemented with Firebase Storage.
- **Live SuperAdmin Dashboard**: The SuperAdmin dashboard now displays live platform-wide statistics.
- **On-Demand Data Seeding**: An isolated, safe seeding page has been re-established at `/seed`. This allows an administrator to reliably wipe and populate all necessary collections with a comprehensive set of sample data in one click. The script has been updated to support the latest data models, including per-user session references, assignments, and conversations.

### Security
- **Secure Data Fetching**: Implemented a more secure data model for sessions and assignments by creating per-user subcollections (`sessionsAsStudent`, `sessionsAsTeacher`, `assignments`) to prevent users from being able to query all sensitive data in the system.
- **Secure Firestore Rules (In Progress)**: The application has a secure set of foundational Firestore rules. These will be hardened with full Role-Based Access Control (RBAC) before any production deployment.

### AI Integration
- **Genkit Summarization Flow**: ✅ Created a Genkit flow with a prompt to summarize text using the Gemini model. This flow is now integrated into the main admin dashboard, providing a simple UI to generate summaries.
- **Genkit Smart Scheduling**: ✅ Created a Genkit flow with a custom tool to find open time slots in a teacher's schedule based on a natural language request from a student. This flow is integrated into the student dashboard.
