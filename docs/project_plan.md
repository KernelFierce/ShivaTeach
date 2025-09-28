
# Project Plan & Changelog

This document outlines the strategic plan, feature roadmap, and changelog for the tutoring management platform.

## 1. Vision & Goals (Confirmed)

- **Core Problem:** Simplify scheduling and management for virtual tutors dealing with multiple timezones.
- **Target Audience:** Evolve from a single-user tool to a multi-tenant SaaS platform targeting individual tutors, small agencies, and eventually larger institutions.
- **Business Model:** Subscription-based tiers with varying feature sets (e.g., with and without AI capabilities).
- **High-Level Roadmap:**
    - **Next 1 Week:** Deploy for personal use.
    - **Next 1 Month:** Onboard an initial cohort of ~100 users.
    - **Next 6-12 Months:** Scale for the international market, potentially migrating to a more enterprise-level infrastructure.

## 2. Core Architecture: User Roles & Permissions (Confirmed)

This section defines the user hierarchy and their primary responsibilities. It's crucial we get this right as it's the foundation of the application.

*   **SuperUser (You)**
    *   **Tenant Management:** Onboard, manage, suspend, and deactivate new tenant organizations.
    *   **System Administration:** Assign Organization Admins, manage platform-wide settings, and view system-level logs for support.
    *   **Support:** Ability to impersonate Organization Admins for troubleshooting.

*   **Organization Admin (Client/Agency Owner)**
    *   **User Management:** Create, edit, and manage accounts for their staff (Admins, Teachers) and clients (Students, Parents).
    *   **Role Management:** Define and assign granular permissions and roles within their organization.
    *   **Financial Management:** Configure billing policies, set custom rates for courses/teachers, and manage invoicing.
    *   **Course Management:** Define subjects and courses offered by the organization.
    -   **Lead Management:** Manage prospective clients.
    *   **Branding:** Customize the platform with their own branding.

*   **Teacher**
    *   **Schedule Management:** View their schedule, mark availability, and log completed sessions.
    *   **Student Interaction:** Communicate with students/parents (within supervised channels).
    *   **Course Content:** Manage materials for their assigned courses.

*   **Student**
    *   **Schedule:** View their upcoming classes and session history.
    *   **Learning:** Access course materials and submit assignments.

*   **Parent**
    *   **Financials:** View invoices and payment history.
    *   **Progress Monitoring:** View their child's schedule and academic progress.
    *   **Communication:** A supervised channel to communicate with teachers/admins.

## 3. UI/UX Strategy (Confirmed)

To ensure a professional, intuitive, and scalable user interface, we will adopt the following strategy:

*   **Component-Driven Design:** We will leverage the existing `shadcn/ui` library as the foundation for our design system. All new UI elements will be built as reusable components to ensure consistency and speed up development.
*   **Formalized Theme:** We will formalize the color palette and typography based on the existing styles in `src/app/globals.css` and `tailwind.config.ts`. This will create a consistent visual identity.
*   **Responsive Dashboard Layout:** We will standardize a main dashboard layout, likely consisting of a collapsible sidebar for navigation, a header for user actions and notifications, and a main content area. This is already partially implemented and we will enforce it across all views.
*   **UX Principles:**
    *   **Clarity:** The UI will be clean and uncluttered, with a clear visual hierarchy.
    *   **Efficiency:** Workflows will be designed to minimize clicks and streamline common tasks.
    *   **Feedback:** The system will provide clear feedback to users for all actions (e.g., loading states, success messages, error notifications).

## 4. Feature Roadmap

### Priority 1: Google Calendar & Meet Integration

This is a cornerstone feature to streamline scheduling.

*   **Objective:** When a class is scheduled in the app, automatically create a corresponding Google Calendar event for both the teacher and the student. The event will include a unique Google Meet link for the session.

*   **Implementation Plan:**
    1.  **Authorization (The First Step):** Implement Google OAuth 2.0. This will allow users (starting with Teachers and Students) to securely connect their Google accounts to our platform.
    2.  **UI for Connection:** We will create a new page under `Settings > Integrations`. This page will feature a "Connect with Google" button and display the connection status.
    3.  **Backend Logic:** Develop the necessary API endpoints and server-less functions to handle the OAuth authentication flow and securely store authorization tokens for each user in their Firestore profile.
    4.  **Event Creation:** Once authorization is in place, we will build the functionality to create and update calendar events via the Google Calendar API when a class is scheduled, updated, or canceled.

---

## Changelog

*   **[Date]**: Project plan updated to include a detailed breakdown of the Google Calendar integration feature.
*   **[Date]**: UI/UX Strategy confirmed.
*   **[Date]**: Initial project plan created, defining Vision, Goals, and User Hierarchy.

---

## **Client Confirmation Requested:**

We are now ready to begin development. I recommend we start with **Step 1: Authorization**, which is the critical first step for Google integration.

This will involve:
- Setting up a new project in the Google Cloud Console to get API keys.
- Creating the necessary backend infrastructure to handle the authentication requests.

Do I have your approval to proceed with the technical setup for Google Account authorization?
