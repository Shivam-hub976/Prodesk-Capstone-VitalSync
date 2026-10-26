import Stripe from 'stripe';
import User from '../models/User.js';

// @desc    Create Stripe Checkout Session
// @route   POST /api/payments/create-checkout-session
// @access  Private
export const createCheckoutSession = async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn("⚠️ STRIPE_SECRET_KEY not found in .env. Using mock payment gateway.");
      return res.status(200).json({ url: `${req.headers.origin || 'http://localhost:5173'}/dashboard?success=true&mock=true` });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      // Removed 'payment_method_types: ['card']' to comply with latest Stripe API
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'VitalSync Pro Upgrade',
              description: 'Unlock advanced clinical analytics and priority support.',
            },
            unit_amount: 9900, 
          },
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin || 'http://localhost:5173'}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://localhost:5173'}/dashboard?canceled=true`,
      customer_email: req.user.email,
      client_reference_id: req.user._id.toString(), 
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    res.status(500).json({ message: `Stripe Gateway Error: ${error.message}` });
  }
};

// @desc    Verify Payment and Upgrade User to Pro
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req, res) => {
  try {
    const { session_id, mock } = req.body;

    if (mock === 'true') {
      const user = await User.findByIdAndUpdate(req.user._id, { isPro: true }, { new: true }).select('-password');
      return res.status(200).json({ success: true, user, message: 'Upgraded to Pro (Mock Mode)' });
    }

    if (!session_id) {
      return res.status(400).json({ message: 'Session ID is required for verification' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      const user = await User.findByIdAndUpdate(req.user._id, { isPro: true }, { new: true }).select('-password');
      res.status(200).json({ success: true, user, message: 'Payment verified. Upgraded to Pro!' });
    } else {
      res.status(400).json({ message: 'Payment not completed' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};