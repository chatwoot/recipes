// Import required modules and types
import type { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// Get the Chatwoot HMAC secret and authentication token from environment variables
const CHATWOOT_HMAC_SECRET = process.env.CHATWOOT_HMAC_SECRET!;
const AUTH_TOKEN = process.env.AUTH_TOKEN!;

// Define an interface to represent the JWT data
interface JWTData {
  email: string;
}

// Define an asynchronous function to generate the HMAC
export default async function generateHMAC(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // Verify the JWT token included in the request headers
    const token = req.headers.authorization || "";
    console.log(token);
    const jwtData: JWTData = jwt.verify(token, AUTH_TOKEN) as JWTData;

    // Generate HMAC using the Chatwoot HMAC secret and the email from the JWT data
    const hmac = crypto
      .createHmac("sha256", CHATWOOT_HMAC_SECRET)
      .update(jwtData.email)
      .digest("hex");

    // Return the HMAC in a JSON response
    res.status(200).json({ hmac });
  } catch (err) {
    // If there was an error, log it and return a 401 Unauthorized response
    console.error(err);
    res.status(401).json({ error: "Unauthorized" });
  }
}
