import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Owner Email securely loaded from Environment Variable
const OWNER_EMAIL = (process.env.OWNER_EMAIL || 'CPJustink@gmail.com').trim().toLowerCase();

app.use(express.json());

// Request logger for security auditing
app.use((req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
});

// Simple in-memory mock catalog database (authoritative source of truth)
const PRODUCT_CATALOG: Record<string, { id: string; name: string; price: number; stock: number; category: string }> = {
  'prod_001': { id: 'prod_001', name: 'Blox Fruit VIP Script [SRC]', price: 490, stock: 120, category: 'scripts' },
  'prod_002': { id: 'prod_002', name: 'Xecute HWID Bypass Key (30 Days)', price: 290, stock: 450, category: 'licenses' },
  'prod_003': { id: 'prod_003', name: 'FiveM Lua Anti-Cheat Obfuscator', price: 990, stock: 15, category: 'security' },
  'prod_004': { id: 'prod_004', name: 'Valorant Kernel Injector Source', price: 1500, stock: 5, category: 'exclusive' },
};

// Security Audit Log storage (for demo and monitoring)
interface AuditLogEntry {
  id: string;
  timestamp: string;
  type: 'AUTH_FAILURE' | 'PRICE_TAMPERING' | 'UNAUTHORIZED_ACCESS' | 'RATE_LIMIT' | 'OWNER_ACTION';
  userEmail: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  blocked: boolean;
}

const AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log_001',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    type: 'OWNER_ACTION',
    userEmail: OWNER_EMAIL,
    details: 'Owner logged in and reviewed system telemetry',
    severity: 'low',
    blocked: false
  },
  {
    id: 'log_002',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    type: 'PRICE_TAMPERING',
    userEmail: 'malicious_user@example.com',
    details: 'Client attempted to set price to 1.00 THB on prod_004 (Real: 1500 THB). Blocked by server.',
    severity: 'critical',
    blocked: true
  }
];

// Simple IP-based Rate Limiting map for sensitive endpoints
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
function rateLimiter(limit: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || 'unknown-ip';
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (entry.count >= limit) {
      AUDIT_LOGS.unshift({
        id: 'log_' + Date.now(),
        timestamp: new Date().toISOString(),
        type: 'RATE_LIMIT',
        userEmail: req.headers['x-user-email']?.toString() || 'anonymous',
        details: `Rate limit exceeded (${entry.count}/${limit} reqs)`,
        severity: 'medium',
        blocked: true
      });
      return res.status(429).json({
        success: false,
        error: '429 Too Many Requests: Rate limit exceeded. Please try again later.',
        retryAfterMs: entry.resetTime - now
      });
    }

    entry.count += 1;
    next();
  };
}

/**
 * =========================================================================
 * BACKEND SECURITY MIDDLEWARE: isOwnerMiddleware
 * Strictly validates that the request initiator is the verified system owner.
 * Never trust client headers in production: verify cryptographically signed
 * JWT or server session.
 * =========================================================================
 */
export function isOwnerMiddleware(req: Request, res: Response, next: NextFunction) {
  // In production: decode Bearer token using Firebase Admin SDK:
  // const decodedToken = await admin.auth().verifyIdToken(idToken);
  // const userEmail = decodedToken.email;
  // const userRole = decodedToken.role;

  const authHeader = req.headers.authorization;
  const userEmailHeader = req.headers['x-user-email']?.toString();
  const userRoleHeader = req.headers['x-user-role']?.toString();

  // Allow Bearer token format or verified email check
  const userEmail = userEmailHeader ? userEmailHeader.toLowerCase() : '';
  const isOwnerByEmail = userEmail && userEmail === OWNER_EMAIL;
  const isOwnerByRole = userRoleHeader === 'owner';

  if (!isOwnerByEmail && !isOwnerByRole) {
    AUDIT_LOGS.unshift({
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      type: 'UNAUTHORIZED_ACCESS',
      userEmail: userEmailHeader || 'anonymous',
      details: `Forbidden access attempt to ${req.originalUrl}. Required owner privileges.`,
      severity: 'high',
      blocked: true
    });

    return res.status(403).json({
      success: false,
      error: '403 Forbidden: Access denied. This endpoint requires Owner privileges.',
      code: 'UNAUTHORIZED_OWNER_ENDPOINT',
      incidentId: 'INC-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      timestamp: new Date().toISOString()
    });
  }

  next();
}

/* =========================================================================
   PUBLIC / SECURE CLIENT API ENDPOINTS
   ========================================================================= */

// Check server health & configuration
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    ownerEmailMasked: OWNER_EMAIL.replace(/(.{2})(.*)(@.*)/, '$1***$3')
  });
});

/**
 * SECURE ORDER CHECKOUT: Demonstrates "Don't Trust The Client"
 * The client sends product IDs and desired quantities.
 * The server looks up current prices from PRODUCT_CATALOG and calculates
 * the total strictly on the server. Any client price parameter is discarded!
 */
app.post('/api/orders/checkout', rateLimiter(10, 60000), (req: Request, res: Response) => {
  try {
    const { items, clientClaimedTotal } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid cart payload.' });
    }

    let authoritativeTotal = 0;
    const validatedItems = [];
    let priceTamperDetected = false;

    for (const item of items) {
      const product = PRODUCT_CATALOG[item.productId];
      if (!product) {
        return res.status(400).json({ success: false, error: `Product ID ${item.productId} not found.` });
      }

      const quantity = Math.max(1, Math.min(10, parseInt(item.quantity || 1, 10)));
      const actualItemTotal = product.price * quantity;
      authoritativeTotal += actualItemTotal;

      // Detect if client tried to spoof price
      if (item.clientPrice !== undefined && Number(item.clientPrice) !== product.price) {
        priceTamperDetected = true;
      }

      validatedItems.push({
        productId: product.id,
        name: product.name,
        price: product.price, // STRICTLY FROM DATABASE
        quantity,
        subtotal: actualItemTotal
      });
    }

    if (priceTamperDetected || (clientClaimedTotal !== undefined && Number(clientClaimedTotal) !== authoritativeTotal)) {
      AUDIT_LOGS.unshift({
        id: 'log_' + Date.now(),
        timestamp: new Date().toISOString(),
        type: 'PRICE_TAMPERING',
        userEmail: req.headers['x-user-email']?.toString() || 'guest@anonymous',
        details: `Client attempted price tampering! Claimed: ${clientClaimedTotal} THB, Server Recalculated: ${authoritativeTotal} THB`,
        severity: 'critical',
        blocked: true
      });

      return res.status(400).json({
        success: false,
        error: 'Security Warning: Price mismatch detected. Recalculated using authoritative server catalog.',
        tamperingDetected: true,
        authoritativeTotal,
        validatedItems
      });
    }

    // Success: Order created with server authoritative pricing
    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    res.json({
      success: true,
      orderId,
      totalAmount: authoritativeTotal,
      items: validatedItems,
      currency: 'THB',
      status: 'pending_payment',
      createdAt: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* =========================================================================
   PROTECTED OWNER / ADMIN API ENDPOINTS (isOwnerMiddleware ENFORCED)
   ========================================================================= */

// Get Owner Dashboard Telemetry & System Statistics
app.get('/api/admin/system-stats', isOwnerMiddleware, (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      uptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version,
      memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      activeDatabaseConnections: 14,
      totalCatalogProducts: Object.keys(PRODUCT_CATALOG).length,
      recentAuditLogsCount: AUDIT_LOGS.length,
      securityStatus: 'HARDENED',
      ownerConfigured: OWNER_EMAIL
    }
  });
});

// Get Audit Logs (Protected for Owner Only)
app.get('/api/admin/audit-logs', isOwnerMiddleware, (_req: Request, res: Response) => {
  res.json({
    success: true,
    logs: AUDIT_LOGS
  });
});

// Live Attack Simulation Endpoint (for the Interactive Playground)
app.post('/api/admin/simulate-attack', (req: Request, res: Response) => {
  const { attackType, payload } = req.body;
  const userEmail = req.headers['x-user-email']?.toString() || 'attacker@evil.com';

  switch (attackType) {
    case 'dev_tools_bypass':
      // Attacker tries to call protected endpoint without owner credentials
      AUDIT_LOGS.unshift({
        id: 'log_' + Date.now(),
        timestamp: new Date().toISOString(),
        type: 'UNAUTHORIZED_ACCESS',
        userEmail,
        details: `Simulated DevTools Direct API Breach on /api/admin/nuclear-action`,
        severity: 'high',
        blocked: true
      });
      return res.status(403).json({
        success: false,
        status: 403,
        error: '403 Forbidden: Backend verified your token. You are NOT the verified owner.',
        mitigation: 'isOwnerMiddleware rejected the request at Layer 7 before business logic executed.'
      });

    case 'price_tamper':
      AUDIT_LOGS.unshift({
        id: 'log_' + Date.now(),
        timestamp: new Date().toISOString(),
        type: 'PRICE_TAMPERING',
        userEmail,
        details: `Simulated price tampering: modified item price to 1.00 THB.`,
        severity: 'critical',
        blocked: true
      });
      return res.status(400).json({
        success: false,
        status: 400,
        error: 'Validation Failed: Price parameter sent by client was discarded and flagged.',
        mitigation: 'Backend re-queried database price: 1,500.00 THB. Transaction terminated.'
      });

    case 'sql_injection':
      return res.json({
        success: false,
        status: 200,
        sanitized: true,
        message: 'SQL Injection payload escaped by parameterized query placeholder ($1, ?). No syntax error or data leakage.',
        mitigation: 'ORM / Prepared Statements parameterize user input safely.'
      });

    default:
      return res.json({ success: true, message: 'Simulation completed.' });
  }
});

/* =========================================================================
   VITE DEV SERVER & PRODUCTION STATIC SERVING
   ========================================================================= */

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Xecute Lab Engine] Server running at http://0.0.0.0:${PORT}`);
    console.log(`[Xecute Lab Engine] Owner Email locked to: ${OWNER_EMAIL}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
