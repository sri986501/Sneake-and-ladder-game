import { LADDERS, SNAKES } from './boardHelper';

const MOCK_USERS_SEED = [
  {
    _id: "user_admin_id_1337",
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
    currentStreak: 0,
    highestDiceRollCount: 30,
    ladderClimbs: 72,
    snakeEscapes: 39,
    achievements: [
      { achievementId: 'first_victory' },
      { achievementId: 'champion' }
    ],
    friends: [],
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
  },
  {
    _id: "user_id_2",
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
    currentStreak: 0,
    highestDiceRollCount: 20,
    ladderClimbs: 45,
    snakeEscapes: 22,
    achievements: [
      { achievementId: 'first_victory' },
      { achievementId: 'champion' }
    ],
    friends: [],
    createdAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString()
  },
  {
    _id: "user_id_3",
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
    currentStreak: 0,
    highestDiceRollCount: 18,
    ladderClimbs: 31,
    snakeEscapes: 14,
    achievements: [
      { achievementId: 'first_victory' },
      { achievementId: 'champion' }
    ],
    friends: [],
    createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
  },
  {
    _id: "user_id_4",
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
    currentStreak: 0,
    highestDiceRollCount: 15,
    ladderClimbs: 22,
    snakeEscapes: 9,
    achievements: [
      { achievementId: 'first_victory' }
    ],
    friends: [],
    createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString()
  },
  {
    _id: "user_id_5",
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
    currentStreak: 0,
    highestDiceRollCount: 12,
    ladderClimbs: 12,
    snakeEscapes: 5,
    achievements: [
      { achievementId: 'first_victory' }
    ],
    friends: [],
    createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
  }
];

// Seed db in localStorage
const MOCK_TOURNAMENTS_SEED = [
  {
    _id: "tourney_1",
    title: "Royal Autumn Bracket",
    description: "Conducted for noble explorers of the mahogany grid.",
    entryFee: 30,
    prizePool: 60,
    maxPlayers: 8,
    status: "upcoming",
    creator: "user_admin_id_1337",
    participants: [
      { user: "user_admin_id_1337", username: "admin", avatar: "avatar5", points: 0, wins: 0, matchesPlayed: 0 }
    ],
    createdAt: new Date().toISOString()
  },
  {
    _id: "tourney_2",
    title: "Grand Alchemist Scroll",
    description: "Test your protection charms and speed elixirs in active play.",
    entryFee: 50,
    prizePool: 250,
    maxPlayers: 4,
    status: "active",
    creator: "user_id_2",
    participants: [
      { user: "user_id_2", username: "cyber_climber", avatar: "avatar1", points: 6, wins: 2, matchesPlayed: 2 },
      { user: "user_id_3", username: "neon_snake", avatar: "avatar2", points: 3, wins: 1, matchesPlayed: 2 },
      { user: "user_id_4", username: "grid_runner", avatar: "avatar3", points: 1, wins: 0, matchesPlayed: 2 }
    ],
    createdAt: new Date().toISOString()
  }
];

const initMockDB = () => {
  if (!localStorage.getItem('arena_db_users')) {
    localStorage.setItem('arena_db_users', JSON.stringify(MOCK_USERS_SEED));
  }
  if (!localStorage.getItem('arena_db_matches')) {
    localStorage.setItem('arena_db_matches', JSON.stringify([]));
  }
  if (!localStorage.getItem('arena_db_tournaments')) {
    localStorage.setItem('arena_db_tournaments', JSON.stringify(MOCK_TOURNAMENTS_SEED));
  }
};

const getTournaments = () => JSON.parse(localStorage.getItem('arena_db_tournaments') || '[]');
const saveTournaments = (tourneys) => localStorage.setItem('arena_db_tournaments', JSON.stringify(tourneys));

const getUsers = () => JSON.parse(localStorage.getItem('arena_db_users') || '[]');
const saveUsers = (users) => localStorage.setItem('arena_db_users', JSON.stringify(users));

const getMatches = () => JSON.parse(localStorage.getItem('arena_db_matches') || '[]');
const saveMatches = (matches) => localStorage.setItem('arena_db_matches', JSON.stringify(matches));

const getCurrentUser = () => {
  const token = localStorage.getItem('arena_token');
  if (!token) return null;
  const users = getUsers();
  return users.find(u => u._id === token) || null;
};

const checkAchievements = (user) => {
  const achievementsList = [
    { id: 'first_victory', title: 'First Victory', desc: 'Win your first match', points: 50, check: u => u.wins >= 1 },
    { id: 'snake_survivor', title: 'Snake Survivor', desc: 'Escape snakes 10 times', points: 100, check: u => u.snakeEscapes >= 10 },
    { id: 'ladder_master', title: 'Ladder Master', desc: 'Climb 15 ladders', points: 100, check: u => u.ladderClimbs >= 15 },
    { id: 'games_100', title: 'Centurion', desc: 'Play 100 matches', points: 150, check: u => u.gamesPlayed >= 100 },
    { id: 'win_streak_10', title: 'Unstoppable', desc: 'Achieve a 10 win streak', points: 200, check: u => u.bestStreak >= 10 },
    { id: 'champion', title: 'Arena Champion', desc: 'Win 10 matches', points: 150, check: u => u.wins >= 10 },
    { id: 'legend', title: 'Legendary Climber', desc: 'Win 50 matches', points: 300, check: u => u.wins >= 50 },
    { id: 'grand_master', title: 'Grand Master', desc: 'Win 100 matches', points: 500, check: u => u.wins >= 100 }
  ];

  const newlyUnlocked = [];
  const currentUnlockedIds = user.achievements.map(a => a.achievementId);

  for (const ach of achievementsList) {
    if (!currentUnlockedIds.includes(ach.id) && ach.check(user)) {
      user.achievements.push({ achievementId: ach.id, unlockedAt: new Date().toISOString() });
      user.totalPoints += ach.points;
      user.weeklyPoints += ach.points;
      user.monthlyPoints += ach.points;
      newlyUnlocked.push(ach);
    }
  }

  return newlyUnlocked;
};

// Global interceptor setup
export const setupMockAPI = (useMock = true) => {
  if (!useMock) return;

  initMockDB();

  const originalFetch = window.fetch;

  window.fetch = async (input, init) => {
    const urlStr = typeof input === 'string' ? input : input.url;
    
    // Only intercept endpoints aimed at port 5000 server API
    if (!urlStr.includes(':5000/api')) {
      return originalFetch(input, init);
    }

    const path = urlStr.split('/api')[1];
    const method = init?.method?.toUpperCase() || 'GET';
    const body = init?.body ? JSON.parse(init.body) : null;
    
    // Extract Token from Authorization header
    const authHeader = init?.headers?.Authorization || init?.headers?.authorization;
    let token = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    console.log(`[API Interceptor Mock] ${method} ${path}`, { token, body });

    // Emulate delay
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      // 1. AUTH REGISTER
      if (path === '/auth/register' && method === 'POST') {
        const { username, email, password } = body;
        const users = getUsers();
        if (users.some(u => u.email === email.toLowerCase() || u.username === username.trim())) {
          return mockResponse(400, { success: false, message: 'Username or Email already registered' });
        }

        const newUser = {
          _id: 'user_' + Math.random().toString(36).substr(2, 9),
          username: username.trim(),
          email: email.toLowerCase(),
          password, // plain text mock comparison
          role: 'user',
          avatar: 'avatar1',
          level: 1,
          xp: 0,
          totalPoints: 0,
          weeklyPoints: 0,
          monthlyPoints: 0,
          gamesPlayed: 0,
          wins: 0,
          losses: 0,
          bestStreak: 0,
          currentStreak: 0,
          highestDiceRollCount: 0,
          ladderClimbs: 0,
          snakeEscapes: 0,
          achievements: [],
          friends: [],
          createdAt: new Date().toISOString()
        };

        users.push(newUser);
        saveUsers(users);

        return mockResponse(201, {
          success: true,
          token: newUser._id,
          user: newUser
        });
      }

      // 2. AUTH LOGIN
      if (path === '/auth/login' && method === 'POST') {
        const { email, password } = body;
        const users = getUsers();
        const user = users.find(u => u.email === email.toLowerCase() && u.password === password);

        if (!user) {
          return mockResponse(401, { success: false, message: 'Invalid email or password' });
        }

        return mockResponse(200, {
          success: true,
          token: user._id,
          user
        });
      }

      // 3. AUTH ME
      if (path === '/auth/me' && method === 'GET') {
        if (!token) return mockResponse(401, { success: false, message: 'Not authorized' });
        const users = getUsers();
        const user = users.find(u => u._id === token);

        if (!user) {
          return mockResponse(401, { success: false, message: 'Not authorized' });
        }

        // Populate friends metadata
        const populatedFriends = (user.friends || []).map(fId => {
          const friend = users.find(u => u._id === fId);
          return friend ? {
            _id: friend._id,
            username: friend.username,
            avatar: friend.avatar,
            level: friend.level,
            totalPoints: friend.totalPoints
          } : null;
        }).filter(Boolean);

        return mockResponse(200, {
          success: true,
          data: { ...user, friends: populatedFriends }
        });
      }

      // 4. GET STATS
      if (path === '/users/stats' && method === 'GET') {
        if (!token) return mockResponse(401, { success: false, message: 'Not authorized' });
        const users = getUsers();
        const user = users.find(u => u._id === token);
        if (!user) return mockResponse(401, { success: false, message: 'Not authorized' });

        const xpNeeded = user.level * 300;
        const winRate = user.gamesPlayed > 0 ? Math.round((user.wins / user.gamesPlayed) * 100) : 0;

        return mockResponse(200, {
          success: true,
          data: {
            gamesPlayed: user.gamesPlayed,
            wins: user.wins,
            losses: user.losses,
            winRate,
            totalPoints: user.totalPoints,
            level: user.level,
            xp: user.xp,
            xpNeeded,
            bestStreak: user.bestStreak,
            currentStreak: user.currentStreak,
            highestDiceRollCount: user.highestDiceRollCount,
            ladderClimbs: user.ladderClimbs,
            snakeEscapes: user.snakeEscapes,
            achievementsCount: user.achievements.length
          }
        });
      }

      // 5. UPDATE PROFILE
      if (path === '/users/profile' && method === 'PUT') {
        if (!token) return mockResponse(401, { success: false, message: 'Not authorized' });
        const { username, avatar } = body;
        const users = getUsers();
        const user = users.find(u => u._id === token);
        if (!user) return mockResponse(404, { success: false, message: 'User not found' });

        if (username && username.trim() !== user.username) {
          if (users.some(u => u.username === username.trim() && u._id !== token)) {
            return mockResponse(400, { success: false, message: 'Username is already taken' });
          }
          user.username = username.trim();
        }

        if (avatar) {
          user.avatar = avatar;
        }

        saveUsers(users);

        return mockResponse(200, {
          success: true,
          data: {
            _id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            level: user.level,
            xp: user.xp,
            totalPoints: user.totalPoints
          }
        });
      }

      // 6. DAILY REWARD
      if (path === '/users/daily-reward' && method === 'POST') {
        if (!token) return mockResponse(401, { success: false, message: 'Not authorized' });
        const users = getUsers();
        const user = users.find(u => u._id === token);
        if (!user) return mockResponse(404, { success: false, message: 'User not found' });

        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;

        if (user.lastDailyRewardClaimed && (now - new Date(user.lastDailyRewardClaimed)) < oneDay) {
          return mockResponse(400, { success: false, message: 'Reward already claimed in the last 24h.' });
        }

        user.totalPoints += 50;
        user.weeklyPoints += 50;
        user.monthlyPoints += 50;
        user.xp += 150;
        user.lastDailyRewardClaimed = now.toISOString();

        // Level Up calculations
        let levelUps = 0;
        let xpNeeded = user.level * 300;
        while (user.xp >= xpNeeded) {
          user.xp -= xpNeeded;
          user.level += 1;
          levelUps++;
          xpNeeded = user.level * 300;
        }

        saveUsers(users);

        return mockResponse(200, {
          success: true,
          message: 'Daily reward claimed! +50 Points, +150 XP.',
          data: {
            totalPoints: user.totalPoints,
            level: user.level,
            xp: user.xp,
            xpNeeded,
            levelUps
          }
        });
      }

      // 7. SEARCH USERS
      if (path.startsWith('/users/search') && method === 'GET') {
        const query = urlStr.split('query=')[1] || '';
        const decodedQuery = decodeURIComponent(query);
        const users = getUsers();
        const results = users
          .filter(u => u.username.toLowerCase().includes(decodedQuery.toLowerCase()) && u._id !== token)
          .map(u => ({ _id: u._id, username: u.username, avatar: u.avatar, level: u.level, totalPoints: u.totalPoints }))
          .slice(0, 10);

        return mockResponse(200, { success: true, data: results });
      }

      // 8. ADD/REMOVE FRIEND
      if (path.startsWith('/users/friends/') && (method === 'POST' || method === 'DELETE')) {
        if (!token) return mockResponse(401, { success: false, message: 'Not authorized' });
        const friendId = path.split('/friends/')[1];
        const users = getUsers();
        const user = users.find(u => u._id === token);
        const friend = users.find(u => u._id === friendId);

        if (!user || !friend) return mockResponse(404, { success: false, message: 'User not found' });

        if (method === 'POST') {
          if (!user.friends.includes(friendId)) {
            user.friends.push(friendId);
            friend.friends.push(token);
          }
        } else {
          user.friends = user.friends.filter(fId => fId !== friendId);
          friend.friends = friend.friends.filter(fId => fId !== token);
        }

        saveUsers(users);
        return mockResponse(200, { success: true, message: 'Friendship sync success' });
      }

      // 9. LOG MATCH
      if (path === '/matches' && method === 'POST') {
        const { matchMode, players: matchPlayers, winner: matchWinner, duration, moves } = body;
        const users = getUsers();
        const matches = getMatches();

        const newMatch = {
          _id: 'match_' + Math.random().toString(36).substr(2, 9),
          matchMode,
          players: matchPlayers,
          winner: matchWinner,
          duration,
          moves,
          createdAt: new Date().toISOString()
        };

        matches.push(newMatch);
        saveMatches(matches);

        const rewardsLog = [];

        for (const p of matchPlayers) {
          if (p.userId) {
            const userObj = users.find(u => u._id === p.userId);
            if (userObj) {
              userObj.gamesPlayed += 1;
              const isWinner = p.userId === matchWinner.userId;
              let pointsEarned = 10;
              let xpEarned = 30;

              if (isWinner) {
                userObj.wins += 1;
                userObj.currentStreak += 1;
                if (userObj.currentStreak > userObj.bestStreak) {
                  userObj.bestStreak = userObj.currentStreak;
                }
                pointsEarned = 100;
                xpEarned = 200;
              } else {
                userObj.losses += 1;
                userObj.currentStreak = 0;

                if (p.rank === 2) {
                  pointsEarned = 50;
                  xpEarned = 100;
                } else if (p.rank === 3) {
                  pointsEarned = 25;
                  xpEarned = 50;
                }
              }

              userObj.totalPoints += pointsEarned;
              userObj.weeklyPoints += pointsEarned;
              userObj.monthlyPoints += pointsEarned;
              userObj.xp += xpEarned;

              if (p.ladderClimbs) userObj.ladderClimbs += p.ladderClimbs;
              if (p.snakeEscapes) userObj.snakeEscapes += p.snakeEscapes;
              if (p.rollsCount && p.rollsCount > userObj.highestDiceRollCount) {
                userObj.highestDiceRollCount = p.rollsCount;
              }

              // Level up
              let levelUps = 0;
              let xpNeeded = userObj.level * 300;
              while (userObj.xp >= xpNeeded) {
                userObj.xp -= xpNeeded;
                userObj.level += 1;
                levelUps++;
                xpNeeded = userObj.level * 300;
              }

              // Achievements check
              const unlocked = checkAchievements(userObj);

              rewardsLog.push({
                userId: userObj._id,
                username: userObj.username,
                pointsEarned,
                xpEarned,
                levelUps,
                newLevel: userObj.level,
                unlockedAchievements: unlocked
              });
            }
          }
        }

        saveUsers(users);

        return mockResponse(201, {
          success: true,
          data: newMatch,
          rewards: rewardsLog
        });
      }

      // 10. GET MY MATCHES
      if (path === '/matches/my' && method === 'GET') {
        if (!token) return mockResponse(401, { success: false, message: 'Not authorized' });
        const matches = getMatches();
        const myMatches = matches
          .filter(m => m.players.some(p => p.userId === token))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 30);

        return mockResponse(200, { success: true, data: myMatches });
      }

      // 11. GET LEADERBOARD
      if (path.startsWith('/leaderboard') && method === 'GET') {
        const category = urlStr.split('category=')[1] || 'alltime';
        const users = getUsers();
        
        let sortFn = (a, b) => b.totalPoints - a.totalPoints;
        if (category === 'weekly') {
          sortFn = (a, b) => b.weeklyPoints - a.weeklyPoints;
        } else if (category === 'monthly') {
          sortFn = (a, b) => b.monthlyPoints - a.monthlyPoints;
        } else if (category === 'daily') {
          sortFn = (a, b) => b.wins - a.wins;
        }

        const sorted = [...users].sort(sortFn).slice(0, 50);

        const rankings = sorted.map((u, index) => {
          const winRate = u.gamesPlayed > 0 ? Math.round((u.wins / u.gamesPlayed) * 100) : 0;
          let score = u.totalPoints;
          if (category === 'weekly') score = u.weeklyPoints;
          else if (category === 'monthly') score = u.monthlyPoints;
          else if (category === 'daily') score = u.wins * 10;

          return {
            rank: index + 1,
            userId: u._id,
            username: u.username,
            avatar: u.avatar,
            level: u.level,
            points: score,
            gamesPlayed: u.gamesPlayed,
            wins: u.wins,
            winRate,
            trophies: Math.floor(u.wins / 3)
          };
        });

        return mockResponse(200, { success: true, category, data: rankings });
      }

      // 12. ADMIN ALL USERS
      if (path === '/admin/users' && method === 'GET') {
        const users = getUsers();
        return mockResponse(200, { success: true, data: users });
      }

      // 13. ADMIN BAN USER
      if (path.startsWith('/admin/users/') && method === 'DELETE') {
        const userId = path.split('/admin/users/')[1];
        let users = getUsers();
        users = users.filter(u => u._id !== userId);
        saveUsers(users);
        return mockResponse(200, { success: true, message: 'Account deleted successfully' });
      }

      // 14. ADMIN RESET LEADERBOARD
      if (path === '/admin/reset-leaderboard' && method === 'POST') {
        const { type } = body;
        const users = getUsers();
        users.forEach(u => {
          if (type === 'weekly') u.weeklyPoints = 0;
          else if (type === 'monthly') u.monthlyPoints = 0;
          else if (type === 'alltime') {
            u.totalPoints = 0; u.weeklyPoints = 0; u.monthlyPoints = 0;
            u.wins = 0; u.losses = 0; u.gamesPlayed = 0;
          }
        });
        saveUsers(users);
        return mockResponse(200, { success: true, message: `Leaderboard reset for category: ${type}` });
      }

      // 15. ADMIN MATCH LOGS
      if (path === '/admin/matches' && method === 'GET') {
        const matches = getMatches();
        return mockResponse(200, { success: true, data: matches });
      }

      // 16. GET TOURNAMENTS
      if (path === '/tournaments' && method === 'GET') {
        const tourneys = getTournaments();
        return mockResponse(200, { success: true, data: tourneys });
      }

      // 17. CREATE TOURNAMENT
      if (path === '/tournaments' && method === 'POST') {
        if (!token) return mockResponse(401, { success: false, message: 'Not authorized' });
        const { title, description, entryFee, maxPlayers } = body;
        const tourneys = getTournaments();
        const users = getUsers();
        const creatorUser = users.find(u => u._id === token);

        const newTourney = {
          _id: 'tourney_' + Math.random().toString(36).substr(2, 9),
          title,
          description: description || '',
          entryFee: parseInt(entryFee) || 0,
          prizePool: parseInt(entryFee) || 0,
          maxPlayers: parseInt(maxPlayers) || 8,
          status: 'upcoming',
          creator: token,
          participants: creatorUser ? [{
            user: token,
            username: creatorUser.username,
            avatar: creatorUser.avatar,
            points: 0,
            wins: 0,
            matchesPlayed: 0
          }] : [],
          createdAt: new Date().toISOString()
        };

        tourneys.push(newTourney);
        saveTournaments(tourneys);
        return mockResponse(201, { success: true, data: newTourney });
      }

      // 18. JOIN TOURNAMENT
      if (path.startsWith('/tournaments/') && path.endsWith('/join') && method === 'POST') {
        if (!token) return mockResponse(401, { success: false, message: 'Not authorized' });
        const tId = path.split('/tournaments/')[1].split('/join')[0];
        const tourneys = getTournaments();
        const t = tourneys.find(tr => tr._id === tId);

        if (!t) return mockResponse(404, { success: false, message: 'Tournament not found' });
        if (t.status !== 'upcoming') return mockResponse(400, { success: false, message: 'Tournament already started or completed' });
        if (t.participants.length >= t.maxPlayers) return mockResponse(400, { success: false, message: 'Tournament is full' });

        const alreadyJoined = t.participants.some(p => p.user === token);
        if (alreadyJoined) return mockResponse(400, { success: false, message: 'You have already joined' });

        const users = getUsers();
        const userObj = users.find(u => u._id === token);
        if (!userObj) return mockResponse(404, { success: false, message: 'User not found' });

        if (t.entryFee > 0) {
          if (userObj.totalPoints < t.entryFee) {
            return mockResponse(400, { success: false, message: `Insufficient points. Need ${t.entryFee} points.` });
          }
          userObj.totalPoints -= t.entryFee;
          saveUsers(users);
          t.prizePool += t.entryFee;
        }

        t.participants.push({
          user: token,
          username: userObj.username,
          avatar: userObj.avatar,
          points: 0,
          wins: 0,
          matchesPlayed: 0
        });

        saveTournaments(tourneys);
        return mockResponse(200, { success: true, data: t });
      }

      // 19. CONTRIBUTE TO PRIZE POOL
      if (path.startsWith('/tournaments/') && path.endsWith('/contribute') && method === 'POST') {
        if (!token) return mockResponse(401, { success: false, message: 'Not authorized' });
        const tId = path.split('/tournaments/')[1].split('/contribute')[0];
        const { amount } = body;
        const tourneys = getTournaments();
        const t = tourneys.find(tr => tr._id === tId);

        if (!t) return mockResponse(404, { success: false, message: 'Tournament not found' });
        if (t.status === 'completed') return mockResponse(400, { success: false, message: 'Tournament is completed' });

        const users = getUsers();
        const userObj = users.find(u => u._id === token);
        if (!userObj) return mockResponse(404, { success: false, message: 'User not found' });

        if (userObj.totalPoints < amount) {
          return mockResponse(400, { success: false, message: `Insufficient points. Have ${userObj.totalPoints} points.` });
        }

        userObj.totalPoints -= amount;
        saveUsers(users);
        t.prizePool += amount;

        saveTournaments(tourneys);
        return mockResponse(200, { success: true, data: t });
      }

      // 20. START TOURNAMENT
      if (path.startsWith('/tournaments/') && path.endsWith('/start') && method === 'POST') {
        const tId = path.split('/tournaments/')[1].split('/start')[0];
        const tourneys = getTournaments();
        const t = tourneys.find(tr => tr._id === tId);

        if (!t) return mockResponse(404, { success: false, message: 'Tournament not found' });
        if (t.status !== 'upcoming') return mockResponse(400, { success: false, message: 'Tournament already started' });
        if (t.participants.length < 2) return mockResponse(400, { success: false, message: 'Need at least 2 participants' });

        t.status = 'active';
        saveTournaments(tourneys);
        return mockResponse(200, { success: true, data: t });
      }

      // 21. COMPLETE TOURNAMENT
      if (path.startsWith('/tournaments/') && path.endsWith('/complete') && method === 'POST') {
        const tId = path.split('/tournaments/')[1].split('/complete')[0];
        const tourneys = getTournaments();
        const t = tourneys.find(tr => tr._id === tId);

        if (!t) return mockResponse(404, { success: false, message: 'Tournament not found' });
        if (t.status !== 'active') return mockResponse(400, { success: false, message: 'Tournament is not active' });
        if (t.participants.length === 0) return mockResponse(400, { success: false, message: 'No participants' });

        const sorted = [...t.participants].sort((a, b) => b.points - a.points);
        const winnerPart = sorted[0];

        t.status = 'completed';
        t.winner = {
          user: winnerPart.user,
          username: winnerPart.username
        };

        if (winnerPart.user && t.prizePool > 0) {
          const users = getUsers();
          const winnerUserObj = users.find(u => u._id === winnerPart.user);
          if (winnerUserObj) {
            winnerUserObj.totalPoints += t.prizePool;
            winnerUserObj.weeklyPoints += t.prizePool;
            winnerUserObj.monthlyPoints += t.prizePool;
            saveUsers(users);
          }
        }

        saveTournaments(tourneys);
        return mockResponse(200, { success: true, data: t });
      }

      // Fallback
      return mockResponse(404, { success: false, message: `Mock route not found: ${path}` });

    } catch (err) {
      console.error('[API Interceptor Mock Error]', err);
      return mockResponse(500, { success: false, message: 'Local Mock Database error: ' + err.message });
    }
  };
};

const mockResponse = (status, data) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: new Headers({ 'Content-Type': 'application/json' })
  });
};
