const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Login = require('../model/loginModel')
// const bcrypt = require('bcrypt');
const bcrypt = require("bcryptjs");
const User = require('../model/user')


const SECRET = crypto.randomBytes(32).toString('hex');;

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Login.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }


    const isMatch = await bcrypt.compare(password, user.password);


    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 86400000
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
};


exports.userLogin = async (req, res) => {
  const { phone, password } = req.body;

  const user = await User.findOne({ phone });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid password' });
  }

  const token = jwt.sign(
    { userId: user._id },
    SECRET,
    { expiresIn: '1d' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'strict'
  });

  res.json({ user });
};

exports.me = async (req, res) => {

  console.log('Cookies:', req.cookies);

  const token = req.cookies.token;

  console.log('Token:', token);

  if (!token) {
    return res.status(401).json({
      authenticated: false,
      message: 'No token'
    });
  }

  try {

    const decoded = jwt.verify(token, SECRET);

    console.log('Decoded:', decoded);

    const user = await User.findById(decoded.userId);

    console.log('User:', user);

    res.json({
      authenticated: true,
      user
    });

  } catch (err) {

    console.log('JWT ERROR:', err.message);

    res.status(401).json({
      authenticated: false,
      error: err.message
    });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
};