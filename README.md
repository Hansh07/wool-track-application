# 🐑 Wool Monitoring Application — Enterprise Edition v2.0

A modern, enterprise-grade full-stack application for managing the complete wool supply chain — from farm to fabric. This platform serves **Farmers**, **Mill Operators**, **Quality Inspectors**, **Buyers**, and **Admins** with tailored dashboards, real-time IoT monitoring, AI-powered insights, and a fully integrated marketplace.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
Live Link :- https://wool-track-application.vercel.app/

---
<img width="1917" height="930" alt="image" src="https://github.com/user-attachments/assets/d09fdd56-99d1-4e13-81ad-a69358641f04" />
<img width="1913" height="1105" alt="Wool Monitoring Application Banner" src="https://github.com/user-attachments/assets/e0453ddd-d00b-4969-b76c-6c27d3ee4814" />
## 🚀 Features

### Core Features
- **Role-Based Access Control (RBAC)** — Secure, permission-based dashboards for Farmers, Inspectors, Mill Operators, Buyers, and Admins
- **Detailed Batch Tracking** — Track wool batches through processing stages (Cleaning, Carding, Spinning, etc.) with a visual timeline
- **Scientific Quality Inspections** — Lab interface for recording micron, yield, and tensile strength data with analytics
- **Marketplace & Orders** — Full e-commerce system for approved wool batches with invoice generation and order tracking

### Enterprise Features
- **🏷️ Live Auction System** — Real-time bidding on wool batches via Socket.io with live price updates
- **📦 Logistics Management** — End-to-end shipment tracking and delivery management
- **📜 Certificate Generation** — Quality and compliance certificates with QR code verification
- **📊 Analytics Dashboard** — Data-driven insights with interactive Recharts visualizations
- **🌿 ESG (Sustainability) Dashboard** — Environmental, Social, and Governance reporting and tracking
- **📦 Inventory Management** — Warehouse stock levels, alerts, and inventory tracking
- **💳 Razorpay Payment Gateway** — Secure online payments integrated into the marketplace

### AI & Real-time
- **🤖 AI Chatbot** — Intelligent assistant powered by Google Gemini & Groq for instant supply chain queries
- **📡 IoT Monitoring** — Real-time environmental dashboard (temperature, humidity, machine health) via Socket.io
- **🌤️ Weather Service** — OpenWeather API integration for farm-level weather data

### Security & Infrastructure
- **🔐 Two-Factor Authentication (2FA)** — TOTP-based 2FA via Speakeasy for enhanced account security
- **🔄 JWT Refresh Tokens** — Secure token rotation with 15-minute access + 7-day refresh tokens
- **📧 Email Notifications** — Transactional emails via Nodemailer (SMTP/Gmail)
- **☁️ Cloud Image Storage** — Cloudinary integration for batch photos and documents
- **🛡️ Enterprise Security** — Helmet, CORS, rate limiting, compression, and input validation

### User Experience
- **🎨 Premium UI/UX** — Dark glassmorphism theme with smooth Framer Motion animations
- **🐑 Custom Animations** — Roaming sheep, wool particle effects, and sheep loading screens
- **🌐 Multi-language (i18n)** — English, Hindi, and Punjabi language support
- **📱 PWA Support** — Installable Progressive Web App via Vite PWA plugin
- **📊 Interactive Charts** — Recharts-powered data visualizations across all dashboards

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework |
| **Vite 5** | Build tool & dev server |
| **Tailwind CSS 3** | Utility-first styling (custom dark/glass theme) |
| **Framer Motion** | Page transitions & micro-animations |
| **React Router v6** | Client-side routing with protected routes |
| **Recharts** | Interactive data visualization & charts |
| **Socket.io Client** | Real-time IoT data & live auction updates |
| **Axios** | HTTP client for API communication |
| **Lucide React** | Modern icon library |
| **React Context API** | Global state management (Auth) |
| **i18next + react-i18next** | Internationalization (EN, HI, PA) |
| **clsx + tailwind-merge** | Dynamic class name utilities |
| **Vite PWA Plugin** | Progressive Web App support |

### Backend

| Technology | Purpose |
|-----------|---------|
| **Node.js** | JavaScript runtime |
| **Express.js 4** | Web framework & REST API |
| **MongoDB Atlas** | Cloud database (Mongoose ODM) |
| **Socket.io** | Real-time bidirectional communication |
| **JWT** | Authentication (access + refresh tokens) |
| **Speakeasy** | Two-Factor Authentication (TOTP) |
| **Razorpay** | Payment gateway integration |
| **Google Generative AI (Gemini)** | AI chatbot & intelligent responses |
| **Groq SDK** | Alternative AI inference engine |
| **Cloudinary** | Cloud image storage & CDN |
| **Multer** | File upload handling |
| **Nodemailer** | Email notifications (SMTP) |
| **QRCode** | QR code generation for certificates |
| **ioredis** | Redis caching & rate limiting |
| **Winston** | Structured logging with daily rotation |
| **Helmet** | HTTP security headers |
| **Express Rate Limit** | API rate limiting |
| **Express Validator** | Request validation & sanitization |
| **Morgan** | HTTP request logging |
| **Compression** | Gzip response compression |
| **bcryptjs** | Password hashing |
| **PM2** | Production process manager |

### DevOps & Deployment

| Technology | Purpose |
|-----------|---------|
| **Docker** | Containerized deployment (client + server + Redis) |
| **Docker Compose** | Multi-container orchestration |
| **Nginx** | Reverse proxy for production |
| **Render** | Cloud deployment (render.yaml) |
| **Vercel** | Frontend deployment (vercel.json) |
| **Concurrently** | Run client + server in parallel |

---

## 📂 Project Structure

```
wool-monitoring-application/
├── client/                          # React Frontend (Vite)
│   ├── src/
│   │   ├── api/                     # API utility layer (Axios instances)
│   │   ├── assets/                  # Static assets (logo, images)
│   │   ├── components/
│   │   │   ├── ui/                  # Reusable UI (Button, Card, Modal, Input, Badge, Loader)
│   │   │   ├── BatchTimeline.jsx    # Visual batch processing timeline
│   │   │   ├── Chatbot.jsx          # AI-powered chatbot widget
│   │   │   ├── ProtectedRoute.jsx   # RBAC route guard
│   │   │   ├── RoamingSheep.jsx     # Animated sheep background
│   │   │   ├── SheepLoader.jsx      # Custom loading animation
│   │   │   └── WoolParticles.jsx    # Floating particle effects
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Authentication state provider
│   │   ├── i18n/
│   │   │   ├── index.js             # i18n configuration
│   │   │   └── locales/             # EN, HI, PA translation files
│   │   ├── layouts/
│   │   │   ├── AuthLayout.jsx       # Login/Register layout
│   │   │   └── DashboardLayout.jsx  # Sidebar + navigation layout
│   │   ├── lib/                     # Utility functions
│   │   ├── pages/
│   │   │   ├── AdminPanel.jsx       # Admin management dashboard
│   │   │   ├── AnalyticsDashboard.jsx # Quality analytics & charts
│   │   │   ├── AuctionPage.jsx      # Live wool auction system
│   │   │   ├── BatchDetail.jsx      # Detailed batch view + timeline
│   │   │   ├── BatchesList.jsx      # All batches overview
│   │   │   ├── CertificatesPage.jsx # Quality certificates + QR codes
│   │   │   ├── CreateBatch.jsx      # New batch creation form
│   │   │   ├── ESGDashboard.jsx     # Sustainability reporting
│   │   │   ├── FarmerDashboard.jsx  # Farmer-specific dashboard
│   │   │   ├── HomePage.jsx         # Public landing page
│   │   │   ├── InspectionForm.jsx   # Quality inspection entry
│   │   │   ├── InspectorDashboard.jsx # Inspector workspace
│   │   │   ├── InventoryPage.jsx    # Warehouse inventory mgmt
│   │   │   ├── LoginPage.jsx        # Authentication
│   │   │   ├── LogisticsPage.jsx    # Shipment tracking
│   │   │   ├── Marketplace.jsx      # E-commerce marketplace
│   │   │   ├── MonitoringDashboard.jsx # IoT sensor monitoring
│   │   │   ├── MyOrders.jsx         # Order history & invoices
│   │   │   ├── OperatorDashboard.jsx # Mill operator workspace
│   │   │   ├── ProfileSettings.jsx  # User profile management
│   │   │   ├── QualityResults.jsx   # Inspection results view
│   │   │   └── RegisterPage.jsx     # User registration
│   │   ├── App.jsx                  # Root component + routing
│   │   ├── index.css                # Global styles + Tailwind
│   │   └── main.jsx                 # React entry point
│   ├── tailwind.config.js           # Custom theme configuration
│   ├── vite.config.js               # Vite + PWA configuration
│   ├── vercel.json                  # Vercel deployment config
│   └── Dockerfile                   # Client container
│
├── server/                          # Node.js/Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                # MongoDB Atlas connection
│   │   ├── controllers/
│   │   │   ├── adminController.js   # Admin operations
│   │   │   ├── auctionController.js # Live auction logic
│   │   │   ├── authController.js    # Login, register, 2FA, tokens
│   │   │   ├── batchController.js   # Batch CRUD + stage updates
│   │   │   ├── certificateController.js # Certificate generation
│   │   │   ├── chatController.js    # AI chatbot (Gemini/Groq)
│   │   │   ├── esgController.js     # ESG report management
│   │   │   ├── inventoryController.js # Inventory operations
│   │   │   ├── logisticsController.js # Shipment management
│   │   │   ├── monitoringController.js # IoT data endpoints
│   │   │   ├── qualityController.js # Inspection CRUD + analytics
│   │   │   └── shopController.js    # Marketplace + Razorpay payments
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT verification middleware
│   │   │   ├── roleCheck.js         # RBAC permission middleware
│   │   │   ├── security.js          # Rate limiting + security
│   │   │   ├── upload.js            # Multer + Cloudinary upload
│   │   │   └── validate.js          # Request validation
│   │   ├── models/
│   │   │   ├── ActivityLog.js       # User activity tracking
│   │   │   ├── Alert.js             # System alerts
│   │   │   ├── Auction.js           # Auction schema
│   │   │   ├── Certificate.js       # Quality certificates
│   │   │   ├── ESGReport.js         # ESG sustainability data
│   │   │   ├── Inventory.js         # Warehouse inventory
│   │   │   ├── Logistics.js         # Shipment tracking
│   │   │   ├── News.js              # News/announcements
│   │   │   ├── Order.js             # Purchase orders
│   │   │   ├── ProcessingLog.js     # Batch processing logs
│   │   │   ├── Product.js           # Marketplace products
│   │   │   ├── QualityReport.js     # Inspection reports
│   │   │   ├── RefreshToken.js      # JWT refresh tokens
│   │   │   ├── Role.js              # User roles & permissions
│   │   │   ├── SensorReading.js     # IoT sensor data
│   │   │   ├── SystemSetting.js     # App configuration
│   │   │   ├── User.js              # User accounts + 2FA
│   │   │   └── WoolBatch.js         # Wool batch lifecycle
│   │   ├── routes/                  # API route definitions (12 modules)
│   │   ├── seed/
│   │   │   └── seedUsers.js         # Database seeder
│   │   ├── utils/
│   │   │   ├── email.js             # Nodemailer email service
│   │   │   ├── generateToken.js     # JWT token generation
│   │   │   ├── logger.js            # Winston logging config
│   │   │   ├── revenueCalculator.js # Revenue analytics utility
│   │   │   └── weatherService.js    # OpenWeather API integration
│   │   ├── app.js                   # Express app configuration
│   │   └── server.js                # HTTP + Socket.io entry point
│   ├── uploads/                     # Local file upload storage
│   ├── logs/                        # Application log files
│   ├── ecosystem.config.js          # PM2 configuration
│   ├── .env.example                 # Environment variables template
│   └── Dockerfile                   # Server container
│
├── nginx/                           # Nginx reverse proxy config
├── docker-compose.yml               # Multi-container orchestration
├── render.yaml                      # Render cloud deployment
└── package.json                     # Root scripts (concurrently)
```

---

## 🔗 API Endpoints

| Module | Base Route | Description |
|--------|-----------|-------------|
| Auth | `/api/auth` | Login, Register, 2FA, Token Refresh, Password Reset |
| Batches | `/api/batches` | CRUD, stage updates, batch lifecycle |
| Quality | `/api/quality` | Inspections, reports, analytics |
| Shop | `/api/shop` | Products, cart, orders, Razorpay payments |
| Admin | `/api/admin` | User management, system settings |
| Monitoring | `/api/monitoring` | IoT sensor data endpoints |
| Chat | `/api/chat` | AI chatbot conversations |
| Auction | `/api/auction` | Create, bid, close auctions |
| Logistics | `/api/logistics` | Shipment CRUD, tracking |
| Certificates | `/api/certificates` | Generate, verify, download |
| Inventory | `/api/inventory` | Stock levels, alerts, transfers |
| ESG | `/api/esg` | Sustainability reports, metrics |

---

## ⚡ Getting Started

### Prerequisites
- **Node.js** v16+
- **MongoDB** (Local or [Atlas URI](https://cloud.mongodb.com))
- **Redis** (Optional — for caching & rate limiting)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/wool-monitoring-application.git
   cd wool-monitoring-application
   ```

2. **Install all dependencies** (client + server at once)
   ```bash
   npm run install:all
   ```
   Or install individually:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

3. **Environment Setup**

   Copy the example env file and configure your variables:
   ```bash
   cp server/.env.example server/.env
   ```

   Required environment variables in `server/.env`:

   ```env
   # ─── Server ───────────────────────────────────────
   NODE_ENV=production
   PORT=5000

   # ─── MongoDB Atlas ────────────────────────────────
   MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/<dbname>

   # ─── JWT Security ─────────────────────────────────
   JWT_SECRET=your_64_byte_hex_secret
   JWT_EXPIRE=15m
   JWT_REFRESH_SECRET=your_64_byte_hex_refresh_secret
   JWT_REFRESH_EXPIRE=7d

   # ─── Redis (Optional) ─────────────────────────────
   REDIS_URL=redis://localhost:6379

   # ─── Razorpay Payment Gateway ─────────────────────
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxx

   # ─── AI Services ──────────────────────────────────
   GEMINI_API_KEY=your_gemini_api_key
   OPENWEATHER_API_KEY=your_openweather_api_key

   # ─── Email (SMTP / Gmail) ─────────────────────────
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   EMAIL_FROM=WoolMonitor <no-reply@woolmonitor.com>

   # ─── Cloudinary (Image Storage) ───────────────────
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # ─── Frontend URL (CORS) ──────────────────────────
   CLIENT_URL=http://localhost:5173
   PROD_CLIENT_URL=https://yourdomain.com

   # ─── 2FA ──────────────────────────────────────────
   APP_NAME=WoolMonitor
   ```

4. **Seed the database** (optional — creates default users)
   ```bash
   cd server
   npm run seed
   ```

### Running the App

**Option 1: Run both simultaneously** (from root)
```bash
npm run dev
```

**Option 2: Run separately**
```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

The app will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

---

## 🐳 Docker Deployment

Run the entire stack with Docker Compose:

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Services:
| Container | Port | Description |
|-----------|------|-------------|
| `wool-client` | 80, 443 | React app served via Nginx |
| `wool-server` | 5000 | Node.js API server |
| `wool-redis` | 6379 | Redis cache (internal) |

---

## ☁️ Cloud Deployment

### Render
The project includes a `render.yaml` for one-click deployment to [Render](https://render.com). Configure your environment variables in the Render dashboard.

### Vercel
The client includes a `vercel.json` for frontend deployment to [Vercel](https://vercel.com):
```bash
cd client
npx vercel --prod
```

---

## 👥 User Roles & Permissions

| Role | Dashboard | Key Capabilities |
|------|-----------|-----------------|
| **Farmer** | FarmerDashboard | Create batches, view weather, track batch lifecycle |
| **Mill Operator** | OperatorDashboard | Process batches, manage stages, monitor machines |
| **Quality Inspector** | InspectorDashboard | Conduct inspections, generate quality reports, view analytics |
| **Buyer** | Marketplace | Browse products, place orders, participate in auctions |
| **Admin** | AdminPanel | User management, system settings, full access |

---

## 📸 Screenshots

| Farmer Dashboard | Marketplace |
|:---:|:---:|
| <img width="960" alt="Farmer Dashboard" src="https://github.com/user-attachments/assets/82c2826f-ff1f-41ea-9794-594a5148f740" /> | <img width="960" alt="Marketplace" src="https://github.com/user-attachments/assets/1c0fa7c8-8e1c-4ca5-bd4c-9fd9825071bb" /> |

| Inspection Hub | Mobile View |
|:---:|:---:|
| <img width="960" alt="Lab Hub" src="https://github.com/user-attachments/assets/d9b6994d-c6fb-4f88-81db-d48ed80abaa0" /> | <img width="960" alt="Mobile View" src="https://github.com/user-attachments/assets/12812eee-ecb1-4376-ae38-4a2465a11746" /> |

---

## 🛡️ License

This project is licensed under the MIT License.

---

## 👨‍💻 Contributors

- **Hansh Raj** — *Developer & Co-Creator*
