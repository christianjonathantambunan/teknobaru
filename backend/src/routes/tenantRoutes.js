const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

// Get all open tenants
router.get('/', async (req, res) => {
  try {
    const tenants = await prisma.tenantProfile.findMany({
      where: { isOpen: true },
      include: {
        user: {
          select: { name: true }
        }
      }
    });
    res.json(tenants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch tenants' });
  }
});

// Get specific tenant details
router.get('/:id', async (req, res) => {
  try {
    const tenant = await prisma.tenantProfile.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { name: true } }
      }
    });

    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
    res.json(tenant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch tenant' });
  }
});

// Get menu for a tenant
router.get('/:id/menu', async (req, res) => {
  try {
    const menuCategories = await prisma.menuCategory.findMany({
      where: { tenantId: req.params.id },
      include: {
        items: {
          where: { isAvailable: true }
        }
      }
    });
    res.json(menuCategories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

module.exports = router;
