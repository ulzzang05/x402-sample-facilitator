import express from "express";
import { paymentMiddleware } from "@x402/express";
import { Facilitator, createExpressAdapter } from "x402-open";
import { baseSepolia } from "viem/chains";
import * as x402Core from "@x402/core"; // Import everything as an object
import 'dotenv/config';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4021;
const RECEIVER_WALLET = process.env.WALLET_ADDRESS;

// 1. FACILITATOR
const facilitator = new Facilitator({
  evmPrivateKey: process.env.PRIVATE_KEY, 
  evmNetworks: [baseSepolia],
});
createExpressAdapter(facilitator, app, "/facilitator");

// 2. CLIENT (The fix for the SyntaxError)
// We access the client through the core object to ensure we hit the right export
const facilitatorClient = new x402Core.HTTPFacilitatorClient({ 
    url: `${process.env.RENDER_EXTERNAL_URL}/facilitator` 
});

// 3. PAYWALL
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
    content: "The Human Calculator Masterclass: Success is in the details."
  });
});

app.listen(PORT, () => console.log(`🚀 Hybrid Node live on port ${PORT}`));
