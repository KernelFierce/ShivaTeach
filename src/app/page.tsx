'use client';

// This page has been repurposed to directly render the user creation form,
// completely isolating it from the main dashboard layout and its data-fetching logic.
// This is the most robust way to solve the initial "chicken-and-egg" problem of
// needing a user to log in but needing to log in to create a user.

import CreateUserPage from './dashboard/create-user/page';

export default function StandaloneCreateUser() {
  return <CreateUserPage />;
}
