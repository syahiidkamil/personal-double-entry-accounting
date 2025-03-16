import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import authenticate from "./plugins/authenticate.js";
import authRoutes from "./routes/auth.js";
import accountRoutes from "./routes/accounts.js";
import transactionRoutes from "./routes/transactions.js";
import categoryRoutes from "./routes/categories.js";
import reportRoutes from "./routes/reports.js";

import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";

const fastify = Fastify({
  logger: true,
  ajv: {
    customOptions: {
      removeAdditional: "all",
      coerceTypes: true,
      useDefaults: true,
    },
  },
});

await fastify.register(swagger, {
  openapi: {
    info: {
      title: "Personal Accounting API",
      description: "API for personal double-entry accounting system",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
});

await fastify.register(swaggerUI, {
  routePrefix: "/documentation",
  uiConfig: {
    docExpansion: "list",
    deepLinking: false,
  },
});

// Register core plugins
await fastify.register(cors, {
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.FRONTEND_URL || "http://localhost:5173"
      : "*",
  credentials: true,
});

await fastify.register(jwt, {
  secret: process.env.JWT_SECRET || "supersecretkey_for_development_only",
});

// Register authentication plugin
await fastify.register(authenticate);

// Register routes - each in a different prefix to avoid conflicts
await fastify.register(authRoutes, { prefix: "" });
await fastify.register(accountRoutes, { prefix: "" });
await fastify.register(transactionRoutes, { prefix: "" });
await fastify.register(categoryRoutes, { prefix: "" });
await fastify.register(reportRoutes, { prefix: "" });

// Health check route
fastify.get("/health", async () => {
  return { status: "ok" };
});

// Run the server
const start = async () => {
  try {
    await fastify.listen({
      port: process.env.PORT || 3001,
      host: "0.0.0.0",
    });
    console.log(`Server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
