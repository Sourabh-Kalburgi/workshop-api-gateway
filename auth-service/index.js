const express = require('express')
const jwt = require('jsonwebtoken')

const app = express()
app.use(express.json())

const PORT = 4500
const JWT_SECRET = '+]pk!vU!m;XD^(nA}oayU?.4ZXn^V6Ko}gkkYeGahUS'


const users = [
  { username: 'tejas', password: 'password', role: 'admin' },
  { username: 'rahul', password: 'password', role: 'viewer' }
]

app.post('/login', (req, res) => {
  const { username, password } = req.body
  const user = users.find(u => u.username === username && u.password === password)
  if (!user) return res.status(401).json({ error: 'User not found...' })
  const payload = { username: user.username, role: user.role }
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' })
  res.status(200).json({ token: token, username: payload.username, role: payload.role })
})

app.post('/verify', (req, res) => {
  const { authorization: bearerToken } = req.headers
  if (!bearerToken || !bearerToken.startsWith('Bearer ')) {
    return res.json({ valid: false })
  }
  const token = bearerToken.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    res.json({ valid: true, payload: decoded })
  } catch (err) {
    res.json({ valid: false })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})