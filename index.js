import express from "express";
import { paymentMiddleware } from "@x402/express";
import { Facilitator, createExpressAdapter } from "x402-open";
import { baseSepolia } from "viem/chains";
import 'dotenv/config';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4021;
const RECEIVER_WALLET = process.env.WALLET_ADDRESS;

// facilitator 
const facilitator = new Facilitator({
  evmPrivateKey: process.env.PRIVATE_KEY, 10
  networks: [baseSepolia], 
});

// facilitator 
createExpressAdapter(facilitator, app, "/facilitator");

app.use(paymentMiddleware(
  RECEIVER_WALLET, 
  {                
    "GET /premium-content": {
      price: "$0.01",
      network: "base-sepolia"
    }
  },
  {                
    url: `${process.env.RENDER_EXTERNAL_URL}/facilitator`
  }
));


app.get("/premium-content", (req, res) => {
  res.send({ 
    message: "🔓 Access Granted!",
    content: "Success is built one fixed error at a time."
  });
});

app.listen(PORT, () => console.log(`🚀 Hybrid Node live on port ${PORT}`));
