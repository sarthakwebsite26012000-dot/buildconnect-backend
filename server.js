require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://buildconnect-web-frontend.onrender.com',
      'https://buildconnect-frontend.onrender.com'
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// In-memory storage for bookings
let bookings = []
let bookingIdCounter = 1

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'BuildConnect API is running' })
})

// Get all bookings
app.get('/api/bookings', (req, res) => {
  res.json(bookings)
})

// Create new booking
app.post('/api/bookings', (req, res) => {
  try {
    const newBooking = {
      id: bookingIdCounter++,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      serviceType: req.body.serviceType,
      projectDetails: req.body.projectDetails,
      preferredDate: req.body.preferredDate,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    bookings.push(newBooking)
    res.status(201).json(newBooking)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
