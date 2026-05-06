# 📘 Multi-Vendor Marketplace

## 📖 Project Description

Multi-Vendor Marketplace is a scalable, extensible e-commerce platform where multiple sellers can list and manage products, buyers can browse and purchase from all vendors.  
It features vendor onboarding, order management, payments, product eco-scores, admin analytics, and is implemented with a React frontend and a Node.js/Express/MongoDB backend.

---

## ✨ Features

- Buyer & seller authentication
- Vendor onboarding, marketplace/seller dashboards
- Product management (listing, eco-score, approval status)
- Multi-product cart, localstorage-backed
- Bulk and single checkout flows
- Order management for buyers, sellers, admins
- Admin controls: approval queue, seller & order management, analytics dashboards
- Protected API routes with JWT-based authentication
- Responsive UI and material dashboard
- Global error handling and role-based middleware

---

## 🛠️ Tech Stack

### Frontend
- React.js (for buyer/seller/admin dashboards)
- JavaScript, HTML5, CSS3, Tailwind CSS

### Backend
- Node.js, Express.js
- JWT (authentication, session management)
- RESTful API design

### Database
- MongoDB (Mongoose ORM)

### Tools & Libraries
- axios (API calls)
- dotenv (environment variables)
- React Router
- nodemailer (email notifications)
- classnames, react-icons


---

## ⚙️ Installation Guide

1. **Clone the repository**
   ```bash
   git clone https://github.com/ValayaDase/Multi-Vendor-Marketplace.git
   cd Multi-Vendor-Marketplace
   ```
2. **Install dependencies (frontend & backend)**
   ```bash
   cd backend
   npm install
   cd ../frontend/my-app
   npm install
   ```
3. **Set up environment variables** (see `.env` sample below)
4. **Start the backend**
   ```bash
   cd backend
   npm run dev
   ```
5. **Start the frontend**
   ```bash
   cd ../frontend/my-app
   npm run dev
   ```
   The app typically runs at `http://localhost:5173`

---

## 🔑 Environment Variables (.env)

_Backend example:_
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/marketplace
JWT_SECRET=your_jwt_secret
NODE_ENV=development
EMAIL_USER=your_email@example.com
EMAIL_PASS=app_password
```

_Frontend example (in `frontend/my-app/.env`):_
```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## 📂 Folder Structure (detailed)

```
Multi-Vendor-Marketplace/
│
├── backend/
│   ├── controllers/        # Route logic: products, orders, payments, users, analytics
│   ├── middleware/         # JWT/auth, admin/seller guards
│   ├── models/             # Mongoose schemas: Product, Order, Payment, User, etc.
│   ├── routes/             # Route definitions (products, orders, payments, users, etc.)
│   ├── utils/              # Utilities: mailing, error handling, helpers
│   ├── server.js           # Express app entry point
│   └── ...                 # (e.g., app.js, db.js)
│
├── frontend/
│   └── my-app/
│       ├── src/
│       │   ├── api/                # API wrappers
│       │   ├── assets/             # Images, logos
│       │   ├── components/         # Reusable UI, navigation, product tiles, etc.
│       │   ├── config/             # API config, env
│       │   ├── context/            # Auth, cart, theme context
│       │   ├── dashboard/          # Separate dashboards: admin, seller, buyer
│       │   │   ├── admin/
│       │   │   ├── buyer/
│       │   │   └── seller/
│       │   ├── pages/              # Main views: storefront, product, cart, login, etc.
│       │   ├── payment/            # Checkout, payment logic
│       │   ├── routes/             # App routes
│       │   ├── utils/              # currency, date, validation, etc.
│       │   ├── App.jsx
│       │   └── main.jsx
│       ├── .env
│       ├── package.json
│       └── ...
│
├── README.md
└── ...
```
---

## 📡 API Endpoints

_(Not exhaustive, based on analyzed routes and features)_

### Auth & Users
- `POST /api/auth/register` — Register buyer/seller
- `POST /api/auth/login` — Login

### Products
- `GET /api/products` — List products
- `POST /api/products` — Add product (vendor)
- `PUT /api/products/:id` — Update
- `DELETE /api/products/:id` — Remove (logical delete)

### Orders
- `POST /api/orders/create` — Create order (single/cart)
- `GET /api/orders/buyer` — Buyer's orders
- `GET /api/orders/seller/:id` — Seller's orders
- `POST /api/orders/update-status` — Seller update order status
- `POST /api/orders/cancel` — Buyer cancels

### Payments
- `POST /api/payments/bulk-cart` — Process bulk/cart payment

### Admin & Analytics
- `GET /api/admin/orders` — All marketplace orders
- `GET /api/admin/sellers` — All sellers
- `GET /api/admin/requests` — Seller onboarding/approval queue

---

## 🧪 Testing Instructions

- Backend:  
  In `/backend`, run your test suite (`npm test`).  
  API endpoints can also be tested with Postman/Insomnia.

- Frontend:  
  In `/frontend/my-app`, run  
  ```bash
  npm test
  ```
  and/or use Cypress or Playwright for integration tests.

---


## 📱 Responsive Design Support

- Fully responsive with Tailwind CSS
- Grid and flex layouts for all device sizes
- Sidebar/menu transitions adapt for mobile
- Tested across major browsers

---

## ⚡ Performance Optimizations

- API: pagination on order/product lists
- Caching of user/session/token
- Client bundle split by dashboard area (admin/buyer/seller)

---

## 🧠 Challenges Faced

- Coordinating real-time order/payment status for multiple sellers
- Multi-role dashboard logic with RBAC
- Keeping buyer/seller experiences decoupled but coherent
- Handling edge cases in cart/bulk checkout, especially with asynchronous payments

---

## 📈 Future Improvements

- Third-party payment gateways (Stripe, PayPal integration)
- Vendor-specific themes/branding
- Ratings and advanced analytics dashboards
- Internationalization/multi-currency support

---

## 👨‍💻 Author Information

- **GitHub:** [ValayaDase](https://github.com/ValayaDase)
- **Email:** _valayadase2005@gmail.com_
