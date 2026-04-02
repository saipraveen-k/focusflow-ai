require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Notification = require('../models/Notification');

const sampleUsers = [
  {
    username: 'demo_user',
    email: 'demo@focusflow.ai',
    password: 'demo123',
    currentActivity: 'study',
    preferences: {
      focusModes: {
        study: {
          enabled: true,
          allowedApps: ['gmail', 'whatsapp', 'slack'],
          blockedApps: ['instagram', 'facebook', 'tiktok'],
          priorityContacts: ['teacher', 'professor', 'emergency']
        },
        work: {
          enabled: true,
          allowedApps: ['slack', 'teams', 'gmail', 'outlook'],
          blockedApps: ['instagram', 'facebook', 'youtube'],
          priorityContacts: ['boss', 'manager', 'client']
        },
        sleep: {
          enabled: true,
          allowedApps: ['phone', 'messages'],
          blockedApps: ['instagram', 'facebook', 'youtube', 'spotify'],
          priorityContacts: ['emergency', 'family']
        },
        leisure: {
          enabled: false,
          allowedApps: [],
          blockedApps: [],
          priorityContacts: []
        }
      },
      notifications: {
        enableSounds: true,
        enableVibration: true,
        enableLED: false,
        quietHours: {
          enabled: true,
          start: "22:00",
          end: "07:00"
        }
      },
      aiSettings: {
        sensitivity: 0.7,
        learningEnabled: true,
        autoAdjust: true
      }
    }
  }
];

const sampleNotifications = [
  {
    app: 'instagram',
    sender: 'friend_1',
    message: 'Check out my new post!',
    activity: 'study',
    decision: 'BLOCK',
    confidence: 0.85
  },
  {
    app: 'whatsapp',
    sender: 'teacher',
    message: 'Assignment due tomorrow',
    activity: 'study',
    decision: 'SHOW',
    confidence: 0.92
  },
  {
    app: 'amazon',
    sender: 'promo',
    message: '50% off electronics!',
    activity: 'study',
    decision: 'DELAY',
    confidence: 0.78
  },
  {
    app: 'slack',
    sender: 'manager',
    message: 'Team meeting in 5 mins',
    activity: 'work',
    decision: 'SHOW',
    confidence: 0.95
  },
  {
    app: 'gmail',
    sender: 'colleague',
    message: 'Project update',
    activity: 'work',
    decision: 'SHOW',
    confidence: 0.88
  },
  {
    app: 'spotify',
    sender: 'system',
    message: 'Your weekly playlist is ready',
    activity: 'work',
    decision: 'DELAY',
    confidence: 0.72
  },
  {
    app: 'telegram',
    sender: 'group',
    message: 'Weekend plans',
    activity: 'sleep',
    decision: 'BLOCK',
    confidence: 0.91
  },
  {
    app: 'whatsapp',
    sender: 'emergency_contact',
    message: 'URGENT: Call me back',
    activity: 'sleep',
    decision: 'SHOW',
    confidence: 0.98
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Notification.deleteMany({});
    
    console.log('Creating sample users...');
    const createdUsers = [];
    
    for (const userData of sampleUsers) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      
      await user.save();
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.username}`);
    }
    
    console.log('Creating sample notifications...');
    const demoUser = createdUsers[0];
    
    for (const notifData of sampleNotifications) {
      const notification = new Notification({
        userId: demoUser._id,
        originalId: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Random time in last 24h
        contextData: {
          hourOfDay: new Date().getHours(),
          isWeekday: true,
          isWeekend: false,
          messageLength: notifData.message.length,
          hasUrgencyKeyword: notifData.message.toLowerCase().includes('urgent')
        },
        ...notifData
      });
      
      await notification.save();
      console.log(`✅ Created notification from ${notifData.app}`);
    }
    
    // Update user stats
    demoUser.stats.totalNotifications = sampleNotifications.length;
    demoUser.stats.blockedNotifications = sampleNotifications.filter(n => n.decision === 'BLOCK').length;
    demoUser.stats.delayedNotifications = sampleNotifications.filter(n => n.decision === 'DELAY').length;
    demoUser.stats.allowedNotifications = sampleNotifications.filter(n => n.decision === 'SHOW').length;
    await demoUser.save();
    
    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users created: ${createdUsers.length}`);
    console.log(`- Notifications created: ${sampleNotifications.length}`);
    console.log(`\n👤 Demo User Login:`);
    console.log(`- Email: ${sampleUsers[0].email}`);
    console.log(`- Password: ${sampleUsers[0].password}`);
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📴 Database connection closed');
  }
}

// Run the seeding function
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
