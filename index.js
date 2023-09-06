const express = require('express');
//const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const twilio = require('twilio');
const otpGenerator = require('otp-generator');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

const accountSid = process.env.account_Sid ;
const authToken = process.env.auth_Token;
const client = require('twilio')(accountSid, authToken);



const otpStore = {};

// MongoDB connection setup
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Create a schema and model for the user
const userSchema = new mongoose.Schema({
  fullname: String,
  email: {
    type: String,
    unique: true,
  },
  mobile: String,
  password: String,
  confirmedpassword: String,
});

const User = mongoose.model('User', userSchema);

// Signup endpoint
app.post('/signup', async (req, res) => {
  const { fullname, email, mobile, password, confirmedpassword } = req.body;

  try {
    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Check if the passwords match
    if (password !== confirmedpassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    

    // Create a new user and save it to the database
    const newUser = new User({
      fullname,
      email,
      mobile,
      password: hashedPassword,
      confirmedpassword: hashedPassword
    });

    await newUser.save();
    

    res.status(201).json({ message: 'Signup successful' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the email exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Email not found' });
    }

    // Compare the entered password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send OTP endpoint
app.post('/send-otp', async (req, res) => {
  const { mobile } = req.body;

  const formattedMobile = '+91' + mobile; // Add the country code

  try {
    // Generate a random OTP (6-digit code)
    const otp = otpGenerator.generate(6, {digits: true, upperCase: false, specialChars: false });

    // Store the OTP and associated mobile
    otpStore[mobile] = otp;

    // Send OTP via Twilio SMS
    await client.messages.create({
      body: `Your Mentor OTP is: ${otp}`,
      from: '+17068082864', // Replace with your Twilio phone number
      to: formattedMobile,
    });

    console.log('OTP sent via Twilio');

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Error sending OTP' });
  }
});

// Verify OTP endpoint
app.post('/verify-otp', async (req, res) => {
  const { mobile, otp } = req.body;

  try {
    // Check if the mobile number is associated with a user
    const user = await User.findOne({ mobile });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify the OTP
    const storedOtp = otpStore[mobile];

    if (storedOtp !== undefined && storedOtp === otp) {
      // Clear the OTP from the store after successful verification
      delete otpStore[mobile];

      res.status(200).json({ message: 'OTP verified successfully' });
    } else {
      res.status(400).json({ error: 'Incorrect OTP' });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/reset-password', async (req, res) => {
  const { email, password, newPassword } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Compare the entered password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Hash the new password before updating it in the database
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

//module.exports.handler = serverless(app);
















