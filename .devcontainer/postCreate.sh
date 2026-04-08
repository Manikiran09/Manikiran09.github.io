#!/usr/bin/env bash
# Codespaces post-create setup for EventHub MERN app
set -e

echo ""
echo "=========================================="
echo "  EventHub — Codespaces Setup"
echo "=========================================="

# ── Backend ──────────────────────────────────
echo ""
echo "📦 Installing backend dependencies..."
cd event-management/backend
npm install

# Create .env from example if it doesn't already exist
if [ ! -f .env ]; then
  cp .env.example .env
  # Generate a cryptographically random JWT secret
  JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  sed -i "s|REPLACE_WITH_A_64_CHAR_RANDOM_SECRET_e.g._openssl_rand_-hex_32|${JWT_SECRET}|" .env
  echo "✅ .env created with a generated JWT_SECRET"
fi

# ── Frontend ─────────────────────────────────
echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

# ── Seed database ────────────────────────────
echo ""
echo "🌱 Seeding demo data..."
cd ../backend
node seed.js || echo "⚠️  Seeding skipped (MongoDB may not be ready yet — run 'node seed.js' manually)"

echo ""
echo "=========================================="
echo "  ✅ Setup complete!"
echo ""
echo "  Start the app:"
echo "    Terminal 1 (backend):  cd event-management/backend && npm run dev"
echo "    Terminal 2 (frontend): cd event-management/frontend && npm run dev"
echo ""
echo "  Demo accounts (all use password123):"
echo "    admin@demo.com     — Admin"
echo "    organizer@demo.com — Organizer"
echo "    user@demo.com      — Attendee"
echo "=========================================="
