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
