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

## 2. Development Plan: Next Sprints

The following is a proposed plan to build out the functionality of the TutorHub application.

### Sprint 1: Foundational Backend & Authentication

**Goal**: Implement user authentication and connect the application to a live database.

- **User Authentication**:
    - Implement email/password and Google SSO login functionality.
    - Create a secure session management system.
    - Develop user registration and "Forgot Password" flows.
- **Firebase Integration**:
    - Set up a Firebase project and connect it to the application.
    - Configure Firestore as the primary database.
- **Data Modeling**:
    - Define and implement the database schema for `Users`, `Students`, and other core entities.
    - Replace all mock data with live data from Firestore.
- **API Development**:
    - Create initial server actions or API routes for user and student data management.

### Sprint 2: Student Management & Scheduling Core

**Goal**: Build out the core functionality for managing students and their schedules.

- **Student Management**:
    - Implement "Add Student" functionality with a form and validation.
    - Implement "Edit Student" and "View Student Profile" pages.
    - Allow users to change a student's status (Active, Inactive, Lead).
- **Scheduling**:
    - Transform the static schedule page into an interactive calendar.
    - Implement functionality to schedule new tutoring sessions for students.
    - Allow users to view, edit, and cancel existing sessions.
    - Create a system to log attendance for completed sessions.

### Sprint 3: Financials & Analytics

**Goal**: Add financial tracking and basic analytics features.

- **Financials**:
    - Implement invoice generation for tutoring sessions.
    - Create a system to log payments from students/parents.
    - Develop a view to track outstanding balances.
- **Analytics**:
    - Connect the dashboard analytics page to live data.
    - Develop reports for student enrollment, session attendance, and revenue over time.
    - Add filtering capabilities to the analytics dashboard.

### Future Sprints (Backlog)

- **Notifications**: Implement an in-app and email notification system for session reminders, payment due dates, etc.
- **User Roles & Permissions**: Add support for different user roles (Admin, Tutor, Parent) with varying levels of access.
- **Branding & Customization**: Allow organizations to customize the look and feel of their TutorHub instance from the Settings page.
- **AI-Powered Features**:
    - **Performance Insights**: Use AI to analyze student performance data and provide tutors with actionable insights.
    - **Automated Scheduling**: Develop an AI assistant that suggests optimal session times based on tutor and student availability.
    - **Content Generation**: Create tools to help tutors generate practice problems or study guides.
