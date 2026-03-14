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

---

## 👨‍💻 Author

**Anees Shaikh** — Full Stack Developer
- Building: Ladies Clothing Store (Mentorship Project)
- Stack: MERN + Cloudinary
