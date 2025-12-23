require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }))
app.use(express.json())
app.use(cookieParser())

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/buildconnect', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err))

// Booking Schema
const bookingSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  serviceType: { type: String, required: true },
  projectDetails: { type: String, required: true },
  preferredDate: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  amount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
})

const Booking = mongoose.model('Booking', bookingSchema)

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'BuildConnect API is running', status: 'active' })
})

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body
    
    // Demo authentication (replace with real DB check)
    if (username === 'admin' && password === 'buildconnect2025') {
      const token = jwt.sign({ username, role: 'admin' }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' })
      res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 })
      return res.json({ success: true, role: 'admin', message: 'Login successful' })
    }
    
    res.status(401).json({ success: false, message: 'Invalid credentials' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// Admin Stats
app.get('/api/admin/stats', (req, res) => {
  res.json({
    totalBookings: 156,
    totalRevenue: 45680,
    activeWorkers: 24,
    pendingRequests: 8
  })
})

// Bookings endpoints
app.get('/api/bookings', (req, res) => {
  res.json([
    { id: 1, user: 'John Doe', service: 'Plumbing', date: '2024-12-15', status: 'Completed', amount: 2500 },
    { id: 2, user: 'Jane Smith', service: 'Electrical', date: '2024-12-14', status: 'Pending', amount: 3200 }
  ])
})

// Create new booking
app.post('/api/bookings', async (req, res) => {
  try {
    const { fullName, email, phone, serviceType, projectDetails, preferredDate } = req.body
    
    const newBooking = new Booking({
      fullName,
      email,
      phone,
      serviceType,
      projectDetails,
      preferredDate,
      status: 'Pending',
      amount: 0
    })
    
    const savedBooking = await newBooking.save()
    res.json({ success: true, booking: savedBooking })
  } catch (error) {
    console.error('Error creating booking:', error)
    res.status(500).json({ success: false, message: 'Failed to create booking' })
  }
})

// Get user's bookings
app.get('/api/bookings/my', async (req, res) => {
  try {
    const { email } = req.query
        const query = email ? { email } : {}
    
    const bookings = await Booking.find(query }).sort({ createdAt: -1 })
    res.json({ bookings })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' })
  }
})

// Services endpoints
app.get('/api/services', (req, res) => {
  res.json([
    { id: 1, name: 'Plumbing', category: 'Home Services', rating: 4.8, bookings: 45 },
    { id: 2, name: 'Electrical', category: 'Home Services', rating: 4.6, bookings: 38 }
  ])
})

// Workers endpoints
app.get('/api/workers', (req, res) => {
  res.json([
    { id: 1, name: 'Raj Kumar', service: 'Plumbing', rating: 4.8, jobs: 120 },
    { id: 2, name: 'Amit Singh', service: 'Electrical', rating: 4.7, jobs: 95 }
  ])
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
