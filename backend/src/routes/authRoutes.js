const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, name, storeName, description } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Create User (In production, hash password using bcrypt!)
    const user = await prisma.user.create({
      data: {
        email,
        password, // TODO: hash password
        role,
        name,
      },
    });

    // If tenant, create TenantProfile
    if (role === 'TENANT') {
      await prisma.tenantProfile.create({
        data: {
          userId: user.id,
          storeName: storeName || `${name}'s Store`,
          description: description || '',
          isOpen: true,
        },
      });
    }

    res.status(201).json({ message: 'User created successfully', user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        tenantProfile: true, // include tenant profile if any
      }
    });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // In production, generate JWT token here
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        tenantId: user.tenantProfile?.id // expose tenantId if user is tenant
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

module.exports = router;
