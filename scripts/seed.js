const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Task = require('../models/Task');

async function seedDatabase() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to database');

        // Clear existing data
        await User.deleteMany({});
        await Task.deleteMany({});
        console.log('🗑️ Cleared existing data');

        // Create test user
        const hashedPassword = await bcrypt.hash('password123', 10);
        const testUser = new User({
            username: 'testuser',
            password: hashedPassword
        });
        await testUser.save();
        console.log('👤 Created test user: testuser / password123');

        // Create sample tasks
        const sampleTasks = [
            {
                title: 'Complete AltSchool Assignment',
                description: 'Finish buildinng the Todo app with authentication',
                priority: 'high',
                status: 'pending',
                user: testUser._id
            },
            {
                title: 'Learn MongoDB',
                description: 'Study MongoDB aggregation and indexing',
                priority: 'medium',
                status: 'pending',
                user: testUser._id
            },
            {
                title: 'Deploy to Render',
                description: 'Deploy the application to Render hosting platform',
                priority: 'high',
                status: 'pending',
                user: testUser._id
            },
            {
                title: 'Write Tests',
                description: 'Create unit tests for the application',
                priority: 'medium',
                status: 'completed',
                user: testUser._id
            },
            {
                title: 'Setup GitHub Repository',
                description: 'Push code to GitHub and setup CI/CD',
                priority: 'low',
                status: 'completed',
                user: testUser._id
            }
        ];

        await Task.insertMany(sampleTasks);
        console.log(`📝 Created ${sampleTasks.length} sample tasks`);

        // Disconnect
        await mongoose.disconnect();
        console.log('👋 Databse seeding completed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
}

seedDatabase();