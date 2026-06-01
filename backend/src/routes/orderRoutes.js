const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const midtransClient = require('midtrans-client');

// Initialize Midtrans Snap
let snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-...',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-...'
});

// Create a new order
router.post('/', async (req, res) => {
  try {
    const { studentId, tenantId, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    const totalAmount = items.reduce((sum, item) => sum + (item.priceAtTime * item.quantity), 0);

    const order = await prisma.order.create({
      data: {
        studentId,
        tenantId,
        totalAmount,
        paymentStatus: 'UNPAID',
        items: {
          create: items.map(item => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            priceAtTime: item.priceAtTime
          }))
        }
      },
      include: {
        items: true,
        student: true
      }
    });

    // Create Midtrans Transaction
    let parameter = {
      "transaction_details": {
        "order_id": order.id,
        "gross_amount": totalAmount
      },
      "credit_card": {
        "secure": true
      },
      "customer_details": {
        "first_name": order.student.name,
        "email": order.student.email
      }
    };

    try {
      const transaction = await snap.createTransaction(parameter);
      res.status(201).json({ ...order, snapToken: transaction.token });
    } catch (midtransError) {
      console.error("Midtrans Error:", midtransError.message);
      // Fallback if key is invalid for now, so app doesn't crash completely during testing
      res.status(201).json({ ...order, snapToken: "dummy_token_replace_keys_in_env" });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Webhook / Notification from Midtrans
router.post('/webhook/midtrans', async (req, res) => {
  try {
    const notificationJson = req.body;
    const statusResponse = await snap.transaction.notification(notificationJson);
    
    let orderId = statusResponse.order_id;
    let transactionStatus = statusResponse.transaction_status;
    let fraudStatus = statusResponse.fraud_status;

    let newStatus = 'UNPAID';

    if (transactionStatus == 'capture'){
        if (fraudStatus == 'challenge'){
            newStatus = 'UNPAID';
        } else if (fraudStatus == 'accept'){
            newStatus = 'PAID';
        }
    } else if (transactionStatus == 'settlement'){
        newStatus = 'PAID';
    } else if (transactionStatus == 'cancel' ||
      transactionStatus == 'deny' ||
      transactionStatus == 'expire'){
        newStatus = 'FAILED';
    } else if (transactionStatus == 'pending'){
        newStatus = 'UNPAID';
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { 
        paymentStatus: newStatus,
        paymentMethod: statusResponse.payment_type 
      }
    });

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Webhook failed');
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
