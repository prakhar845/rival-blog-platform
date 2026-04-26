# Rival Blog Platform 🚀

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs)](https://nestjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![Upstash](https://img.shields.io/badge/Upstash-Redis-00E676?logo=redis)](https://upstash.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)](https://www.prisma.io/)

A modern, full-stack blogging platform built for speed, scalability, and exceptional user experience. 

## ✨ Key Features

* **Secure Authentication:** JWT-based user registration and login with bcrypt password hashing.
* **Dynamic Public Feed:** A paginated home feed displaying all published articles from the community, sorted by most recent.
* **Author Dashboard:** A protected private route where users can manage their content (Create, Read, Update, Delete) and toggle visibility (Publish/Unpublish).
* **Interactive Engagement:** Logged-in users can "Like" posts and leave real-time comments.
* **Premium UX/UI:** Built with Tailwind CSS v4, featuring crisp typography, dynamic reading time calculations, skeleton loaders, and global `react-hot-toast` notifications.
* **Background Processing:** Utilizes Serverless Redis and BullMQ with secure TLS routing to offload heavy asynchronous tasks to a background worker.
* **Enterprise Reliability:** Global API rate-limiting via `@nestjs/throttler` to prevent DDoS attacks, and structured JSON logging via `nestjs-pino` for production-grade observability.

## 🛠️ Tech Stack

**Frontend Architecture:**
* Next.js 15 (App Router)
* React 18
* Tailwind CSS v4 (Light Mode Enforced)
* TypeScript (Strict Mode with custom interfaces)

**Backend Infrastructure:**
* NestJS 10
* **Database:** PostgreSQL (Hosted on **Supabase**)
* **Cache & Message Queue:** Serverless Redis (Hosted on **Upstash**)
* Prisma ORM v5 (with Cascading Deletion)
* Passport.js & JWT (Authentication)
* **Security & Observability:** `@nestjs/throttler` (Rate Limiting) & `nestjs-pino` (Structured Logging)

## 🏗️ Recent Architectural Enhancements

* **Validation Pipeline & Data Integrity:** Hardened NestJS DTOs (`class-validator`) to guarantee precise payload validation and prevent silent data stripping during user registration.
* **Zero-Warning Compilation:** Refactored TypeScript configurations (`tsconfig.json`) to remove deprecated configurations and satisfied maximum-strictness enterprise ESLint rules across the authentication service.
* **Referential Integrity:** Implemented strict `@relation(onDelete: Cascade)` rules across the Prisma schema. Deleting a user now automatically and safely cleans up all associated blogs, likes, and comments without leaving orphaned records in Supabase.
* **Decoupled API Routing:** Hardened the Next.js `fetch` architecture to explicitly route requests to the NestJS backend via robust `NEXT_PUBLIC_API_URL` environment variables, preventing Next.js 404 HTML parsing crashes.
* **Secure Redis Queues:** Upgraded the BullMQ configuration to strictly parse Upstash Redis ports and enforce TLS connection rules (`rejectUnauthorized: false`), eliminating DNS `ENOTFOUND` loops.
* **Strict Type Safety:** Eliminated `any` types across the Next.js dashboard by implementing rigid `BlogData` interfaces, ensuring seamless data mapping from the backend to the frontend UI.

## 📂 Project Structure

```text
rival-blog-platform/
├── backend/                # NestJS API
│   ├── src/
│   │   ├── auth/           # JWT Authentication & Passwords
│   │   ├── blogs/          # CRUD, Likes, Comments, Pagination
│   │   ├── prisma/         # Database connection & Schema
│   │   └── main.ts         # Entry point & CORS setup
├── frontend/               # Next.js Client
│   ├── app/                # App Router (Pages, Layouts, Global Toaster)
│   ├── components/         # Reusable UI (BlogCard, Navbar, Spinner)
│   └── public/             # Static assets
└── README.md
```

## ⚙️ Environment Variables

To run this project locally, create environment files in both the frontend and backend directories.

**Backend (`backend/.env`)**
| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | Supabase Transaction Pooler URL | `postgresql://postgres.[ref]:[pass]@aws-0-region.pooler.supabase.com:6543/postgres` |
| `JWT_SECRET` | Secret key for signing tokens | `super_secret_string_123` |
| `REDIS_HOST` | Upstash Redis Endpoint (Do NOT include port here) | `liberal-cat-12345.upstash.io` |
| `REDIS_PORT` | Upstash Redis Port | `6379` |
| `REDIS_PASSWORD`| Upstash Redis Password | `your_secure_password` |
| `PORT` | API Port (Defaults to 3001) | `3001` |

**Frontend (`frontend/.env.local`)**
| Variable | Description | Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | The base URL of the NestJS backend | `http://localhost:3001` |

## 🚀 Local Setup Instructions

### 1. Start the Backend

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Ensure your Supabase and Upstash connection strings are correctly formatted in your `.env` file. Run the migrations to sync the relational schema and start the API:

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev
```
*The NestJS backend will start on port `3001`.*

### 2. Start the Frontend

Open a new terminal, navigate to the frontend directory, and install dependencies:

```bash
cd frontend
npm install
```

Start the Next.js development server:

```bash
npm run dev
```

The frontend application will be available at `http://localhost:3000`.

## 🔌 API Route Summary

* `POST /auth/register` - Create a new user
* `POST /auth/login` - Authenticate and receive JWT
* `GET /blogs/public/feed` - Fetch paginated published blogs
* `GET /blogs/public/:slug` - Fetch a specific blog by slug
* `GET /blogs/me` - (Protected) Fetch logged-in user's blogs
* `POST /blogs` - (Protected) Create a new blog
* `PATCH /blogs/:id` - (Protected) Update/Publish a blog
* `DELETE /blogs/:id` - (Protected) Delete a blog
* `POST /blogs/:id/like` - (Protected) Like a blog
* `POST /blogs/:id/comments` - (Protected) Add a comment

## 📐 Architecture & Trade-offs

1. **Serverless Infrastructure:** I chose **Supabase** for PostgreSQL to utilize their built-in connection pooling (PgBouncer), which prevents database connection limits from crashing the app during traffic spikes. I paired this with **Upstash**, a serverless Redis provider, to handle the BullMQ message queue without the overhead of managing a traditional Redis cluster.
2. **Decoupled Client-Server:** I explicitly separated the Next.js frontend and NestJS backend. This enables the frontend to be hosted on an edge network (like Vercel) for rapid asset delivery, while the backend scales independently on a cloud provider (like Render).
3. **REST API vs. GraphQL:** I opted for a standard REST API over GraphQL. Given the straightforward CRUD nature of a blogging platform, REST was faster to implement, easier to cache at the edge, and reduced unnecessary overhead payload.
4. **JWTs in LocalStorage vs. HttpOnly Cookies:** For this MVP iteration, JWTs are stored in LocalStorage for simplicity in a decoupled architecture. In a strict production environment, migrating to HttpOnly cookies would provide stronger protection against XSS attacks.

## 📈 Scaling to 1 Million Users

To scale this application to handle 1 million active users, I would implement the following infrastructure upgrades:

1. **Caching Layer:** The `GET /blogs/public/feed` endpoint would be heavily cached in the Upstash Redis instance. Since the public feed is identical for all unauthenticated users, we can serve it from memory rather than querying Supabase thousands of times a second.
2. **Database Read Replicas:** I would utilize Supabase's Read Replicas. The primary database would handle all write requests (new blogs, likes, comments), while multiple replicas across different regions would handle the massive volume of feed read requests.
3. **Content Delivery Network (CDN):** Frontend assets and dynamic page generations would be cached across Vercel's global edge network to reduce latency for international users.
4. **Horizontal Backend Scaling:** The NestJS API is stateless, meaning we can spin up dozens of identical backend instances behind a Load Balancer to distribute incoming traffic evenly.
```