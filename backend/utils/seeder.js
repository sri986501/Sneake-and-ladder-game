const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Achievement = require('../models/Achievement');
const Match = require('../models/Match');

// Load environment variables
dotenv.config({ path: __dirname + '/../.env' });

const achievementsData = [
  {
    achievementId: 'first_victory',
    title: 'First Victory',
    description: 'Win your first match inside the Arena',
    rewardPoints: 50,
    badgeIcon: 'Trophy'
  },
  {
    achievementId: 'snake_survivor',
    title: 'Snake Survivor',
    description: 'Survive and escape snakes 10 times',
    rewardPoints: 100,
    badgeIcon: 'ShieldAlert'
  },
  {
    achievementId: 'ladder_master',
    title: 'Ladder Master',
    description: 'Climb 15 ladders successfully',
    rewardPoints: 100,
    badgeIcon: 'TrendingUp'
  },
  {
    achievementId: 'games_100',
    title: 'Centurion',
    description: 'Complete 100 games in the Arena',
    rewardPoints: 150,
    badgeIcon: 'Gamepad2'
  },
  {
    achievementId: 'win_streak_10',
    title: 'Unstoppable',
    description: 'Reach a win streak of 10 matches',
    rewardPoints: 200,
    badgeIcon: 'Zap'
  },
  {
    achievementId: 'champion',
    title: 'Arena Champion',
    description: 'Secure 10 victories in the Arena',
    rewardPoints: 150,
    badgeIcon: 'Crown'
  },
  {
    achievementId: 'legend',
    title: 'Legendary Climber',
    description: 'Secure 50 victories in the Arena',
    rewardPoints: 300,
    badgeIcon: 'Award'
  },
  {
    achievementId: 'grand_master',
    title: 'Grand Master',
    description: 'Secure 100 victories in the Arena',
    rewardPoints: 500,
    badgeIcon: 'ShieldAlert'
  }
];

const mockUsers = [
  {
    username: 'admin',
    email: 'admin@arena.com',
    password: 'adminpassword',
    role: 'admin',
    avatar: 'avatar5',
    level: 10,
    xp: 250,
    totalPoints: 2500,
    weeklyPoints: 450,
    monthlyPoints: 1250,
    gamesPlayed: 50,
    wins: 22,
    losses: 28,
    bestStreak: 5,
    ladderClimbs: 72,
    snakeEscapes: 39
  },
  {
    username: 'cyber_climber',
    email: 'climber@arena.com',
    password: 'password123',
    role: 'user',
    avatar: 'avatar1',
    level: 6,
    xp: 400,
    totalPoints: 1500,
    weeklyPoints: 350,
    monthlyPoints: 800,
    gamesPlayed: 32,
    wins: 14,
    losses: 18,
    bestStreak: 4,
    ladderClimbs: 45,
    snakeEscapes: 22,
    achievements: [
      { achievementId: 'first_victory' },
      { achievementId: 'champion' }
    ]
  },
  {
    username: 'neon_snake',
    email: 'snake@arena.com',
    password: 'password123',
    role: 'user',
    avatar: 'avatar2',
    level: 5,
    xp: 150,
    totalPoints: 1150,
    weeklyPoints: 200,
    monthlyPoints: 650,
    gamesPlayed: 25,
    wins: 10,
    losses: 15,
    bestStreak: 3,
    ladderClimbs: 31,
    snakeEscapes: 14,
    achievements: [
      { achievementId: 'first_victory' },
      { achievementId: 'champion' }
    ]
  },
  {
    username: 'grid_runner',
    email: 'runner@arena.com',
    password: 'password123',
    role: 'user',
    avatar: 'avatar3',
    level: 4,
    xp: 220,
    totalPoints: 850,
    weeklyPoints: 150,
    monthlyPoints: 400,
    gamesPlayed: 18,
    wins: 7,
    losses: 11,
    bestStreak: 2,
    ladderClimbs: 22,
    snakeEscapes: 9,
    achievements: [
      { achievementId: 'first_victory' }
    ]
  },
  {
    username: 'pixel_pioneer',
    email: 'pioneer@arena.com',
    password: 'password123',
    role: 'user',
    avatar: 'avatar4',
    level: 2,
    xp: 90,
    totalPoints: 420,
    weeklyPoints: 80,
    monthlyPoints: 180,
    gamesPlayed: 10,
    wins: 3,
    losses: 7,
    bestStreak: 1,
    ladderClimbs: 12,
    snakeEscapes: 5,
    achievements: [
      { achievementId: 'first_victory' }
    ]
  }
];

const seedDB = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Database connected!');

    // Clear existing achievements
    await Achievement.deleteMany({});
    console.log('Deleted existing achievements.');

    // Seed achievements
    await Achievement.insertMany(achievementsData);
    console.log('Inserted achievements definitions.');

    // Clear user accounts (Optional, but clean for seeder)
    await User.deleteMany({});
    await Match.deleteMany({});
    console.log('Cleared existing users and match histories.');

    // Seed mock users (they will hash passwords on .create because of pre-save hook)
    for (const u of mockUsers) {
      await User.create(u);
    }
    console.log('Inserted seed user profiles.');

    console.log('Database seeding successfully finished!');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Database seeding failed: ${error.message}`);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedDB();
