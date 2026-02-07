import express from "express";
import { paymentMiddleware } from "@x402/express";
import { Facilitator, createExpressAdapter } from "x402-open";
import { baseSepolia } from "viem/chains";
import 'dotenv/config';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4021;
const RECEIVER_WALLET = process.env.WALLET_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const FACILITATOR_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

if (!RECEIVER_WALLET || !PRIVATE_KEY) {
  throw new Error("Missing required environment variables");
}

// 1. THE FACILITATOR
const facilitator = new Facilitator({
  evmPrivateKey: PRIVATE_KEY,
  evmNetworks: [baseSepolia],
});

createExpressAdapter(facilitator, app, "/facilitator");

// 2. THE PAYWALL - CORRECTED ORDER
app.use(paymentMiddleware(
  {
    "GET /premium-content": { 
      price: "$0.01", 
      network: "base-sepolia",
      receiver: RECEIVER_WALLET  // Receiver goes INSIDE the route config
    }
  },
  {
    url: `${FACILITATOR_URL}/facilitator` 
  }
));

app.get("/premium-content", (req, res) => {
  res.send({ 
    message: "🔓 Access Granted!",
    content: "The Human Calculator Masterclass: You pushed through the hardest part."
  });
});

app.listen(PORT, () => console.log(`🚀 Hybrid Node live on port ${PORT}`));
