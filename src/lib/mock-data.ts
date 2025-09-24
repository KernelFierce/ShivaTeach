export const user = {
  name: 'Maria Garcia',
  email: 'maria.garcia@example.com',
  role: 'Organization Admin',
};

export const teacher = {
  name: 'David Chen',
  email: 'david.c@example.com',
  role: 'Teacher',
};

export const studentUser = {
  name: 'Alex Johnson',
  email: 'alex.j@example.com',
  role: 'Student',
};

export const upcomingSessions = [
  { id: 1, student: 'Alex Johnson', subject: 'Algebra II', time: '10:00 AM', teacher: 'David Chen' },
  { id: 2, student: 'Sarah Lee', subject: 'AP Physics', time: '11:30 AM', teacher: 'Maria Garcia' },
  { id: 3, student: 'Tom Wilson', subject: 'SAT Prep', time: '2:00 PM', teacher: 'David Chen' },
];

export const teacherUpcomingSessions = [
    { id: 1, student: 'Alex Johnson', subject: 'Algebra II', time: '10:00 AM' },
    { id: 3, student: 'Tom Wilson', subject: 'SAT Prep', time: '2:00 PM' },
    { id: 4, student: 'Emily White', subject: 'Chemistry', time: '4:00 PM' },
]

export const teacherStudents = [
    { id: 'USR-001', name: 'Alex Johnson', subject: 'Algebra II', lastSession: '2023-10-26' },
    { id: 'USR-004', name: 'Sarah Lee', subject: 'AP Physics', lastSession: '2023-10-25' },
    { id: 'USR-005', name: 'Tom Wilson', subject: 'SAT Prep', lastSession: '2023-10-26' },
    { id: 'USR-008', name: 'Emily White', subject: 'Chemistry', lastSession: '2023-10-24' },
]

export const studentUpcomingSessions = [
  { id: 1, teacher: 'David Chen', subject: 'Algebra II', time: '10:00 AM', date: '2024-07-29' },
  { id: 2, teacher: 'Maria Garcia', subject: 'AP Physics', time: '11:30 AM', date: '2024-07-30' },
];

export const studentAssignments = [
  { id: 1, subject: 'Algebra II', title: 'Quadratic Equations Worksheet', due: '2024-08-02', status: 'Pending' },
  { id: 2, subject: 'AP Physics', title: 'Lab Report: Kinematics', due: '2024-08-05', status: 'Pending' },
  { id: 3, subject: 'Algebra II', title: 'Polynomials Quiz', due: '2024-07-28', status: 'Completed' },
];

export const studentStats = {
  total: 124,
  active: 98,
  leads: 12,
};

export const financialData = [
  { month: 'Jan', revenue: 4000, expenses: 2400 },
  { month: 'Feb', revenue: 3000, expenses: 1398 },
  { month: 'Mar', revenue: 5200, expenses: 9800 },
  { month: 'Apr', revenue: 2780, expenses: 3908 },
  { month: 'May', revenue: 1890, expenses: 4800 },
  { month: 'Jun', revenue: 2390, expenses: 3800 },
];

export const users = [
  { id: 'USR-001', name: 'Alex Johnson', email: 'alex.j@example.com', role: 'Student', status: 'Active', joined: '2023-01-15' },
  { id: 'USR-002', name: 'Maria Garcia', email: 'maria.g@example.com', role: 'Admin', status: 'Active', joined: '2022-11-20' },
  { id: 'USR-003', name: 'David Chen', email: 'david.c@example.com', role: 'Teacher', status: 'Active', joined: '2023-02-01' },
  { id: 'USR-004', name: 'Sarah Lee', email: 'sarah.l@example.com', role: 'Student', status: 'Active', joined: '2023-02-20' },
  { id: 'USR-005', name: 'Tom Wilson', email: 'tom.w@example.com', role: 'Student', status: 'Inactive', joined: '2023-03-10' },
  { id: 'USR-006', name: 'Jessica Brown', email: 'jessica.b@example.com', role: 'Parent', status: 'Active', joined: '2023-04-05' },
  { id: 'USR-007', name: 'Michael Davis', email: 'michael.d@example.com', role: 'Lead', status: 'Lead', joined: '2023-05-21' },
  { id: 'USR-008', name: 'Emily White', email: 'emily.w@example.com', role: 'Student', status: 'Active', joined: '2023-06-01' },
];

export const students = users.filter(u => u.role === 'Student');
