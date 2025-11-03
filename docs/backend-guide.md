# Building a Backend for Novel Nest: A Step-by-Step Guide

This document provides a comprehensive guide to building a backend server for the Novel Nest application. We'll use a popular and powerful stack: **Node.js** with the **Express.js** framework and a **PostgreSQL** database.

---

### Why this stack?
*   **Node.js & Express.js**: This allows you to write your backend in JavaScript, keeping the language consistent with the React frontend. It's fast, widely used, and has a massive ecosystem of libraries (via npm).
*   **PostgreSQL**: A powerful, open-source relational database that is excellent for handling structured data like users, novels, and chapters. It reliably enforces data integrity, which is crucial for an application like this.

---

## Step 1: Prerequisites & Initial Setup

Before you start, you need to install a few tools:

1.  **Node.js**: Download and install it from [nodejs.org](https://nodejs.org/). This will also install `npm`, the Node Package Manager.
2.  **Code Editor**: VS Code is highly recommended.
3.  **PostgreSQL**: Install a local PostgreSQL server. You can find installers and instructions at [postgresql.org](https://www.postgresql.org/download/).
4.  **Database GUI (Optional but Recommended)**: A tool like [DBeaver](https://dbeaver.io/) or [Postico](https://eggerapps.at/postico/) makes it much easier to view and manage your database.

---

## Step 2: Backend Project Initialization

1.  Create a new folder for your backend, separate from your frontend code (e.g., `novel-nest-backend`).
2.  Open a terminal in that new folder and run `npm init -y` to create a `package.json` file.
3.  Install the necessary libraries:

    ```bash
    npm install express pg cors dotenv bcryptjs jsonwebtoken
    ```

    Here's what each package does:
    *   `express`: The web server framework.
    *   `pg`: The official PostgreSQL client for Node.js.
    *   `cors`: A middleware to allow your React frontend (on a different "origin") to make requests to this backend.
    *   `dotenv`: Manages environment variables (like database credentials) so you don't have to hardcode them.
    *   `bcryptjs`: A library to securely hash user passwords. **Never store plain-text passwords!**
    *   `jsonwebtoken`: Implements JSON Web Tokens (JWT) for secure user authentication sessions.

---

## Step 3: Database Design

The interfaces in `frontend/types.ts` are a perfect blueprint for our database tables. Here are the SQL commands to create them. You can run these commands in your database GUI.

```sql
-- For storing user accounts and roles
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(255),
    bio TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'Reader',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- For storing novel information
CREATE TABLE novels (
    novel_id SERIAL PRIMARY KEY,
    author_id INT NOT NULL REFERENCES users(user_id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image VARCHAR(255),
    tags TEXT[],
    status VARCHAR(20) NOT NULL DEFAULT 'Ongoing',
    last_update TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    views INT NOT NULL DEFAULT 0,
    likes INT NOT NULL DEFAULT 0,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 0.00
);

-- For storing individual chapters/episodes of a novel
CREATE TABLE episodes (
    episode_id SERIAL PRIMARY KEY,
    novel_id INT NOT NULL REFERENCES novels(novel_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    is_locked BOOLEAN NOT NULL DEFAULT false,
    price INT NOT NULL DEFAULT 0,
    release_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- You can continue this pattern for reviews and comments
```

---

## Step 4: Server Setup and Database Connection

1.  In your backend project root, create a `.env` file to store your database connection string. This keeps your credentials secret.

    ```
    # .env
    DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/YOUR_DATABASE_NAME"
    JWT_SECRET="YOUR_SUPER_SECRET_KEY_FOR_SIGNING_TOKENS"
    ```

2.  Create a file named `db.js` to handle the database connection pool. A connection pool is much more efficient than creating a new connection for every query.

    ```javascript
    // db.js
    const { Pool } = require('pg');
    require('dotenv').config();

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    module.exports = {
      query: (text, params) => pool.query(text, params),
    };
    ```

3.  Create your main server file, `index.js`.

    ```javascript
    // index.js
    const express = require('express');
    const cors = require('cors');
    require('dotenv').config();

    const app = express();
    const PORT = process.env.PORT || 4000;

    // Middleware
    app.use(cors()); // Allow requests from your frontend
    app.use(express.json()); // Allow the server to understand JSON request bodies

    // Routes (we will add these next)
    app.get('/', (req, res) => {
      res.send('Novel Nest API is running!');
    });

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
    ```

---

## Step 5: Building API Endpoints

This is where you'll recreate the logic from `apiService.ts`. Your folder structure could look like this:

```
/routes
  - auth.js
  - novels.js
/controllers
  - authController.js
  - novelController.js
index.js
db.js
```

Here's an example of how to build the authentication routes.

#### Example: `routes/auth.js`
```javascript
// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);

module.exports = router;
```

#### Example: `controllers/authController.js`
```javascript
// controllers/authController.js
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const newUserQuery = 'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING user_id, username, email, role';
        const { rows } = await db.query(newUserQuery, [username, email, password_hash, 'Reader']);
        
        // Don't send the password hash back
        res.status(201).json(rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.login = async (req, res) => {
    // ... Login logic here
    // 1. Find user by email from the database
    // 2. Use bcrypt.compare() to check if the provided password matches the stored hash
    // 3. If it matches, create a JWT with jwt.sign()
    // 4. Send the user object and the token back to the client
};
```
You would then connect this router in your main `index.js` file:
```javascript
// index.js (additions)
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
```

You would follow this pattern for all other data types (novels, episodes, etc.), creating routes and controllers to query the database and return the data as JSON.

---

## Step 6: Connecting the Frontend

Finally, you need to update `frontend/services/apiService.ts` to make real network requests to your new backend instead of using mock data.

1.  Define your API's base URL.
2.  Use the `fetch` API to make HTTP requests.

#### Example: `getRecommendedNovels`
```typescript
// services/apiService.ts (Updated)
import { User, Novel, /* ... */ } from '../types';

const API_BASE_URL = 'http://localhost:4000/api'; // Your backend URL

export const apiService = {
  login: async (email: string, pass: string): Promise<User | null> => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: pass })
      });
      if (!response.ok) throw new Error('Login failed');
      const data = await response.json(); // This would include the user and JWT
      // You would then store the JWT in localStorage
      return data.user;
  },

  // ... other functions
  
  getRecommendedNovels: async (): Promise<Novel[]> => {
    const response = await fetch(`${API_BASE_URL}/novels/recommended`);
    if (!response.ok) throw new Error('Failed to fetch novels');
    return response.json();
  },

  getNovelById: async (id: number): Promise<Novel | undefined> => {
    const response = await fetch(`${API_BASE_URL}/novels/${id}`);
    if (!response.ok) return undefined;
    return response.json();
  },

  // Update all other functions in a similar way...
};
```

This guide provides a solid foundation. From here, you can expand with more features, error handling, input validation, and eventually deploy your backend to a cloud service. Good luck!
