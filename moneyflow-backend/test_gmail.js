import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { syncSubscriptionsFromGmail } from './services/gmail.js';
dotenv.config();

const UserSchema = new mongoose.Schema({
  email: String,
  googleAccessToken: String,
  googleRefreshToken: String
});

const User = mongoose.model('User', UserSchema);

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email: 'pavannagesh681@gmail.com' });
  if (!user || !user.googleAccessToken) {
    console.log('User not found or no tokens');
    return;
  }

  console.log('Testing Gmail Sync for:', user.email);
  try {
    const pending = await syncSubscriptionsFromGmail(user.googleAccessToken, user.googleRefreshToken);
    console.log('Sync Success! Pending items:', pending.length);
  } catch (err) {
    console.log('Sync Failed.');
  } finally {
    await mongoose.disconnect();
  }
}

test();
