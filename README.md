# 🚀 Next.js Frontend Base Repository

This repository serves as the frontend base for our project, built with Next.js and optimized for collaboration among multiple developers.

---

## Deployment

Link: [Frontend Deployment](https://sound-hortensia-frontend-adpro-a05-f5cc1fb9.koyeb.app/)


## 📦 Dependencies

The project uses the following key dependencies:

### **Core Stack**

- **Next.js** (App Router) – React framework for SSR/SSG.
- **TypeScript** – Strongly typed JavaScript.
- **NPM** – Dependency manager.

### **Styling & UI**

- **Tailwind CSS** – Utility-first CSS framework.
- **DaisyUI** – Tailwind-based component library.

### **State & Data Management**

- **Zustand** – Lightweight state management.
- **Ky** – HTTP client for API calls.

### **Code Quality & Formatting**

- **Prettier** – Code formatter.

---

## 📖 Setup & Running the Project

### **1️⃣ Install Dependencies**

```sh
npm install
```

### **2️⃣ Start the Development Server**

```sh
npm run dev
```

This runs the project locally at `http://localhost:3000/`.

### **3️⃣ Build for Production**

```sh
npm run build
```

### **4️⃣ Start Production Server**

```sh
npm run start
```

---

## 📂 Project Structure & App Router Usage

Next.js App Router is based on a **file-system routing system** where each folder inside `app/` represents a route.

```
📂 src/
 ┣ 📂 app/
 ┃ ┣ 📂 dashboard/   → `/dashboard`
 ┃ ┃ ┗ 📄 page.tsx   → Main page for this route
 ┃ ┣ 📂 user/
 ┃ ┃ ┣ 📂 [id]/      → Dynamic route `/user/:id`
 ┃ ┃ ┃ ┗ 📄 page.tsx
 ┃ ┃ ┗ 📄 page.tsx   → `/user`
 ┃ ┣ 📄 layout.tsx   → Shared layout for all routes
 ┃ ┗ 📄 page.tsx     → Homepage (`/`)
```

### **📌 Key Routing Features**

✅ **Each folder in `app/` represents a route** (e.g., `app/dashboard/` → `/dashboard`)
✅ **Use `layout.tsx` for shared UI like headers or sidebars**
✅ **Dynamic routes are defined using `[param]`** (e.g., `app/user/[id]/page.tsx` → `/user/:id`)
✅ **API calls should use `app/api/` for backend logic (e.g., `app/api/auth/route.ts`)**

---

## ✨ Additional Notes

- **Environment Variables**: Store API keys in `.env.local` or `.env`, ensuring only `NEXT_PUBLIC_*` variables are accessible on the client side.
- **State Management**: Zustand is used for managing app-wide states.
- **API Calls**: Ky is set up with a default base URL in `src/api/*`.
