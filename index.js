import express from "express";
import { paymentMiddleware } from "@x402/express";
import { Facilitator, createExpressAdapter } from "x402-open";
import { baseSepolia } from "viem/chains";
import 'dotenv/config';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4021;
const RECEIVER_WALLET = process.env.WALLET_ADDRESS;

// STEP 1: DEPLOY THE FACILITATOR
const facilitator = new Facilitator({
  evmPrivateKey: process.env.PRIVATE_KEY, 
  evmNetworks: [baseSepolia],
});

createExpressAdapter(facilitator, app, "/facilitator");

// STEP 2: THE PAYWALL
app.use(
  paymentMiddleware(
    RECEIVER_WALLET,
    {
      "GET /premium-content": { price: "$0.01", network: "base-sepolia" },
    },
    { url: `${process.env.RENDER_EXTERNAL_URL || 'http://localhost:'+ PORT}/facilitator` },

    {payTo: RECEIVER_WALLET, routes: {"GET /premium-content": {price: "$0.01", network: "base-sepolia"}}}
  )
);

app.get("/premium-content", (req, res) => {
  res.send({ 
    message: "🔓 Access Granted!",
    content: "The Human Calculator Masterclass: Always check your decimals first."
  });
});

app.listen(PORT, () => console.log(`🚀 Hybrid Node live on port ${PORT}`));