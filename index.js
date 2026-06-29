require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT || 3000;

app.post('/stripe-webhook', express.raw({ type: 'application/json' }), (request, response) => {
    const sig = request.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            request.body, 
            sig, 
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error(`❌ Webhook Error: ${err.message}`);
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('\n--- 🎉 SUCCESSFUL PAYMENT DETECTED ---');
            console.log(`ID: ${paymentIntent.id}`);
            console.log(`Amount Charged: $${paymentIntent.amount / 100}`);
            console.log(`Customer Email: ${paymentIntent.receipt_email || 'Not provided'}`);
            console.log('--------------------------------------\n');
            break;
            
        default:
            console.log(`ℹ️ Received unhandled event type: ${event.type}`);
    }

    response.json({ received: true });
});


app.listen(port, () => {
    console.log(`🚀 Stripe Bridge Server is live on http://localhost:${port}`);
});