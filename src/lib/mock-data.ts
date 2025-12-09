// Mock data for AVIS application
// This file provides realistic sample data for all entities

export interface Employee {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
    designation: string;
    department: string;
    role: "employee" | "manager" | "owner";
    joinDate: string;
    status: "active" | "inactive" | "on-leave";
}

export interface Task {
    id: string;
    title: string;
    description: string;
    status: "pending" | "in-progress" | "under-review" | "completed";
    priority: "low" | "medium" | "high";
    assignee: Employee;
    assignedBy: Employee;
    deadline: string;
    createdAt: string;
    updatedAt: string;
    comments: Comment[];
    attachments: Attachment[];
}

export interface Comment {
    id: string;
    author: Employee;
    content: string;
    createdAt: string;
}

export interface Attachment {
    id: string;
    name: string;
    type: string;
    size: string;
    url: string;
    uploadedAt: string;
}

export interface AttendanceRecord {
    id: string;
    employee: Employee;
    date: string;
    clockIn: string | null;
    clockOut: string | null;
    totalHours: number;
    status: "present" | "absent" | "half-day" | "on-leave";
}

export interface LeaveRequest {
    id: string;
    employee: Employee;
    type: "casual" | "sick" | "earned" | "unpaid";
    startDate: string;
    endDate: string;
    reason: string;
    status: "pending" | "approved" | "rejected";
    appliedAt: string;
    reviewedBy?: Employee;
    reviewedAt?: string;
}

// ============ MOCK EMPLOYEES ============
export const employees: Employee[] = [
    {
        id: "emp-1",
        name: "Arun Kumar",
        email: "arun@company.com",
        phone: "+91 98765 43210",
        avatar: "",
        designation: "Senior Developer",
        department: "Engineering",
        role: "employee",
        joinDate: "2023-03-15",
        status: "active",
    },
    {
        id: "emp-2",
        name: "Priya Sharma",
        email: "priya@company.com",
        phone: "+91 87654 32109",
        avatar: "",
        designation: "UI/UX Designer",
        department: "Design",
        role: "employee",
        joinDate: "2023-06-01",
        status: "active",
    },
    {
        id: "emp-3",
        name: "Rahul Patel",
        email: "rahul@company.com",
        phone: "+91 76543 21098",
        avatar: "",
        designation: "Frontend Developer",
        department: "Engineering",
        role: "employee",
        joinDate: "2024-01-10",
        status: "active",
    },
    {
        id: "mgr-1",
        name: "Neha Gupta",
        email: "neha@company.com",
        phone: "+91 65432 10987",
        avatar: "",
        designation: "Engineering Manager",
        department: "Engineering",
        role: "manager",
        joinDate: "2022-04-20",
        status: "active",
    },
    {
        id: "own-1",
        name: "Vikram Singh",
        email: "vikram@company.com",
        phone: "+91 54321 09876",
        avatar: "",
        designation: "Founder & CEO",
        department: "Executive",
        role: "owner",
        joinDate: "2021-01-01",
        status: "active",
    },
];

export const currentEmployee = employees[0]; // Arun Kumar
export const currentManager = employees[3]; // Neha Gupta
export const currentOwner = employees[4]; // Vikram Singh

// ============ MOCK TASKS ============
export const tasks: Task[] = [
    {
        id: "task-1",
        title: "Design landing page mockup",
        description: "Create high-fidelity mockups for the new landing page including hero section, features, and testimonials.",
        status: "completed",
        priority: "high",
        assignee: employees[1],
        assignedBy: employees[3],
        deadline: "2024-12-08",
        createdAt: "2024-12-01T10:00:00Z",
        updatedAt: "2024-12-07T16:30:00Z",
        comments: [
            {
                id: "c1",
                author: employees[3],
                content: "Great progress! Let's add more whitespace in the hero section.",
                createdAt: "2024-12-05T14:00:00Z",
            },
        ],
        attachments: [
            {
                id: "a1",
                name: "landing-v2.fig",
                type: "figma",
                size: "2.4 MB",
                url: "#",
                uploadedAt: "2024-12-06T10:00:00Z",
            },
        ],
    },
    {
        id: "task-2",
        title: "Implement authentication API",
        description: "Build JWT-based authentication endpoints including login, register, and password reset functionality.",
        status: "in-progress",
        priority: "high",
        assignee: employees[0],
        assignedBy: employees[3],
        deadline: "2024-12-12",
        createdAt: "2024-12-03T09:00:00Z",
        updatedAt: "2024-12-10T11:00:00Z",
        comments: [],
        attachments: [],
    },
    {
        id: "task-3",
        title: "Update API documentation",
        description: "Document all new endpoints with request/response examples using Swagger/OpenAPI format.",
        status: "pending",
        priority: "medium",
        assignee: employees[0],
        assignedBy: employees[3],
        deadline: "2024-12-15",
        createdAt: "2024-12-08T14:00:00Z",
        updatedAt: "2024-12-08T14:00:00Z",
        comments: [],
        attachments: [],
    },
    {
        id: "task-4",
        title: "Build task management UI",
        description: "Develop the task list, task detail, and task creation components with animations and drag-drop support.",
        status: "under-review",
        priority: "high",
        assignee: employees[2],
        assignedBy: employees[3],
        deadline: "2024-12-11",
        createdAt: "2024-12-02T11:00:00Z",
        updatedAt: "2024-12-09T17:00:00Z",
        comments: [
            {
                id: "c2",
                author: employees[3],
                content: "Looks great! Just need to fix the mobile layout.",
                createdAt: "2024-12-09T17:00:00Z",
            },
        ],
        attachments: [],
    },
    {
        id: "task-5",
        title: "Design system documentation",
        description: "Create comprehensive documentation for the component library including usage examples.",
        status: "pending",
        priority: "low",
        assignee: employees[1],
        assignedBy: employees[3],
        deadline: "2024-12-20",
        createdAt: "2024-12-09T10:00:00Z",
        updatedAt: "2024-12-09T10:00:00Z",
        comments: [],
        attachments: [],
    },
];

// ============ MOCK ATTENDANCE ============
export const attendanceRecords: AttendanceRecord[] = [
    {
        id: "att-1",
        employee: employees[0],
        date: "2024-12-10",
        clockIn: "09:15",
        clockOut: null,
        totalHours: 0,
        status: "present",
    },
    {
        id: "att-2",
        employee: employees[0],
        date: "2024-12-09",
        clockIn: "09:00",
        clockOut: "18:30",
        totalHours: 9.5,
        status: "present",
    },
    {
        id: "att-3",
        employee: employees[0],
        date: "2024-12-08",
        clockIn: null,
        clockOut: null,
        totalHours: 0,
        status: "absent",
    },
    {
        id: "att-4",
        employee: employees[0],
        date: "2024-12-07",
        clockIn: "09:30",
        clockOut: "14:00",
        totalHours: 4.5,
        status: "half-day",
    },
];

// ============ MOCK LEAVE REQUESTS ============
export const leaveRequests: LeaveRequest[] = [
    {
        id: "leave-1",
        employee: employees[0],
        type: "casual",
        startDate: "2024-12-20",
        endDate: "2024-12-22",
        reason: "Family function in hometown",
        status: "pending",
        appliedAt: "2024-12-08T10:00:00Z",
    },
    {
        id: "leave-2",
        employee: employees[1],
        type: "sick",
        startDate: "2024-12-05",
        endDate: "2024-12-05",
        reason: "Not feeling well, need rest",
        status: "approved",
        appliedAt: "2024-12-05T08:00:00Z",
        reviewedBy: employees[3],
        reviewedAt: "2024-12-05T08:30:00Z",
    },
    {
        id: "leave-3",
        employee: employees[2],
        type: "earned",
        startDate: "2024-12-25",
        endDate: "2024-12-31",
        reason: "Year-end vacation with family",
        status: "pending",
        appliedAt: "2024-12-09T11:00:00Z",
    },
];

// ============ DASHBOARD STATS ============
export const employeeStats = {
    tasksToday: 4,
    tasksCompleted: 2,
    hoursToday: "6:45",
    leaveBalance: { casual: 8, sick: 10, earned: 15 },
};

export const managerStats = {
    teamSize: 4,
    pendingTasks: 5,
    inProgressTasks: 8,
    completedTasks: 24,
    delayedTasks: 2,
    pendingApprovals: 3,
    teamAttendanceToday: { present: 3, absent: 1 },
};

export const ownerStats = {
    totalEmployees: 45,
    departments: 8,
    completionRate: 87,
    productivityTrend: 23,
    monthlyTasks: {
        completed: 156,
        pending: 34,
        delayed: 8,
    },
    topPerformers: [
        { name: "Priya Sharma", tasks: 28, rate: 96 },
        { name: "Rahul Patel", tasks: 24, rate: 92 },
        { name: "Arun Kumar", tasks: 22, rate: 88 },
    ],
    departmentPerformance: [
        { name: "Engineering", completion: 92 },
        { name: "Design", completion: 88 },
        { name: "Marketing", completion: 85 },
        { name: "Sales", completion: 78 },
    ],
};
