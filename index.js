import express from "express";
import { paymentMiddleware } from "@x402/express";
import { Facilitator, createExpressAdapter } from "x402-open";
import { baseSepolia } from "viem/chains";
import 'dotenv/config';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4021;
const RECEIVER_WALLET = process.env.WALLET_ADDRESS;

// 1. THE FACILITATOR
// Ensure there are no typos in these keys.
const facilitator = new Facilitator({
  evmPrivateKey: process.env.PRIVATE_KEY,
  evmNetworks: [baseSepolia], // Use evmNetworks as per the README
});

// Exposes the required facilitator endpoints
createExpressAdapter(facilitator, app, "/facilitator");

// 2. THE PAYWALL (The 3-Argument Fix from seller.js)
// This order stops the "accepts" in routes TypeError
app.use(paymentMiddleware(
  RECEIVER_WALLET, // Arg 1: Receiver Wallet Address String
  {                // Arg 2: Route Config Object
    "GET /premium-content": { 
      price: "$0.01", 
      network: "base-sepolia" 
    }
  },
  {                // Arg 3: Facilitator URL Object
    url: `${process.env.RENDER_EXTERNAL_URL}/facilitator` 
  }
));

app.get("/premium-content", (req, res) => {
  res.send({ 
    message: "🔓 Access Granted!",
    content: "The Human Calculator Masterclass: You pushed through the hardest part."
  });
});

app.listen(PORT, () => console.log(`🚀 Hybrid Node live on port ${PORT}`));
