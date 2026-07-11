import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const UserSchema = new mongoose.Schema({
  email: String,
  googleAccessToken: String,
  googleRefreshToken: String
});

const User = mongoose.model('User', UserSchema);

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await User.find({});
  console.log('--- USER GOOGLE STATUS ---');
  users.forEach(u => {
    console.log(`Email: ${u.email}`);
    console.log(`Has Access Token: ${!!u.googleAccessToken}`);
    console.log(`Has Refresh Token: ${!!u.googleRefreshToken}`);
    console.log('---');
  });
  await mongoose.disconnect();
}

check();
