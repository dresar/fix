# Portfolio Admin Panel

A comprehensive, mobile-first admin dashboard for managing the portfolio application.

## Features

- **Authentication**: JWT-based auth with role management (Admin, Operator, Viewer).
- **Dashboard**: Interactive widgets, charts (Recharts), and PDF/Excel export.
- **CRUD Generator**: Standardized list and form views for entities (e.g., Products).
- **AI Integration**: Powered by Gemini 2.5 Flash via custom API.
  - Auto-generate product descriptions.
  - Smart Admin Assistant chatbot.
- **Dark/Light Mode**: Seamless theme switching.
- **Responsive**: Fully optimized for mobile, tablet, and desktop.

## Installation & Setup

The admin panel is part of the main frontend project.

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
    (Dependencies like `xlsx`, `jspdf`, `recharts` are already added).

2.  **Environment Variables**:
    Create or update `.env` in the project root:
    ```env
    VITE_API_URL=http://localhost:3000/api
    VITE_AI_API_KEY=your_ai_api_key_here
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Access at `http://localhost:5173/admin`.

## Project Structure

```
src/admin/
├── components/     # Shared admin components (Layout, Sidebar, AI Assistant)
├── pages/          # Page components (Dashboard, Products, Login)
├── services/       # API services (Axios, AI)
├── store/          # Zustand state management (Auth)
└── hooks/          # Custom hooks
```

## Adding New CRUD Modules

To add a new entity (e.g., `Orders`):

1.  Duplicate `src/admin/pages/ProductsPage.tsx` -> `OrdersPage.tsx`.
2.  Duplicate `src/admin/pages/ProductFormPage.tsx` -> `OrderFormPage.tsx`.
3.  Update the `columns` definition and `schema` (Zod).
4.  Register the new routes in `src/App.tsx`:
    ```tsx
    <Route path="orders" element={<OrdersPage />} />
    <Route path="orders/:id" element={<OrderFormPage />} />
    ```
5.  Add the link to `src/admin/components/AdminSidebar.tsx`.

## AI Features

- **Chat Assistant**: Click the bot icon in the bottom right.
- **Content Generation**: Use the "Generate with AI" button in forms (e.g., Product Description).

## Deployment

Build the project as usual:
```bash
npm run build
```
The admin panel is bundled with the main application.
