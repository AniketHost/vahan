const QrCode = require('../model/qrCode');
const User = require('../model/user');
const Login = require('../model/loginModel');

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const jwtSecretKey = crypto.randomBytes(32).toString('hex');
const bcrypt = require('bcrypt');
const express = require('express');


// exports.registerUser = async (req, res) => {
//   const { name, phone, email,password } = req.body;

//   if (!name || !phone || !qrId) {
//     return res.status(400).json({ message: 'Missing fields' });
//   }

//   try {
//     const qr = await QrCode.findOne({ qrId });

//     if (!qr) {
//       return res.status(404).json({ message: 'Invalid QR' });
//     }

//     if (qr.status === 'used') {
//       return res.status(400).json({ message: 'QR already used' });
//     }

//     await User.create({ name, phone, qrId });

//     qr.status = 'used';
//     await qr.save();

//     res.status(200).json({ message: 'Registration successful' });
//   } catch (err) {
//     res.status(500).json({ message: 'Registration failed' });
//   }
// };


exports.registerUser = async (req, res) => {

  const { userName, phone, password, qrId, email } = req.body;



  if (!userName || !phone || !password || !qrId || !email) {
    return res.status(400).json({
      error: 'Missing required fields'
    });
  }

  try {

    // 1️⃣ Find QR
    const qr = await QrCode.findOne({ qrId });

    if (!qr) {
      return res.status(404).json({
        error: 'Invalid QR'
      });
    }

    // 2️⃣ Check already used
    if (qr.status === 'used') {
      return res.status(400).json({
        error: 'QR already used'
      });
    }

    // 3️⃣ Check phone already exists
    const existingUser = await User.findOne({ phone });

    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists'
      });
    }

    // 4️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5️⃣ Create user
    const user = await User.create({
      userName,
      phone,
      password: hashedPassword,
      qrId,
      email
    });

    // 6️⃣ Link QR → User
    qr.status = 'used';
    qr.user = user._id;

    await qr.save();

    // 7️⃣ Response
    res.status(201).json({
      message: 'Registration successful',
      user: {
        userName: user.userName,
        phone: user.phone,
        qrId: user.qrId,
        email
      }
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Internal server error'
    });
  }

};



exports.registerAdmin = async (req, res) => {



  const { userId, password, email, userName, phone } = req.body;

  console.log("--------", { userId, password, email, userName, phone });

  // ✅ Validate
  if (!userId || !password || !email || !userName || !phone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const normalizedUserName = userName.trim().toLowerCase();

  try {

    // ✅ Check if userId already exists
    const existingUser = await Login.findOne({ userId });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // ✅ Count users (better than fetching all)
    const userCount = await Login.countDocuments();

    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser;

    if (userCount === 0) {

      newUser = new Login({
        userId,
        password: hashedPassword,
        email,
        phone,
        userName: normalizedUserName,
        isPrimary: true,
        isAdmin: true
      });

      await newUser.save();

      return res.status(201).json({
        message: 'Primary admin created successfully'
      });

    }

    // 🔐 OTHER USERS → ONLY ADMIN (created by primary ideally)
    newUser = new Login({
      userId,
      password: hashedPassword,
      email,
      phone,
      userName: normalizedUserName,
      isPrimary: false,
      isAdmin: true
    });

    await newUser.save();

    return res.status(201).json({
      message: 'Admin user created successfully'
    });

  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}