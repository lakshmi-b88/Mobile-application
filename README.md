// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const bcrypt = require('bcrypt');
// const mongoose = require('mongoose');
// const twilio = require('twilio');

// const app = express();
// const port = process.env.PORT || 5000;

// // Middleware
// app.use(bodyParser.json());
// app.use(cors());

// // Twilio setup
// const accountSid = 'ACe8ee2275d1d0ce5eb37bda4d339991d8';
// const authToken = '40b9f42232d29ac69af6f8e0e2bfe55a';
// // Create a Twilio client instance
// const client = new twilio(accountSid, authToken);

// const otpStore = {};

// // MongoDB connection setup
// mongoose
//   .connect('mongodb://127.0.0.1:27017/reactnativesignup?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.8.0', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log('Connected to MongoDB'))
//   .catch((err) => console.error('MongoDB connection error:', err));

// // Create a schema and model for the user
// const userSchema = new mongoose.Schema({
//   fullname: String,
//   email: {
//     type: String,
//     unique: true,
//   },
//   mobile: String,
//   password: String,
//   confirmedpassword: String,
// });

// const User = mongoose.model('User', userSchema);

// // Signup endpoint
// app.post('/signup', async (req, res) => {
//   const { fullname, email, mobile, password, confirmedpassword } = req.body;

//   try {
//     // Check if the email already exists in the database
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(409).json({ error: 'Email already exists' });
//     }

//     // Check if the passwords match
//     if (password !== confirmedpassword) {
//       return res.status(400).json({ error: 'Passwords do not match' });
//     }
    

//     // Hash the password before saving it to the database
//     const hashedPassword = await bcrypt.hash(password, 10);

    

//     // Create a new user and save it to the database
//     const newUser = new User({
//       fullname,
//       email,
//       mobile,
//       password: hashedPassword,
//       confirmedpassword: hashedPassword
//     });

//     await newUser.save();
    

//     res.status(201).json({ message: 'Signup successful' });
//   } catch (error) {
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Login endpoint
// app.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Check if the email exists in the database
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ error: 'Email not found' });
//     }

//     // Compare the entered password with the hashed password in the database
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({ error: 'Invalid password' });
//     }

//     res.status(200).json({ message: 'Login successful' });
//   } catch (error) {
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Send OTP endpoint
// app.post('/send-otp', async (req, res) => {
//   const { mobile, email } = req.body;

//   const formattedMobile = '+91' + mobile; // Add the country code

//   try {
//     // Generate a random OTP (6-digit code)
//     const otp = Math.floor(1000 + Math.random() * 9000);

//     // Store the OTP and associated mobile/email
//   otpStore[mobile || email] = otp;

//     // Send OTP via Twilio SMS
//     const message = await client.messages.create({
//       body: `Your OTP is: ${otp}`,
//       from: '+17068082864', // Replace with your Twilio phone number
//       to: formattedMobile,              // Use the properly formatted phone number
//     });

//     console.log('OTP sent:', message.sid);

//     // Save the OTP in the user's document in the database (you can modify this as needed)
//     const user = await User.findOne({ mobile });
//     if (user) {
//       user.otp = otp;
//       await user.save();
//     }

//     res.status(200).json({ message: 'OTP sent successfully' });
//   } catch (error) {
//     console.error('Error sending OTP:', error);
//     res.status(500).json({ error: 'Error sending OTP' });
//   }
// });


// app.post('/verify-otp', async (req, res) => {
//   const { mobile,  otp } = req.body;

//   try {
//     // Check if the mobile number is associated with a user
//     const user = await User.findOne({ mobile });

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     // Verify the OTP using Twilio
//     const verificationResult = await client.verify
//       .services('VAff040937ecbca623e312778037ca6fb4')
//       .verificationChecks.create({ to: mobile, code: otp });

//     if (verificationResult.status === 'approved') {
//       // Clear the OTP field in the user's document
//       user.otp = null;
//       await user.save();

//       res.status(200).json({ message: 'OTP verified successfully' });
//     } else {
//       res.status(400).json({ error: 'Incorrect OTP' });
//     }
//   } catch (error) {
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });



// // Start the server
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });
