require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Exercise = require('../models/Exercise');
const Muscle = require('../models/Muscle');
const Workout = require('../models/Workout');
const Reward = require('../models/Reward');

const exercises = [
  // BICEPS
  {
    name: 'Barbell Curl',
    targetMuscle: 'Biceps',
    difficulty: 'Beginner',
    equipment: 'Barbell',
    instructions: {
      en: 'Stand upright holding a barbell with an underhand grip. Curl the bar up towards your chest, squeezing your biceps at the top. Lower slowly. Repeat for 3 sets of 10-12 reps.',
      te: 'నిటారుగా నిలబడి బార్‌బెల్‌ని అండర్‌హ్యాండ్ గ్రిప్‌తో పట్టుకోండి. బార్‌ని మీ ఛాతీ వైపు కర్ల్ చేయండి, పై భాగంలో మీ బైసెప్స్‌ని నొక్కండి. నెమ్మదిగా దించండి. 3 సెట్లు 10-12 రెప్స్ పునరావృతం చేయండి.'
    },
    youtubeUrl: 'https://www.youtube.com/watch?v=kwG2ipFRgfo',
    caloriesPerMin: 7
  },
  {
    name: 'Hammer Curl',
    targetMuscle: 'Biceps',
    difficulty: 'Beginner',
    equipment: 'Dumbbells',
    instructions: {
      en: 'Hold two dumbbells with a neutral (hammer) grip, palms facing each other. Curl both dumbbells up simultaneously while keeping elbows close to the body. Lower slowly.',
      te: 'రెండు డంబెల్స్‌ని న్యూట్రల్ (హ్యామర్) గ్రిప్‌తో పట్టుకోండి. రెండు డంబెల్స్‌ని ఒకేసారి పైకి కర్ల్ చేయండి. నెమ్మదిగా దించండి.'
    },
    youtubeUrl: 'https://www.youtube.com/watch?v=zC3nLlEvin4',
    caloriesPerMin: 6
  },
  {
    name: 'Concentration Curl',
    targetMuscle: 'Biceps',
    difficulty: 'Intermediate',
    equipment: 'Dumbbell',
    instructions: {
      en: 'Sit on a bench, lean forward and brace your elbow against your inner thigh. Curl the dumbbell up toward your shoulder, squeezing at the top. Lower slowly and repeat.',
      te: 'బెంచ్‌పై కూర్చుని ముందుకు వంగి మీ మోచేతిని లోపలి తొడపై ఆనించండి. డంబెల్‌ని మీ భుజం వైపు కర్ల్ చేయండి. నెమ్మదిగా దించి పునరావృతం చేయండి.'
    },
    youtubeUrl: 'https://www.youtube.com/watch?v=Jvj2wV0vOYU',
    caloriesPerMin: 6
  },
  // TRICEPS
  {
    name: 'Tricep Dips',
    targetMuscle: 'Triceps',
    difficulty: 'Beginner',
    equipment: 'Parallel Bars / Chair',
    instructions: {
      en: 'Place hands on parallel bars or a chair behind you. Lower your body by bending your elbows to 90 degrees. Push back up to starting position. Keep elbows pointing back, not out.',
      te: 'సమాంతర బార్‌లపై లేదా వెనుక ఉన్న కుర్చీపై చేతులు ఉంచండి. మీ మోచేతులను 90 డిగ్రీలకు వంచి శరీరాన్ని దించండి. ప్రారంభ స్థానానికి తిరిగి నెట్టండి.'
    },
    youtubeUrl: 'https://www.youtube.com/watch?v=0326dy_-CzM',
    caloriesPerMin: 8
  },
  {
    name: 'Skull Crushers',
    targetMuscle: 'Triceps',
    difficulty: 'Intermediate',
    equipment: 'Barbell / EZ Bar',
    instructions: {
      en: 'Lie on a bench holding a barbell with an overhand grip. Lower the bar to your forehead by bending elbows. Extend elbows to raise the bar back up. Keep upper arms stationary throughout.',
      te: 'బెంచ్‌పై పడుకుని బార్‌బెల్‌ని ఓవర్‌హ్యాండ్ గ్రిప్‌తో పట్టుకోండి. మోచేతులు వంచి బార్‌ని నుదుటికి దించండి. మోచేతులు సాచి బార్‌ని పైకి ఎత్తండి.'
    },
    youtubeUrl: 'https://www.youtube.com/watch?v=d_KZxkY_0cM',
    caloriesPerMin: 7
  },
  {
    name: 'Tricep Pushdown',
    targetMuscle: 'Triceps',
    difficulty: 'Beginner',
    equipment: 'Cable Machine',
    instructions: {
      en: 'Stand in front of a cable machine with a rope or bar attachment. Push the attachment straight down until arms are fully extended. Slowly return to start. Keep elbows tucked at sides.',
      te: 'కేబుల్ మెషీన్ ముందు నిలబడండి. అటాచ్‌మెంట్‌ని చేతులు పూర్తిగా సాగే వరకు నేరుగా కిందికి నెట్టండి. నెమ్మదిగా తిరిగి మొదటి స్థానానికి వెళ్ళండి.'
    },
    youtubeUrl: 'https://www.youtube.com/watch?v=2-LAMcpzODU',
    caloriesPerMin: 6
  },
  // CHEST
  {
    name: 'Push-Ups',
    targetMuscle: 'Chest',
    difficulty: 'Beginner',
    equipment: 'No Equipment',
    instructions: {
      en: 'Start in a plank position with hands shoulder-width apart. Lower your chest to the ground by bending your elbows. Push back up. Keep your body in a straight line throughout the movement.',
      te: 'చేతులు భుజాల వెడల్పుతో ప్లాంక్ స్థానంలో ప్రారంభించండి. మోచేతులు వంచి ఛాతీని నేలకు దించండి. తిరిగి నెట్టుకోండి. శరీరం పూర్తి కదలికలో నేరుగా ఉండాలి.'
    },
    youtubeUrl: 'https://www.youtube.com/watch?v=_l3ySVKYVJ8',
    caloriesPerMin: 7
  },
  {
    name: 'Barbell Bench Press',
    targetMuscle: 'Chest',
    difficulty: 'Intermediate',
    equipment: 'Barbell, Bench',
    instructions: {
      en: 'Lie flat on a bench. Grip the barbell wider than shoulder-width. Lower the bar to your mid-chest, then press it back up explosively. Keep feet flat on the floor and back slightly arched.',
      te: 'బెంచ్‌పై చదునుగా పడుకోండి. బార్‌బెల్‌ని భుజాల వెడల్పు కంటే వెడల్పుగా పట్టుకోండి. బార్‌ని ఛాతీకి దించి, వెనక్కి నెట్టండి. పాదాలను నేలపై చదునుగా ఉంచండి.'
    },
    youtubeUrl: 'https://www.youtube.com/watch?v=vcBig73ojpE',
    caloriesPerMin: 8
  },
  {
    name: 'Incline Dumbbell Press',
    targetMuscle: 'Chest',
    difficulty: 'Intermediate',
    equipment: 'Dumbbells, Incline Bench',
    instructions: {
      en: 'Set bench to 30-45 degrees. Hold dumbbells at shoulder level. Press them up and slightly together. Lower slowly. This targets the upper chest specifically.',
      te: 'బెంచ్‌ని 30-45 డిగ్రీలకు సెట్ చేయండి. డంబెల్స్‌ని భుజాల స్థాయిలో పట్టుకోండి. వాటిని పైకి నెట్టండి. నెమ్మదిగా దించండి. ఇది ఎగువ ఛాతీని లక్ష్యంగా చేసుకుంటుంది.'
    },
    youtubeUrl: 'https://www.youtube.com/watch?v=DbFgADa2PL8',
    caloriesPerMin: 7
  },
  // BACK
  {
    name: 'Pull-Ups',
    targetMuscle: 'Back',
    difficulty: 'Intermediate',
    equipment: 'Pull-up Bar',
    instructions: {
      en: 'Hang from a bar with palms facing away, slightly wider than shoulder-width. Pull yourself up until your chin clears the bar. Lower yourself slowly. Engage your back muscles, not just arms.',
      te: 'బార్ నుండి అరచేతులు దూరంగా ఉండేలా వేలాడండి. గడ్డం బార్‌ దాటే వరకు పైకి లాగండి. నెమ్మదిగా దించండి. వీపు కండరాలను ఉపయోగించండి.'
    },
    youtubeUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
    caloriesPerMin: 9
  },
  {
    name: 'Bent-Over Row',
    targetMuscle: 'Back',
    difficulty: 'Intermediate',
    equipment: 'Barbell',
    instructions: {
      en: 'Bend forward at the hips, keeping back straight. Hold a barbell with overhand grip. Pull the barbell up to your lower chest, squeezing shoulder blades together. Lower with control.',
      te: 'నడుముపై ముందుకు వంగండి. బార్‌బెల్‌ని ఓవర్‌హ్యాండ్ గ్రిప్‌తో పట్టుకోండి. దానిని గుండె క్రిందికి లాగి భుజపు బ్లేడ్లను కలపండి. నెమ్మదిగా దించండి.'
    },
    youtubeUrl: 'https://www.youtube.com/watch?v=G8l_8chR5BE',
    caloriesPerMin: 8
  },
  // LEGS
  {
    name: 'Squats',
    targetMuscle: 'Legs',
    difficulty: 'Beginner',
    equipment: 'No Equipment',
    instructions: {
      en: 'Stand with feet shoulder-width apart. Push hips back and bend knees to lower down as if sitting in a chair. Keep chest up and knees tracking over toes. Push through heels to stand back up.',
      te: 'పాదాలను భుజాల వెడల్పులో ఉంచండి. నడుమును వెనక్కి నెట్టి మోకాళ్ళు వంచండి. ఛాతీ పైన ఉండాలి. మళ్ళీ నిలబడటానికి మడమల ద్వారా నెట్టండి.'
    },
    youtubeUrl: 'https://www.youtube.com/watch?v=YaXPRqUwItQ',
    caloriesPerMin: 8
  },
  {
    name: 'Lunges',
    targetMuscle: 'Legs',
    difficulty: 'Beginner',
    equipment: 'No Equipment',
    instructions: {
      en: 'Stand tall and step one foot forward. Lower your hips until both knees are at 90-degree angles. Push through the front heel to return to start. Alternate legs for each rep.',
      te: 'నేరుగా నిలబడి ఒక పాదం ముందుకు వేయండి. మోకాళ్ళు 90 డిగ్రీలు వంచే వరకు నడుమును దించండి. ముందు మడమ ద్వారా తిరిగి నిలబడండి. ప్రతి రెప్‌కు కాళ్ళు మారండి.'
    },
    youtubeUrl: 'https://www.youtube.com/watch?v=QOVaHwm-Q6U',
    caloriesPerMin: 7
  },
  {
    name: 'Leg Press',
    targetMuscle: 'Legs',
    difficulty: 'Beginner',
    equipment: 'Leg Press Machine',
    instructions: {
      en: 'Sit in the leg press machine. Place feet shoulder-width apart on the platform. Push the platform away by extending your knees, then slowly lower back. Do not lock knees at the top.',
      te: 'లెగ్ ప్రెస్ మెషీన్‌లో కూర్చోండి. పాదాలను ప్లాట్‌ఫామ్‌పై భుజాల వెడల్పులో ఉంచండి. మోకాళ్ళు సాచి ప్లాట్‌ఫామ్‌ని నెట్టి నెమ్మదిగా తిరిగి దించండి.'
    },
    youtubeUrl: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ',
    caloriesPerMin: 7
  },
  // SHOULDERS
  {
    name: 'Overhead Press',
    targetMuscle: 'Shoulders',
    difficulty: 'Intermediate',
    equipment: 'Barbell / Dumbbells',
    instructions: {
      en: 'Stand or sit with dumbbells at shoulder height. Press them overhead until arms are fully extended. Lower slowly. Keep core engaged and do not arch the lower back.',
      te: 'డంబెల్స్‌ని భుజాల ఎత్తుకు పట్టుకుని నిలబడండి. వాటిని పూర్తిగా పైకి నెట్టండి. నెమ్మదిగా దించండి. కోర్‌ని నిమగ్నంగా ఉంచండి.'
    },
    youtubeUrl: 'https://www.youtube.com/watch?v=2yjwXTZQDDI',
    caloriesPerMin: 7
  },
  {
    name: 'Lateral Raises',
    targetMuscle: 'Shoulders',
    difficulty: 'Beginner',
    equipment: 'Dumbbells',
    instructions: {
      en: 'Hold dumbbells at your sides with a slight bend in elbows. Raise both arms out to the sides until parallel to the floor. Lower slowly. Lead with your elbows, not hands.',
      te: 'డంబెల్స్‌ని మోచేతులు కొంచెం వంచి పక్కల దగ్గర పట్టుకోండి. రెండు చేతులు నేలకు సమాంతరంగా ఉండే వరకు పక్కలకు ఎత్తండి. నెమ్మదిగా దించండి.'
    },
    youtubeUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo',
    caloriesPerMin: 6
  },
  // FOREARMS
  {
    name: 'Wrist Curls',
    targetMuscle: 'Forearms',
    difficulty: 'Beginner',
    equipment: 'Barbell / Dumbbells',
    instructions: {
      en: 'Sit on a bench and rest forearms on your thighs with wrists hanging over the edge. Curl wrists up, squeezing the forearms. Lower slowly. Perform for 3 sets of 15 reps.',
      te: 'బెంచ్‌పై కూర్చుని మణికట్టులు అంచు మీద వేలాడేలా ముంజేతులను తొడపై ఉంచండి. మణికట్టులు పైకి కర్ల్ చేయండి. నెమ్మదిగా దించండి. 3 సెట్లు 15 రెప్స్ చేయండి.'
    },
    youtubeUrl: 'https://www.youtube.com/watch?v=QFq7tGbLPlY',
    caloriesPerMin: 5
  },
  {
    name: 'Reverse Wrist Curls',
    targetMuscle: 'Forearms',
    difficulty: 'Beginner',
    equipment: 'Barbell / Dumbbells',
    instructions: {
      en: 'Similar to wrist curls but with an overhand grip, targeting the top of the forearm (extensors). Rest forearms on thighs, curl wrists upward and lower with control.',
      te: 'రెగ్యులర్ రిస్ట్ కర్ల్స్ లాంటిదే కానీ ఓవర్‌హ్యాండ్ గ్రిప్‌తో, ముంజేయి పైభాగాన్ని లక్ష్యం చేస్తుంది. ముంజేతులు తొడపై ఉంచి, మణికట్టులు పైకి కర్ల్ చేయండి.'
    },
    youtubeUrl: 'https://www.youtube.com/watch?v=__v2WlNbRx8',
    caloriesPerMin: 5
  }
];

const workouts = [
  {
    title: 'Fat Burn Blast',
    goal: 'Fat Loss',
    difficulty: 'Beginner',
    estimatedTime: 30,
    caloriesBurned: 300,
    coinsReward: 50,
    description: 'High-intensity circuit workout to maximize calorie burn and boost metabolism.',
    isPremium: false
  },
  {
    title: 'Advanced Fat Shredder',
    goal: 'Fat Loss',
    difficulty: 'Advanced',
    estimatedTime: 45,
    caloriesBurned: 500,
    coinsReward: 80,
    description: 'Intense fat-burning workout combining compound movements for maximum results.',
    isPremium: true
  },
  {
    title: 'Muscle Builder Starter',
    goal: 'Muscle Gain',
    difficulty: 'Beginner',
    estimatedTime: 40,
    caloriesBurned: 250,
    coinsReward: 60,
    description: 'Foundation workout plan for building muscle mass with proper form.',
    isPremium: false
  },
  {
    title: 'Hypertrophy Power Program',
    goal: 'Muscle Gain',
    difficulty: 'Advanced',
    estimatedTime: 60,
    caloriesBurned: 350,
    coinsReward: 100,
    description: 'Advanced muscle building program targeting all major muscle groups.',
    isPremium: true
  },
  {
    title: 'General Fitness Starter',
    goal: 'General Fitness',
    difficulty: 'Beginner',
    estimatedTime: 25,
    caloriesBurned: 180,
    coinsReward: 40,
    description: 'A full-body beginner workout to improve overall fitness and health.',
    isPremium: false
  },
  {
    title: 'All-Round Fitness',
    goal: 'General Fitness',
    difficulty: 'Intermediate',
    estimatedTime: 45,
    caloriesBurned: 280,
    coinsReward: 70,
    description: 'Intermediate workout combining cardio and strength for balanced fitness.',
    isPremium: true
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected for seeding...');

    // Clear existing data
    await Exercise.deleteMany({});
    await Muscle.deleteMany({});
    await Workout.deleteMany({});
    await User.deleteMany({ email: 'admin@fitnesspass.com' });
    console.log('🗑️  Cleared existing seed data');

    // Insert exercises
    const insertedExercises = await Exercise.insertMany(exercises);
    console.log(`✅ Inserted ${insertedExercises.length} exercises`);

    // Group exercises by muscle and create muscle docs
    const muscleGroups = ['Biceps', 'Triceps', 'Chest', 'Back', 'Legs', 'Shoulders', 'Forearms'];
    for (const muscleGroup of muscleGroups) {
      const muscleExercises = insertedExercises.filter(e => e.targetMuscle === muscleGroup);
      await Muscle.create({
        name: muscleGroup,
        description: `Exercises targeting the ${muscleGroup} muscle group.`,
        exercises: muscleExercises.map(e => e._id)
      });
    }
    console.log(`✅ Created ${muscleGroups.length} muscle groups`);

    // Create workouts with relevant exercises
    for (const w of workouts) {
      let exerciseIds = [];
      if (w.goal === 'Fat Loss') {
        exerciseIds = insertedExercises.filter(e =>
          ['Legs', 'Chest', 'Back'].includes(e.targetMuscle)
        ).slice(0, 4).map(e => e._id);
      } else if (w.goal === 'Muscle Gain') {
        exerciseIds = insertedExercises.filter(e =>
          ['Biceps', 'Triceps', 'Chest', 'Shoulders'].includes(e.targetMuscle)
        ).slice(0, 4).map(e => e._id);
      } else {
        exerciseIds = insertedExercises.slice(0, 5).map(e => e._id);
      }
      await Workout.create({ ...w, exercises: exerciseIds });
    }
    console.log(`✅ Created ${workouts.length} workout plans`);

    // Create admin user
    const hashedPwd = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@fitnesspass.com',
      password: hashedPwd,
      role: 'admin',
      fitnessGoal: 'General Fitness',
      subscription: { plan: 'premium', status: 'active' }
    });
    await Reward.create({ userId: admin._id });
    console.log('✅ Admin user created: admin@fitnesspass.com / admin123');

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
