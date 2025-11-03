# Building a Full-Stack Backend for Novel Nest with Next.js

This guide outlines the modern approach to building a full-stack application using **Next.js** for both the frontend and backend. This creates a cohesive, type-safe, and highly performant architecture.

---

### Why this stack?
*   **Next.js**: A React framework that handles both client-side rendering (like your current app) and server-side logic via **API Routes**. This eliminates the need for a separate Express server, simplifying development and deployment.
*   **TypeScript**: Provides end-to-end type safety, from your database schema to your React components, catching errors early and improving developer experience.
*   **PostgreSQL**: A powerful, open-source relational database that is excellent for handling structured data.
*   **Prisma**: A next-generation ORM (Object-Relational Mapper) that makes database access simple, intuitive, and, most importantly, fully type-safe. It auto-generates a TypeScript client based on your database schema.
*   **NextAuth.js (Auth.js)**: The standard for authentication in Next.js. It simplifies adding login, logout, and session management with providers like email/password, Google, GitHub, etc.

---

## Step 1: Project Setup

Instead of a separate backend folder, you'll have a single Next.js project.

1.  **Create a new Next.js project:**
    ```bash
    npx create-next-app@latest novel-nest-fullstack --ts
    ```
2.  **Migrate Existing Code:**
    *   Copy your existing `components`, `hooks`, `types.ts`, etc., into the new project's root directory.
    *   Your page components (like `HomePage.tsx`) will go into the `pages` directory. For example, `pages/Reader/HomePage.tsx` would become `pages/index.tsx` (for the root page) or `pages/dashboard.tsx`. Next.js uses a file-system based router.
    *   The existing `App.tsx` logic for routing will be replaced by Next.js's built-in router.

---

## Step 2: Database Setup with Prisma

Prisma will manage your database schema and provide a type-safe client to interact with it.

1.  **Install Prisma:**
    ```bash
    npm install prisma --save-dev
    npm install @prisma/client
    ```
2.  **Initialize Prisma:** In your project root, run:
    ```bash
    npx prisma init --datasource-provider postgresql
    ```
    This creates a `prisma` folder with a `schema.prisma` file and a `.env` file for your database credentials.

3.  **Configure `.env`:** Add your PostgreSQL connection string to the `.env` file.
    ```
    # .env
    DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/YOUR_DATABASE_NAME"
    ```

4.  **Define Your Schema:** Open `prisma/schema.prisma` and define your models. This replaces the need for manual SQL `CREATE TABLE` commands. It's based directly on your `types.ts`.

    ```prisma
    // prisma/schema.prisma

    generator client {
      provider = "prisma-client-js"
    }

    datasource db {
      provider = "postgresql"
      url      = env("DATABASE_URL")
    }

    model User {
      user_id         Int      @id @default(autoincrement())
      username        String   @unique
      email           String   @unique
      password_hash   String
      profile_picture String?
      bio             String?
      role            UserRole @default(READER)
      created_at      DateTime @default(now())
      novels          Novel[]
      reviews         Review[]
      comments        Comment[]
    }

    model Novel {
      novel_id    Int       @id @default(autoincrement())
      author      User      @relation(fields: [author_id], references: [user_id])
      author_id   Int
      title       String
      description String?
      cover_image String?
      tags        String[]
      status      String    @default("Ongoing")
      last_update DateTime  @updatedAt
      views       Int       @default(0)
      likes       Int       @default(0)
      rating      Float     @default(0.0)
      episodes    Episode[]
      reviews     Review[]
    }

    model Episode {
      episode_id   Int       @id @default(autoincrement())
      novel        Novel     @relation(fields: [novel_id], references: [novel_id], onDelete: Cascade)
      novel_id     Int
      title        String
      content      String?
      is_locked    Boolean   @default(false)
      price        Int       @default(0)
      release_date DateTime  @default(now())
      comments     Comment[]
    }

    model Review {
      review_id  Int      @id @default(autoincrement())
      novel      Novel    @relation(fields: [novel_id], references: [novel_id], onDelete: Cascade)
      novel_id   Int
      user       User     @relation(fields: [user_id], references: [user_id])
      user_id    Int
      rating     Int
      comment    String
      created_at DateTime @default(now())
    }

    model Comment {
      comment_id        Int       @id @default(autoincrement())
      episode           Episode   @relation(fields: [episode_id], references: [episode_id], onDelete: Cascade)
      episode_id        Int
      user              User      @relation(fields: [user_id], references: [user_id])
      user_id           Int
      parent            Comment?  @relation("Replies", fields: [parent_comment_id], references: [comment_id])
      parent_comment_id Int?
      content           String
      created_at        DateTime  @default(now())
      replies           Comment[] @relation("Replies")
    }

    enum UserRole {
      READER
      WRITER
      ADMIN
      DEVELOPER
    }
    ```

5.  **Run the Migration:** This command reads your schema, creates the SQL migration files, and applies them to your database.
    ```bash
    npx prisma migrate dev --name init
    ```
    Your database tables are now created!

---

## Step 3: Create API Routes

API routes live in the `pages/api` directory. Each file becomes an endpoint. This is your new backend.

1.  **Create a Prisma Client Instance:** Create a file to instantiate Prisma Client so you can use it across your app.
    ```typescript
    // lib/prisma.ts
    import { PrismaClient } from '@prisma/client';

    const prisma = new PrismaClient();

    export default prisma;
    ```

2.  **Create an API Endpoint:** Let's recreate `getRecommendedNovels`.
    Create the file `pages/api/novels/recommended.ts`.

    ```typescript
    // pages/api/novels/recommended.ts
    import type { NextApiRequest, NextApiResponse } from 'next';
    import prisma from '../../../lib/prisma';
    import { Novel } from '../../../types'; // You can reuse your types

    export default async function handler(
      req: NextApiRequest,
      res: NextApiResponse<Novel[] | { error: string }>
    ) {
      if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      try {
        const novels = await prisma.novel.findMany({
          take: 6,
          orderBy: {
            likes: 'desc', // Or some other recommendation logic
          },
          include: {
            author: {
              select: { user_id: true, username: true },
            },
          },
        });
        res.status(200).json(novels as any); // Cast as any to match simple type
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch novels' });
      }
    }
    ```
    You now have a working endpoint at `http://localhost:3000/api/novels/recommended`.

---

## Step 4: Authentication with NextAuth.js

1.  **Install:**
    ```bash
    npm install next-auth bcryptjs
    npm install --save-dev @types/bcryptjs
    ```
2.  **Create the Auth Endpoint:** Create a catch-all file at `pages/api/auth/[...nextauth].ts`.
    ```typescript
    // pages/api/auth/[...nextauth].ts
    import NextAuth from 'next-auth';
    import CredentialsProvider from 'next-auth/providers/credentials';
    import prisma from '../../../lib/prisma';
    import bcrypt from 'bcryptjs';

    export default NextAuth({
      providers: [
        CredentialsProvider({
          name: 'Credentials',
          credentials: {
            email: { label: "Email", type: "text" },
            password: {  label: "Password", type: "password" }
          },
          async authorize(credentials) {
            if (!credentials) return null;

            const user = await prisma.user.findUnique({
              where: { email: credentials.email }
            });

            if (user && bcrypt.compareSync(credentials.password, user.password_hash)) {
              // Return user object without password
              return { id: user.user_id.toString(), name: user.username, email: user.email, role: user.role };
            }
            return null;
          }
        })
      ],
      // Add other configs like session strategy, callbacks, etc.
      callbacks: {
        // To add role to the session
        async jwt({ token, user }) {
          if (user) token.role = (user as any).role;
          return token;
        },
        async session({ session, token }) {
          if (session.user) (session.user as any).role = token.role;
          return session;
        },
      }
    });
    ```
3.  **Wrap Your App:** In `pages/_app.tsx`, wrap your application with the `SessionProvider`.
    ```tsx
    // pages/_app.tsx
    import { SessionProvider } from 'next-auth/react';
    import type { AppProps } from 'next/app';

    function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
      return (
        <SessionProvider session={session}>
          <Component {...pageProps} />
        </SessionProvider>
      );
    }
    export default MyApp;
    ```

---

## Step 5: Connecting the Frontend

Your `apiService.ts` will now make requests to your own API routes. Because they are on the same domain, you don't need `cors` and can use relative paths.

#### Example: `getRecommendedNovels`
```typescript
// services/apiService.ts (Updated for Next.js)
import { Novel } from '../types';

export const apiService = {
  getRecommendedNovels: async (): Promise<Novel[]> => {
    // Calls your own Next.js API route
    const response = await fetch('/api/novels/recommended');
    if (!response.ok) {
      throw new Error('Failed to fetch recommended novels');
    }
    return response.json();
  },

  // Update all other functions to call their corresponding /api/... endpoints
};
```

Your React components will now use `useSession` from `next-auth/react` instead of your custom `useAuth` hook, which simplifies getting user data and authentication state.

This full-stack Next.js setup provides a robust, modern, and efficient foundation for building and scaling Novel Nest. Good luck!
