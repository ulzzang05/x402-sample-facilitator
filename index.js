import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { Facilitator, createExpressAdapter } from "x402-open";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";
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

// 1. THE FACILITATOR - No .register() needed!
const facilitator = new Facilitator({
  evmPrivateKey: PRIVATE_KEY,
  evmNetworks: [baseSepolia],
});

createExpressAdapter(facilitator, app, "/facilitator");

// 2. CREATE RESOURCE SERVER - Only register on the server
const facilitatorClient = new HTTPFacilitatorClient({
  url: `${FACILITATOR_URL}/facilitator`
});

const server = new x402ResourceServer(facilitatorClient)
  .register("eip155:84532", new ExactEvmScheme());

// 3. THE PAYWALL
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

app.listen(PORT, () => console.log(`🚀 Hybrid Node live on port ${PORT}`));    content: "The Human Calculator Masterclass: You pushed through the hardest part."
  });
});

app.listen(PORT, () => console.log(`🚀 Hybrid Node live on port ${PORT}`));
