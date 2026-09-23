# Mini Design Canvas

## Overview
Mini Design Canvas is a full-stack 2D vector canvas editor built for creating, manipulating, persisting, and exporting graphic elements. It provides an interactive drawing board with shape transformations (move, resize, rotate), real-time property editing, layer management, undo/redo history, debounced autosave, and user-isolated cloud storage.

Live Url: https://mini-design-canvas-frontendd.onrender.com/
One small note about the live demo: it is deployed on Render’s free tier, so the service may take a few seconds to wake up when you first open the link. Please wait around 10 seconds and refresh/open it again if needed.

## Features
- **Canvas Shapes**: Insert Rectangles, Circles, and Text elements.
- **Direct Manipulation**: Select shapes with a Konva Transformer for dragging, corner/side resizing, and rotating.
- **Property Inspector**: Edit X/Y position, width, height, circle radius, rotation angle, text content, font size, and fill color.
- **Layer Reordering**: Bring forward, send backward, bring to front, and send to back.
- **Undo / Redo**: Double-stack history tracking all state mutations with keyboard shortcuts (`Ctrl+Z`, `Ctrl+Y`).
- **Autosave**: 2-second debounced synchronization that pauses during active drag/transform interactions.
- **Cloud Persistence**: Save, load, update, and delete canvas documents tied to user accounts.
- **High-DPI PNG Export**: Client-side export using Konva stage rasterization (`pixelRatio: 2`), hiding transformation handles during snapshot.
- **Authentication & Ownership**: JWT-based authentication with password hashing (bcrypt), enforcing document ownership on all canvas routes.

## Tech Stack
### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript, React 18
- **Canvas Rendering**: React Konva / Konva.js (HTML5 Canvas)
- **Styling**: Vanilla CSS with modern dark UI tokens
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Server Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (jsonwebtoken) & bcryptjs
- **Middleware**: CORS, cookie-parser, dotenv

## Architecture
```
Frontend (Next.js / React Konva)
       │
       │ HTTP / REST API (JWT Bearer / Cookie)
       ▼
Backend (Express.js)
       │
       │ Mongoose ODM
       ▼
Database (MongoDB)
```

- **React State as Single Source of Truth**: All shapes are stored in React state as an immutable array of shape objects. React Konva functions as the presentation layer. During drag or transform events, transient coordinates update the node, and upon `dragend` or `transformend`, the node transform is normalized (scale reset to 1) and committed back to React state.
- **Konva's Role**: Konva manages high-performance 2D canvas drawing, event delegation, hit detection, and bounding-box transformer controls without touching the DOM.
- **Authentication & Ownership**: Express middleware verifies the incoming JWT token from the `Authorization: Bearer <token>` header or `token` cookie. All canvas database queries scope operations to `{ _id: canvasId, owner: req.user._id }`, preventing unauthorized access or modifications across accounts.

## Project Structure
```
Mini Design Canvas/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection logic
│   │   ├── controllers/
│   │   │   ├── authController.js     # Register, login, me, logout handlers
│   │   │   └── canvasController.js   # Canvas CRUD and ownership validation
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js     # JWT verification middleware
│   │   │   └── errorMiddleware.js    # 404 and centralized error handler
│   │   ├── models/
│   │   │   ├── Canvas.js             # Canvas schema with embedded shapes
│   │   │   └── User.js               # User schema with bcrypt password hashing
│   │   ├── routes/
│   │   │   ├── authRoutes.js         # /api/auth routes
│   │   │   └── canvasRoutes.js       # /api/canvases routes
│   │   └── server.js                 # Express app, CORS, routes & listener
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css           # Global CSS variables and canvas styles
│   │   │   ├── layout.tsx            # Root layout wrapper
│   │   │   ├── page.tsx              # Main canvas editor page
│   │   │   ├── login/page.tsx        # Login interface
│   │   │   └── register/page.tsx     # Registration interface
│   │   ├── components/
│   │   │   ├── CanvasModal.tsx       # Saved canvases modal
│   │   │   ├── CanvasStage.tsx       # React Konva Stage, Layer, Shapes, Transformer
│   │   │   ├── PropertyPanel.tsx     # Coordinate, size, and color editor
│   │   │   └── Toolbar.tsx           # Shape creation, history, layers, export buttons
│   │   ├── hooks/
│   │   │   └── useCanvasState.ts     # State management, history stack, autosave
│   │   └── lib/
│   │       ├── api.ts                # Fetch client for backend endpoints
│   │       └── types.ts              # TypeScript interfaces for canvas & shapes
│   ├── .env.example
│   ├── next.config.mjs
│   ├── tsconfig.json
│   └── package.json
├── .gitignore
└── README.md
```

## Local Setup

### 1. Clone repository
```bash
git clone <repository-url>
cd "Mini Design Canvas"
```

### 2. Install backend dependencies
```bash
cd backend
npm install
```

### 3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

### 4. Configure environment variables
Create `.env` inside `backend/`:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

Create `.env.local` inside `frontend/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 5. Start MongoDB
Ensure MongoDB is running locally:
```bash
# Windows PowerShell example
Get-Service -Name *mongo*
# Or start via mongod
mongod --dbpath <path-to-data-dir>
```

### 6. Start backend
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

### 7. Start frontend
```bash
cd frontend
npm run dev
# App runs on http://localhost:3000
```

## Environment Variables

### Backend (`backend/.env`)
| Variable | Required | Default / Example | Purpose |
|---|---|---|---|
| `PORT` | No | `5000` | Port Express listens on |
| `MONGODB_URI` | Yes | `your_mongodb_uri` | MongoDB connection string |
| `FRONTEND_URL` | Yes (prod) | `http://localhost:3000` | Allowed frontend origin for CORS |
| `CLIENT_ORIGIN`| No | `http://localhost:3000` | Fallback frontend origin alias |
| `JWT_SECRET` | Yes | `your_jwt_secret` | Secret key for signing auth tokens |
| `NODE_ENV` | No | `development` | Runtime environment mode |

### Frontend (`frontend/.env.local`)
| Variable | Required | Default / Example | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:5000` | Target URL for backend REST API calls |

## API Endpoints

### Authentication (`/api/auth`)
| Method | Path | Purpose | Authentication |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user account | None |
| `POST` | `/api/auth/login` | Authenticate user and receive JWT token | None |
| `POST` | `/api/auth/logout` | Clear session cookie | None |
| `GET` | `/api/auth/me` | Fetch authenticated profile details | Required (Bearer / Cookie) |

### Canvases (`/api/canvases`)
| Method | Path | Purpose | Authentication |
|---|---|---|---|
| `POST` | `/api/canvases` | Create a new canvas document | Required |
| `GET` | `/api/canvases` | List all canvases owned by authenticated user | Required |
| `GET` | `/api/canvases/:id` | Retrieve full canvas document with shapes | Required |
| `PUT` | `/api/canvases/:id` | Update canvas name and shape collection | Required |
| `DELETE` | `/api/canvases/:id` | Delete canvas document by ID | Required |

### Health
| Method | Path | Purpose | Authentication |
|---|---|---|---|
| `GET` | `/api/health` | Service health status check | None |

## Features / Usage
- **Creating Shapes**: Click the Rectangle, Circle, or Text buttons in the toolbar to instantiate shapes centered on the canvas with distinct default styling.
- **Selecting & Manipulating**: Click any shape or its bounding box to select it. Drag to move, grab transform handles to resize or change radius, or use the rotation handle to rotate.
- **Properties**: With a shape selected, the right-side inspector allows editing exact coordinates, dimensions, rotation degrees, text content, font size, and fill color.
- **Layers**: Adjust stacking order using Bring Forward, Send Backward, Bring to Front, and Send to Back toolbar controls.
- **Undo / Redo**: Every committed change creates a history snapshot. Revert changes with `Ctrl+Z` or the Undo toolbar button; restore with `Ctrl+Y` or Redo.
- **Save / Load**: Click Save to immediately persist the canvas to MongoDB. Click Open to browse, preview, load, or delete saved canvases.
- **Autosave**: Changes automatically synchronize 2 seconds after the user stops interacting, reflected by the toolbar status indicator (`Saving...`, `Saved`, `Unsaved`).
- **PNG Export**: Click "Export PNG" to rasterize the canvas at 2x resolution and download a PNG file matching the canvas name.
- **Authentication**: Sign up or log in from the login/register screens to access and persist your private workspace.

## Deployment

### Backend on Render (Web Service)
1. Create a new **Web Service** on Render pointing to the repository root with root directory `backend`.
2. **Build Command**: `npm install`
3. **Start Command**: `npm run start` (or `node src/server.js`)
4. **Environment Variables**:
   - `PORT`: `5000` (or Render standard port)
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: MongoDB Atlas connection URI (`mongodb+srv://...`)
   - `FRONTEND_URL`: URL of the deployed frontend service (`https://<frontend-app>.onrender.com`)
   - `JWT_SECRET`: Secure production secret string

### Frontend on Render (Static Site)
1. Create a new **Static Site** on Render pointing to the repository.
2. **Root Directory**: `frontend`
3. **Build Command**: `npm install && npm run build`
4. **Publish Directory**: `out` (or `frontend/out` if root directory is left empty)
5. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: URL of the deployed backend service (`https://<backend-app>.onrender.com`)

*(Note: In Render Static Site "Redirects/Rewrites", add a rewrite `/*` -> `/index.html` with status `200` if needed for SPA fallback).*

### CORS Configuration
Backend CORS is dynamically bound to `process.env.FRONTEND_URL || process.env.CLIENT_ORIGIN`. It strips trailing slashes, enables `credentials: true`, supports standard HTTP methods (`GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`), and allows `Content-Type` and `Authorization` headers.

## Known Limitations
- **Single Element Selection**: Selection and transformations operate on one shape at a time; multi-element marquee selection is not supported.
- **Fixed Canvas Viewport**: Canvas dimensions are configured to 960x640 within a centered editor workspace without infinite pan/zoom.

## Verification
- **Backend API Suite**: Executed end-to-end automated verification script covering CORS preflight, user registration, JWT authentication (`/api/auth/me`), canvas creation, list retrieval, element updates, cross-user ownership isolation (403 forbidden), and deletion (14/14 tests passing).
- **Frontend Build**: Verified with Next.js production build (`npm run build`), including full TypeScript validation (`npx tsc --noEmit`) and static page generation for all routes (`/`, `/login`, `/register`).
- **Browser Interaction**: Verified shape creation, dragging, scaling, rotating, property edits, layer reordering, delete shortcut/button, undo/redo stacks, autosave sync, and PNG export.
