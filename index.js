import express from "express";
import { paymentMiddleware } from "@x402/express";
import { Facilitator, createExpressAdapter } from "x402-open";
import { baseSepolia } from "viem/chains";
import { HTTPFacilitatorClient } from "@x402/core"; 
import 'dotenv/config';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4021;
const RECEIVER_WALLET = process.env.WALLET_ADDRESS;

// FACILITATOR
const facilitator = new Facilitator({
  evmPrivateKey: process.env.PRIVATE_KEY, 
  evmNetworks: [baseSepolia],
});

createExpressAdapter(facilitator, app, "/facilitator");

// CLIENT 
const facilitatorClient = new HTTPFacilitatorClient({ 
    url: `${process.env.RENDER_EXTERNAL_URL}/facilitator` 
});

// THE PAYWALL 
app.use(
  paymentMiddleware(
    {
      payTo: RECEIVER_WALLET,
      routes: {
        "GET /premium-content": { price: "$0.01", network: "base-sepolia" }
      }
    },
    facilitatorClient 
  )
);

app.get("/premium-content", (req, res) => {
  res.send({ 
    message: "🔓 Access Granted!",
    content: "The Human Calculator Masterclass: Always check your decimals first."
  });
});

app.listen(PORT, () => console.log(`🚀 Hybrid Node live on port ${PORT}`));
