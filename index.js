import express from "express";
import { paymentMiddleware } from "@x402/express";
import { Facilitator, createExpressAdapter } from "x402-open";
import { baseSepolia } from "viem/chains";
import 'dotenv/config';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4021;
const RECEIVER_WALLET = process.env.WALLET_ADDRESS;

// 1. THE FACILITATOR (Following x402-open patterns)
const facilitator = new Facilitator({
  evmPrivateKey: process.env.PRIVATE_KEY, 
  evmNetworks: [baseSepolia],
});

createExpressAdapter(facilitator, app, "/facilitator");

// 2. THE PAYWALL (Following the Vansh example architecture)
// This structure handles the internal 'initialize' function automatically
app.use(
  paymentMiddleware(
    {
      payTo: RECEIVER_WALLET,
      routes: {
        "GET /premium-content": { 
            price: "$0.01", 
            network: "base-sepolia" 
        }
      }
    },
    { url: `${process.env.RENDER_EXTERNAL_URL}/facilitator` }
  )
);

app.get("/premium-content", (req, res) => {
  res.send({ 
    message: "🔓 Access Granted!",
    content: "The Human Calculator Masterclass: You built it."
  });
});

app.listen(PORT, () => console.log(`🚀 Hybrid Node live on port ${PORT}`));
