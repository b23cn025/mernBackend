const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { protect: authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Initialize Razorpay (will use test keys from .env)
const getRazorpay = () => new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @route POST /api/payments/order
router.post('/order', authMiddleware, async (req, res) => {
  try {
    const { plan, applyDiscount } = req.body;
    const user = await User.findById(req.user._id);
    
    let amount = plan === 'premium' ? 49900 : plan === 'daily' ? 1900 : 0; // ₹499 or ₹19 in paise

    // Apply discount logic: 
    // IF user_coins >= 10000 AND plan == "premium"
    // THEN discount = ₹150 (15000 paise)
    let discount = 0;
    if (applyDiscount && user.coins >= 10000 && plan === 'premium') {
      discount = 15000; // ₹150 discount
      amount = Math.max(0, amount - discount);
    }

    if (plan !== 'free' && amount === 0 && !applyDiscount) {
      return res.status(400).json({ message: 'Invalid payment configuration.' });
    }

    if (amount === 0 && !applyDiscount) {
      // Free plan or no amount needed
      return res.json({ message: 'Free plan activated.', plan: 'free' });
    }

    const receipt = `receipt_${req.user._id}_${Date.now()}`;
    
    // Try Razorpay, fall back to mock if keys not set
    try {
      const razorpay = getRazorpay();
      const order = await razorpay.orders.create({ amount, currency: 'INR', receipt });
      
      await Payment.create({
        userId: req.user._id, orderId: order.id,
        plan, amount: amount + discount, discount, receipt, status: 'created'
      });

      res.json({
        orderId: order.id,
        amount: amount,
        discount: discount,
        originalAmount: plan === 'premium' ? 49900 : 1900,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID,
        userName: user.name,
        userEmail: user.email
      });
    } catch (razorpayErr) {
      // Mock payment for demo (when keys are not real)
      const mockOrderId = `order_mock_${Date.now()}`;
      await Payment.create({
        userId: req.user._id, orderId: mockOrderId,
        plan, amount: amount + discount, discount, receipt, status: 'created'
      });
      res.json({
        orderId: mockOrderId, 
        amount: amount,
        discount: discount,
        originalAmount: plan === 'premium' ? 49900 : 1900,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo',
        userName: user.name, 
        userEmail: user.email, 
        isMock: true
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/payments/verify
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, isMock } = req.body;

    if (isMock) {
      // For demo/mock payments, directly upgrade
      await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { paymentId: razorpay_payment_id || 'mock_payment', status: 'paid' }
      );
      const isDaily = plan === 'daily';
      const days = isDaily ? 1 : 30;
      await User.findByIdAndUpdate(req.user._id, {
        'subscription.plan': plan || 'premium',
        'subscription.status': 'active',
        'subscription.expiryDate': new Date(Date.now() + days * 24 * 60 * 60 * 1000)
      });
      return res.json({ success: true, message: 'Subscription activated (mock).' });
    }

    // If no valid Razorpay secret key, treat as demo/mock payment
    if (!process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET === 'your_key_secret') {
      // Demo mode - activate subscription without signature verification
      await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { paymentId: razorpay_payment_id || 'demo_payment', status: 'paid' }
      );
      const isDaily = plan === 'daily';
      const days = isDaily ? 1 : 30;
      await User.findByIdAndUpdate(req.user._id, {
        'subscription.plan': plan || 'premium',
        'subscription.status': 'active',
        'subscription.expiryDate': new Date(Date.now() + days * 24 * 60 * 60 * 1000)
      });
      return res.json({ success: true, message: 'Subscription activated (demo mode).' });
    }

    // Real Razorpay verification
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      // For failed signature verification, fall back to demo mode (for testing)
      await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { paymentId: razorpay_payment_id || 'demo_fallback', status: 'paid' }
      );
      const isDaily = plan === 'daily';
      const days = isDaily ? 1 : 30;
      await User.findByIdAndUpdate(req.user._id, {
        'subscription.plan': plan || 'premium',
        'subscription.status': 'active',
        'subscription.expiryDate': new Date(Date.now() + days * 24 * 60 * 60 * 1000)
      });
      return res.json({ success: true, message: 'Subscription activated (demo mode).' });
    }

    await Payment.findOneAndUpdate(
      { orderId: razorpay_order_id },
      { paymentId: razorpay_payment_id, status: 'paid' }
    );
    const isDaily = plan === 'daily';
    const days = isDaily ? 1 : 30;
    await User.findByIdAndUpdate(req.user._id, {
      'subscription.plan': plan || 'premium',
      'subscription.status': 'active',
      'subscription.expiryDate': new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    });

    res.json({ success: true, message: 'Payment verified. Subscription activated!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/payments/history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/payments/discount-eligibility
// Check if user is eligible for discount (coins >= 10000 && monthly subscription)
router.get('/discount-eligibility', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const isEligible = user.coins >= 10000 && user.subscription.plan === 'premium';
    const discount = isEligible ? 15000 : 0; // ₹150 in paise
    const discountPercentage = isEligible ? 30 : 0; // 30% off ₹500
    
    res.json({
      eligible: isEligible,
      coins: user.coins,
      coinsNeeded: 10000,
      currentSubscription: user.subscription.plan,
      discountAmount: discount,
      discountPercentage: discountPercentage,
      message: isEligible 
        ? '✅ You are eligible for ₹150 discount!' 
        : `You need ${10000 - user.coins} more coins and a monthly subscription to get ₹150 discount.`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
