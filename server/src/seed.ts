import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Clear existing data
    await prisma.comment.deleteMany();
    await prisma.task.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.leaveRequest.deleteMany();
    await prisma.user.deleteMany();

    // Create Owner
    const ownerPassword = await bcrypt.hash('owner123', 12);
    const owner = await prisma.user.create({
        data: {
            email: 'owner@avis.com',
            password: ownerPassword,
            name: 'Vikram Singh',
            phone: '+91 98765 43210',
            role: 'OWNER',
            designation: 'Founder & CEO',
            department: 'Executive',
        },
    });
    console.log('✅ Created owner:', owner.email);

    // Create Manager
    const managerPassword = await bcrypt.hash('manager123', 12);
    const manager = await prisma.user.create({
        data: {
            email: 'manager@avis.com',
            password: managerPassword,
            name: 'Neha Gupta',
            phone: '+91 87654 32109',
            role: 'MANAGER',
            designation: 'Engineering Manager',
            department: 'Engineering',
        },
    });
    console.log('✅ Created manager:', manager.email);

    // Create Employees under Manager
    const employeePassword = await bcrypt.hash('employee123', 12);

    const emp1 = await prisma.user.create({
        data: {
            email: 'arun@avis.com',
            password: employeePassword,
            name: 'Arun Kumar',
            phone: '+91 76543 21098',
            role: 'EMPLOYEE',
            designation: 'Senior Developer',
            department: 'Engineering',
            managerId: manager.id,
        },
    });

    const emp2 = await prisma.user.create({
        data: {
            email: 'priya@avis.com',
            password: employeePassword,
            name: 'Priya Sharma',
            phone: '+91 65432 10987',
            role: 'EMPLOYEE',
            designation: 'UI/UX Designer',
            department: 'Design',
            managerId: manager.id,
        },
    });

    const emp3 = await prisma.user.create({
        data: {
            email: 'rahul@avis.com',
            password: employeePassword,
            name: 'Rahul Patel',
            phone: '+91 54321 09876',
            role: 'EMPLOYEE',
            designation: 'Frontend Developer',
            department: 'Engineering',
            managerId: manager.id,
        },
    });

    console.log('✅ Created 3 employees');

    // Create sample tasks
    await prisma.task.createMany({
        data: [
            {
                title: 'Design landing page mockup',
                description: 'Create high-fidelity mockups for the new landing page including hero section and features.',
                status: 'COMPLETED',
                priority: 'HIGH',
                assigneeId: emp2.id,
                createdById: manager.id,
                deadline: new Date('2024-12-15'),
            },
            {
                title: 'Implement authentication API',
                description: 'Build JWT-based authentication endpoints including login, register, and password reset.',
                status: 'IN_PROGRESS',
                priority: 'HIGH',
                assigneeId: emp1.id,
                createdById: manager.id,
                deadline: new Date('2024-12-20'),
            },
            {
                title: 'Update API documentation',
                description: 'Document all new endpoints with request/response examples.',
                status: 'PENDING',
                priority: 'MEDIUM',
                assigneeId: emp1.id,
                createdById: manager.id,
                deadline: new Date('2024-12-25'),
            },
            {
                title: 'Build task management UI',
                description: 'Develop the task list and task detail components with animations.',
                status: 'UNDER_REVIEW',
                priority: 'HIGH',
                assigneeId: emp3.id,
                createdById: manager.id,
                deadline: new Date('2024-12-18'),
            },
            {
                title: 'Design system documentation',
                description: 'Create documentation for the component library.',
                status: 'PENDING',
                priority: 'LOW',
                assigneeId: emp2.id,
                createdById: manager.id,
                deadline: new Date('2024-12-30'),
            },
        ],
    });
    console.log('✅ Created 5 sample tasks');

    // Create attendance records
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    await prisma.attendance.createMany({
        data: [
            {
                userId: emp1.id,
                date: today,
                clockIn: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 9 AM
                status: 'PRESENT',
            },
            {
                userId: emp1.id,
                date: yesterday,
                clockIn: new Date(yesterday.getTime() + 9 * 60 * 60 * 1000),
                clockOut: new Date(yesterday.getTime() + 18 * 60 * 60 * 1000),
                status: 'PRESENT',
            },
            {
                userId: emp2.id,
                date: today,
                clockIn: new Date(today.getTime() + 9.5 * 60 * 60 * 1000),
                status: 'PRESENT',
            },
        ],
    });
    console.log('✅ Created attendance records');

    // Create leave requests
    await prisma.leaveRequest.createMany({
        data: [
            {
                type: 'CASUAL',
                startDate: new Date('2024-12-20'),
                endDate: new Date('2024-12-22'),
                reason: 'Family function in hometown',
                status: 'PENDING',
                employeeId: emp1.id,
            },
            {
                type: 'SICK',
                startDate: new Date('2024-12-05'),
                endDate: new Date('2024-12-05'),
                reason: 'Not feeling well',
                status: 'APPROVED',
                employeeId: emp2.id,
                reviewerId: manager.id,
                reviewedAt: new Date(),
            },
        ],
    });
    console.log('✅ Created leave requests');

    console.log('\n🎉 Seeding complete!\n');
    console.log('📧 Login credentials:');
    console.log('   Owner:    owner@avis.com    / owner123');
    console.log('   Manager:  manager@avis.com  / manager123');
    console.log('   Employee: arun@avis.com     / employee123');
    console.log('            priya@avis.com    / employee123');
    console.log('            rahul@avis.com    / employee123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
