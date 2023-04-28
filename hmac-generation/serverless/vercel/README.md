## Generating HMAC with Vercel functions

HMAC generation and verification should only happen in authenticated context. However, in a serverless environment like Vercel, there is no server to store session data. As a result, it's not feasible to use traditional sessions for authentication. Instead, JSON Web Tokens (JWT) can be used to securely transmit authentication data between client and server.

JWT is an open standard that defines a compact and self-contained way for securely transmitting information between parties as a JSON object. It consists of three parts: a header, a payload, and a signature. The header and payload are Base64Url encoded JSON objects, while the signature is used to verify the authenticity of the message. Unlike traditional sessions, JWTs are stateless, meaning that all of the necessary information is contained within the token itself.

### How Vercel allows functions in the API folder

Vercel allows developers to create serverless functions that can be accessed through API endpoints. These functions can be written in a variety of languages, including Node.js, Python, and Go. In Vercel, these functions are located in the api folder and are automatically deployed as serverless functions when the project is deployed. This allows developers to create powerful APIs without having to worry about server infrastructure.

## Installing the vercel CLI

The Vercel CLI is a command line tool that allows developers to deploy their projects to Vercel. It can be installed using npm:

```bash
npm install -g vercel
```

## How to generate HMAC with Vercel functions

Create the file `api/hmac.ts` if you're using TypeScript, `api/hmac.js` if you're using JavaScript, or `api/hmac.py` if you're using Python. Vercel has support for Go, Node.js, Ruby and Python. So you can write this in any of those languages

Paste the following code into the file:

```typescript
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
```

<details>
  <summary>Using JS</summary>

```javascript
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const CHATWOOT_HMAC_SECRET = process.env.CHATWOOT_HMAC_SECRET;
const AUTH_TOKEN = process.env.AUTH_TOKEN;

module.exports = async (req, res) => {
  try {
    const token = req.headers.authorization || "";
    const jwtData = jwt.verify(token, AUTH_TOKEN);

    const hmac = crypto
      .createHmac("sha256", CHATWOOT_HMAC_SECRET)
      .update(jwtData.email)
      .digest("hex");

    res.status(200).json({ hmac });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Unauthorized" });
  }
};
```

</details>

### Setting up the environment variables

In order to keep sensitive information secure, it's essential to use environment variables for storing secrets such as the Chatwoot HMAC secret and authentication token. These environment variables will be available to your Vercel functions during execution but won't be exposed in your source code, reducing the risk of accidental leaks.

#### Where to find CHATWOOT_HMAC_SECRET and AUTH_TOKEN?

The `CHATWOOT_HMAC_SECRET` can be found in your inbox setting page.
Assuming the user is logged in via your application using a JWT, the `AUTH_TOKEN` is the secret you have used to encode the JWT.

> The JWT should contain the user's email address, which can be used to generate the HMAC. The HMAC can then be used to authenticate the user's requests to the Chatwoot API.

#### Setting up environment variables in Vercel

To set up environment variables in Vercel, follow these steps:

1. Visit your Vercel project's dashboard.
1. Click on the "Settings" tab in the top navigation bar.
1. Navigate to the "Environment Variables" section.
1. Click on "Add" to create a new environment variable.
1. Enter the variable name (e.g., CHATWOOT_HMAC_SECRET) and its value. Make sure to mark it as a secret.
1. Repeat the process for the AUTH_TOKEN environment variable.
1. Save your changes.

When you run your Vercel function, these environment variables will be accessible through `process.env`. Note that these variables are only available during the function's execution and are not exposed in your source code or version control.

## Testing and Deploying

With the environment variables set up and the Vercel function in place, you can now run `vercel dev` to test your implementation locally. When you're satisfied with the results, deploy your project to Vercel using the `vercel --prod` command.

You can test this out by running the following

```js
const options = {
  method: "POST",
  headers: {
    Authorization: "<your-jwt-token>",
  },
};

fetch("http://localhost:3000/api/hmac", options)
  .then((response) => response.json())
  .then((response) => console.log(response))
  .catch((err) => console.error(err));
```

or using curl

```bash
curl --request POST \
  --url http://localhost:3000/api/hmac \
  --header 'Authorization: <your-jwt-token>'
```

In conclusion, Vercel functions offer a convenient and secure way to generate HMAC signatures for use in serverless applications. By leveraging JWTs for authentication and HMAC generation, you can create a stateless and secure authentication system for your serverless API endpoints.

## References

- [Chatwoot Identity Validation](https://www.chatwoot.com/docs/product/channels/live-chat/sdk/identity-validation/)
- [Vercel Serverless](https://vercel.com/docs/concepts/functions/serverless-functions)
- [JWT](https://jwt.io/introduction)
- [Vercel CLI](https://vercel.com/docs/cli)
