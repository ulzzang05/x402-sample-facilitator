import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";
import 'dotenv/config';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4021;
const RECEIVER_WALLET = process.env.WALLET_ADDRESS;

if (!RECEIVER_WALLET) {
  throw new Error("Missing WALLET_ADDRESS environment variable");
}

// USE THE PUBLIC X402 FACILITATOR (no need to run your own!)
const facilitatorClient = new HTTPFacilitatorClient({
  url: "https://www.x402.org/facilitator"  // Public facilitator that supports Base Sepolia
});

const server = new x402ResourceServer(facilitatorClient)
  .register("eip155:84532", new ExactEvmScheme());

// THE PAYWALL
app.use(
  paymentMiddleware(
    {
      "GET /premium-content": { 
        accepts: [
          {
            scheme: "exact",
            price: "$0.01", 
            network: "eip155:84532",
            payTo: RECEIVER_WALLET
          }
        ],
        description: "The Human Calculator Masterclass access",
        mimeType: "application/json"
      }
    },
    server
  )
);

app.get("/premium-content", (req, res) => {
  res.send({ 
    message: "🔓 Access Granted!",
    content: "The Human Calculator Masterclass: You pushed through the hardest part."
  });
});

app.listen(PORT, () => console.log(`🚀 Server live on port ${PORT}`));
