const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

// Create a new order
router.post('/', async (req, res) => {
  try {
    const { studentId, tenantId, items } = req.body;
    // items should be array of: { menuItemId, quantity, priceAtTime }

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    const totalAmount = items.reduce((sum, item) => sum + (item.priceAtTime * item.quantity), 0);

    const order = await prisma.order.create({
      data: {
        studentId,
        tenantId,
        totalAmount,
        items: {
          create: items.map(item => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            priceAtTime: item.priceAtTime
          }))
        }
      },
      include: {
        items: true
      }
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get orders (Could be for a student or a tenant)
router.get('/', async (req, res) => {
  try {
    const { studentId, tenantId } = req.query;
    
    let whereClause = {};
    if (studentId) whereClause.studentId = studentId;
    if (tenantId) whereClause.tenantId = tenantId;

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            menuItem: { select: { name: true } }
          }
        },
        student: { select: { name: true } },
        tenant: { select: { storeName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status (Tenant only)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body; // PENDING, PREPARING, READY, COMPLETED, CANCELLED
    
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status }
    });

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = router;
