const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const dotenv = require('dotenv');
const crypto = require('crypto');
const path = require('path');
const router = require('./routes/router');
const cookieParser = require('cookie-parser');

// Load environment variables from .env file
dotenv.config();


const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:4200', // Use environment variable for production
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  optionsSuccessStatus: 204,
};

// Middleware
app.use(cors(corsOptions));
app.use(cookieParser());

// Generate a secret key for session management
const secretKey = process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex');
app.use(
  session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set secure to true if using HTTPS in production
  })
);

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Static file serving (for images, uploads, etc.)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, '/views/uploads')));
app.use('/views/user-images', express.static(path.join(__dirname, '/views/user-images')));

// MongoDB connection - using local or Atlas based on environment

const mongoURI = process.env.NODE_ENV === 'production' 
  ? process.env.MONGODB_URI_ATLAS 
  : process.env.MONGODB_URI_LOCAL;

mongoose.set('strictQuery', false);

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

// MongoDB connection events
db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define your routes here
app.use('/api', router);

// Serve Angular frontend (production build)
// app.use(express.static(path.join(__dirname, 'dist/your-angular-app')));
// app.use(express.static(path.join(__dirname, 'vahan-contact/browser/index.html')));


// Catch-all route to serve Angular's index.html for client-side routing
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'dist/your-angular-app/index.html'));
// });

// Only when code live
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'dist/news-portal/index.html'));
// });

app.use(express.static(path.join(__dirname, "vahan-contact/browser")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "vahan-contact/browser/index.html"));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
