/**
 * Seed script — creates demo admin, organizer, user accounts + sample events
 * Run: node seed.js
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Event from './models/Event.js';

dotenv.config();

const seed = async () => {
  await connectDB();

  await User.deleteMany({});
  await Event.deleteMany({});

  // Create users
  const [admin, organizer, user] = await User.create([
    { name: 'Admin User', email: 'admin@demo.com', password: 'password123', role: 'admin', phone: '+91 9000000001' },
    { name: 'Event Organizer', email: 'organizer@demo.com', password: 'password123', role: 'organizer', organization: 'TechEvents Inc', phone: '+91 9000000002' },
    { name: 'Demo User', email: 'user@demo.com', password: 'password123', role: 'user', organization: 'JNTU Hyderabad', phone: '+91 9000000003' },
  ]);

  const now = new Date();
  const future = (days) => new Date(now.getTime() + days * 86400000);
  const past = (days) => new Date(now.getTime() - days * 86400000);

  await Event.create([
    {
      title: 'ReactConf India 2024',
      description: 'The premier React and frontend development conference in India. Join 500+ developers for talks, workshops, and networking with the React community.',
      category: 'Conference',
      organizer: organizer._id,
      venue: { name: 'HICC Convention Center', address: 'Novotel Hyderabad Airport', city: 'Hyderabad', state: 'Telangana', country: 'India' },
      startDate: future(15),
      endDate: future(16),
      registrationDeadline: future(10),
      capacity: 500,
      registeredCount: 342,
      isFree: false,
      fee: 999,
      tags: ['react', 'javascript', 'frontend', 'web'],
      speakers: [
        { name: 'Narendra Singh', designation: 'Principal Engineer, Google', bio: 'React core team contributor' },
        { name: 'Priya Sharma', designation: 'VP Engineering, Razorpay', bio: '10 years in fintech frontend' },
      ],
      agenda: [
        { time: '9:00 AM', title: 'Registration & Breakfast' },
        { time: '10:00 AM', title: 'Keynote: Future of React', speaker: 'Narendra Singh' },
        { time: '11:30 AM', title: 'React Server Components Deep Dive', speaker: 'Priya Sharma' },
        { time: '2:00 PM', title: 'Performance Workshop', speaker: 'Workshop Team' },
      ],
    },
    {
      title: 'AI & ML Hackathon 2024',
      description: '48-hour hackathon challenging participants to build AI-powered solutions for real-world problems. ₹5 Lakh prize pool!',
      category: 'Hackathon',
      organizer: organizer._id,
      venue: { name: 'T-Hub', address: 'Raidurg, Cyberabad', city: 'Hyderabad', state: 'Telangana', country: 'India' },
      startDate: future(20),
      endDate: future(22),
      registrationDeadline: future(15),
      capacity: 200,
      registeredCount: 87,
      isFree: true,
      fee: 0,
      tags: ['ai', 'machine learning', 'hackathon', 'python'],
    },
    {
      title: 'Web3 & Blockchain Workshop',
      description: 'Hands-on workshop covering Ethereum, Smart Contracts, and DeFi fundamentals. Bring your laptop!',
      category: 'Workshop',
      organizer: organizer._id,
      venue: { name: 'Google for Startups', address: 'Mahadevapura', city: 'Bengaluru', state: 'Karnataka', country: 'India' },
      startDate: future(7),
      endDate: future(7),
      registrationDeadline: future(5),
      capacity: 50,
      registeredCount: 48,
      isFree: false,
      fee: 499,
      tags: ['blockchain', 'web3', 'ethereum', 'solidity'],
    },
    {
      title: 'Cloud Native Summit',
      description: 'A full-day summit on Kubernetes, Docker, and cloud-native architecture patterns. Network with DevOps leaders.',
      category: 'Conference',
      organizer: admin._id,
      venue: { name: 'ITC Grand Chola', address: 'Mount Road', city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      startDate: future(30),
      endDate: future(30),
      registrationDeadline: future(25),
      capacity: 300,
      registeredCount: 120,
      isFree: false,
      fee: 1499,
      tags: ['kubernetes', 'docker', 'devops', 'cloud'],
    },
    {
      title: 'Startup Networking Night',
      description: 'Connect with founders, investors, and startup enthusiasts in a casual evening networking event.',
      category: 'Networking',
      organizer: organizer._id,
      venue: { name: 'WeWork Galaxy', address: '43, Residency Road', city: 'Bengaluru', state: 'Karnataka', country: 'India' },
      startDate: future(5),
      endDate: future(5),
      registrationDeadline: future(3),
      capacity: 100,
      registeredCount: 67,
      isFree: true,
      fee: 0,
      tags: ['startup', 'networking', 'entrepreneurship'],
    },
    {
      title: 'Python for Data Science Bootcamp',
      description: 'Intensive 2-day bootcamp covering pandas, NumPy, matplotlib, and scikit-learn for data science beginners.',
      category: 'Workshop',
      organizer: organizer._id,
      venue: { isOnline: true, name: 'Online', city: 'Online', onlineLink: 'https://zoom.us/j/example' },
      startDate: future(10),
      endDate: future(11),
      registrationDeadline: future(8),
      capacity: 150,
      registeredCount: 95,
      isFree: false,
      fee: 799,
      tags: ['python', 'data science', 'machine learning', 'bootcamp'],
    },
  ]);

  console.log('✅ Seed completed!');
  console.log('Admin: admin@demo.com / password123');
  console.log('Organizer: organizer@demo.com / password123');
  console.log('User: user@demo.com / password123');
  mongoose.disconnect();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
