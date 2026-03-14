# BlushVeil
# 👗 Ladies Clothing Store — Backend

A RESTful backend API for a Ladies Clothing Store with a public landing page and a protected Admin Panel for managing dresses.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT (Access + Refresh Tokens) |
| Image Upload | Cloudinary + Multer |
| Password Hashing | bcrypt |

---

## 📁 Folder Structure

```
backend/
├── src/
│   ├── controllers/
│   │   ├── user.controller.js
│   │   └── dress.controller.js
│   ├── database/
│   │   └── index.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   └── multer.middleware.js
│   ├── models/
│   │   ├── user.models.js
│   │   └── dress.models.js
│   ├── routes/
│   │   ├── user.routes.js
│   │   └── dress.routes.js
│   ├── utils/
│   │   ├── asyncHandler.js
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   └── cloudinary.js
│   └── app.js
│   └── index.js
├── .env
├── .gitignore
└── package.json
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
DBName=your_database_name
CORS_ORIGIN=http://localhost:5173

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

NODE_ENV=development
```

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/your-username/your-repo.git

# Navigate to backend
cd backend

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 📡 API Endpoints

### 👤 User Routes — `/api/v1/users`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login user |
| POST | `/logout` | Protected | Logout user |
| GET | `/profile` | Protected | Get user profile |
| PATCH | `/update-profile` | Protected | Update name & email |
| PATCH | `/update-password` | Protected | Change password |
| PATCH | `/update-address` | Protected | Update address |

### 👗 Dress Routes — `/api/v1/dresses`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Public | Get all dresses |
| GET | `/:dressId` | Public | Get single dress |
| POST | `/add` | Admin Only | Add new dress |
| PATCH | `/update/:dressId` | Admin Only | Update dress |
| DELETE | `/delete/:dressId` | Admin Only | Delete dress |

---

## 🔐 Authentication

This API uses **JWT-based authentication** with two tokens:

- **Access Token** — short lived, sent in cookies + response body
- **Refresh Token** — long lived, stored in DB + cookies

Protected routes require the `Authorization` header:
```
Authorization: Bearer <your_access_token>
```

Or via cookie: `accessToken`

---

## 🛡️ Middleware

| Middleware | Purpose |
|---|---|
| `verifyJWT` | Validates access token, sets `req.user` |
| `verifyRole` | Checks if `req.user.role === "admin"` |
| `upload` | Handles image uploads via Multer |

---

## 👗 Dress Model

| Field | Type | Description |
|---|---|---|
| `name` | String | Dress name |
| `description` | String | Dress description |
| `price` | Number | Price (min: 0) |
| `category` | String | Casual / Formal / Party / Nighty / Undergarment |
| `image.url` | String | Cloudinary image URL |
| `image.public_id` | String | Cloudinary public ID for deletion |
| `stock` | Number | Available stock (min: 0) |
| `isAvailable` | Boolean | Show on landing page or not |

---

## 👤 User Model

| Field | Type | Description |
|---|---|---|
| `fullName` | String | Full name |
| `email` | String | Unique email |
| `password` | String | Hashed (bcrypt) |
| `phoneNumber` | String | 10-digit phone |
| `address` | Object | street, city, state, pincode, country |
| `role` | String | `user` or `admin` (default: user) |
| `profilePicture` | String | Cloudinary URL |
| `isVerified` | Boolean | Account verification status |
| `refreshToken` | String | Stored refresh token |

---

## 📝 Sample Requests

### Register User
```json
POST /api/v1/users/register
{
  "fullName": "Ayesha Khan",
  "email": "ayesha@example.com",
  "password": "password123",
  "phoneNumber": "9876543210"
}
```

### Add Dress (Admin)
```
POST /api/v1/dresses/add
Content-Type: multipart/form-data

name: Floral Kurti
description: Beautiful floral print kurti
price: 799
category: Casual
stock: 50
dressImage: <file>
```

---

## 🧪 Testing

All endpoints can be tested using **Postman**. Import the collection and set:
- `base_url` → `http://localhost:5000`
- `accessToken` → received after login

# 👗 BlushVeil — Frontend

A minimal, clean React.js frontend for the BlushVeil Ladies Clothing Store. Features a public landing page, category filtering, search, dress detail modal, and a protected admin panel.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React.js (Vite) |
| Styling | Tailwind CSS v4 |
| Routing | React Router DOM |
| HTTP Client | Axios |
| Icons | Lucide React |
| State Management | React Context API |

---

## 📁 Folder Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── axios.js           → Axios instance with interceptor
│   ├── assets/
│   │   ├── logo.png           → BlushVeil logo
│   │   └── fonts/
│   │       └── ja.ttf         → Custom font
│   ├── components/
│   │   ├── Navbar.jsx         → Logo, search, auth buttons
│   │   ├── CategoryBar.jsx    → YouTube-style category filter
│   │   ├── DressCard.jsx      → Individual dress card
│   │   ├── DressModal.jsx     → Desktop popup for dress details
│   │   └── ProtectedRoute.jsx → Guards auth/admin routes
│   ├── context/
│   │   └── AuthContext.jsx    → Global auth state
│   ├── pages/
│   │   ├── Home.jsx           → Landing page with dress grid
│   │   ├── Login.jsx          → Login page
│   │   ├── Register.jsx       → Register page
│   │   ├── ProductPage.jsx    → Mobile dress detail page
│   │   ├── ProfilePage.jsx    → User profile, password, address
│   │   └── AdminPanel.jsx     → Admin dashboard (CRUD)
│   ├── App.jsx                → Route definitions
│   ├── main.jsx               → Entry point
│   └── index.css              → Tailwind imports + custom font
├── .env
├── index.html
└── vite.config.js
```

---

## ⚙️ Environment Variables

Create a `.env` file in the frontend root:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

For production:
```env
VITE_API_URL=https://your-backend.onrender.com/api/v1
```

---

## 🚀 Getting Started

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 📱 Pages & Features

### 🏠 Home Page `/`
- Displays all dresses in a responsive grid
- YouTube-style category filter bar (All, Casual, Formal, Party, Nighty, Undergarment)
- Search bar — filters by dress name
- Desktop → click dress = popup modal
- Mobile → click dress = full product page
- Skeleton loading state

### 🔐 Login `/login`
- Email + password login
- Stores user + token in localStorage
- Redirects to home on success

### 📝 Register `/register`
- Full name, email, phone, password
- Redirects to login on success

### 👗 Product Page `/dress/:id` (Mobile)
- Full dress details
- Stock availability indicator
- Back navigation

### 👤 Profile Page `/profile` (Protected)
Three tabs:
- **Profile** — update name and email
- **Password** — change current password
- **Address** — update delivery address

### 🛡️ Admin Panel `/admin` (Admin Only)
- Stats: Total products, total stock, out of stock count
- Full dress table with image, name, category, price, stock
- Add new dress with image upload
- Edit existing dress
- Delete dress (with confirmation)

---

## 🔐 Authentication Flow

```
User logs in → accessToken stored in:
  - window.__accessToken (for axios interceptor)
  - localStorage (persists on refresh)

Axios interceptor → adds token to every request header:
  Authorization: Bearer <token>

On refresh → token restored from localStorage
On logout → token cleared from both
```

---

## 🧩 Components

### `Navbar`
- Logo (custom font image)
- Search bar with submit
- Logged out → Login button
- Logged in → Profile avatar + name, Admin button (if admin), Logout
- Mobile responsive with hamburger menu

### `CategoryBar`
- Sticky below navbar
- Pill buttons for each category
- Active category highlighted in black

### `DressCard`
- 3:4 aspect ratio image
- Hover zoom effect
- Name, category, price

### `DressModal` (Desktop)
- Side-by-side image + details
- Category, name, price, description
- Stock indicator
- Close on backdrop click or Escape key

### `ProtectedRoute`
- Redirects to `/login` if not logged in
- Redirects to `/` if not admin (when `adminOnly={true}`)

---

## 📱 Mobile Testing (Local Network)

To test on phone using same WiFi:

```bash
# vite.config.js
server: {
  host: '0.0.0.0',
  port: 5173
}
```

```env
# .env
VITE_API_URL=http://YOUR_LOCAL_IP:5000/api/v1
```

Open on phone: `http://YOUR_LOCAL_IP:5173`

---

## 🚀 Deployment (Vercel)

1. Push to GitHub
2. Go to vercel.com → New Project
3. Settings:
```
Root Directory: frontend
Framework: Vite
Build Command: npm run build
Output Directory: dist
```
4. Add environment variable:
```
VITE_API_URL=https://your-backend.onrender.com/api/v1
```
5. Deploy!

---

## 👨‍💻 Author

**Anees Shaikh** — Full Stack Developer
- Building: Ladies Clothing Store (Mentorship Project)
- Stack: MERN + Cloudinary
