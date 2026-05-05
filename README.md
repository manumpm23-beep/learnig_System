# Modern Learning Management System (LMS) 🎓

A full-stack Learning Management System designed to deliver educational content, track student progress, and facilitate interactive learning experiences.

## 🌟 Features

*   **Video Course Delivery:** Integrated YouTube video player for seamless course consumption.
*   **Progress Tracking:** Keep track of completed lessons and overall course progress.
*   **Review System:** Allow students to leave reviews and feedback on courses.
*   **Secure Authentication:** User authentication powered by JSON Web Tokens (JWT) and securely hashed passwords.
*   **Modern UI/UX:** A responsive, aesthetically pleasing interface built with Tailwind CSS.
*   **State Management:** Efficient global state handling using Zustand.
*   **Type-Safe APIs:** End-to-end type safety using TypeScript and Prisma ORM.

## 🛠️ Tech Stack

### Frontend
*   **Framework:** Next.js (React)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **State Management:** Zustand
*   **Icons:** Lucide React
*   **Data Fetching:** Axios
*   **Video Integration:** React YouTube

### Backend
*   **Environment:** Node.js
*   **Framework:** Express.js
*   **Language:** TypeScript
*   **Database ORM:** Prisma
*   **Authentication:** JWT (jsonwebtoken), bcryptjs
*   **Middleware:** cors, cookie-parser

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [npm](https://www.npmjs.com/) (comes with Node.js)
*   A relational database (e.g., PostgreSQL or MySQL) supported by Prisma.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    npm install
    ```
    *   Create a `.env` file in the `backend` directory based on the `.env.example`.
    *   Set up your `DATABASE_URL` and `JWT_SECRET` in the `.env` file.
    *   Push the database schema:
        ```bash
        npx prisma db push
        ```

3.  **Frontend Setup:**
    ```bash
    cd ../frontend
    npm install
    ```
    *   Create a `.env` file in the `frontend` directory based on the `.env.example`.
    *   Set your backend API URL (e.g., `NEXT_PUBLIC_API_URL=http://localhost:5000/api`).

### Running the Application

You will need to run both the frontend and backend development servers concurrently.

**1. Start the Backend Server:**
Open a terminal in the `backend` directory and run:
```bash
npm run dev
```
*The backend server will start (usually on port 5000).*

**2. Start the Frontend Server:**
Open a new terminal window in the `frontend` directory and run:
```bash
npm run dev
```
*The frontend application will be available at http://localhost:3000.*

## 📂 Project Structure

```
LMS/
├── backend/               # Node.js + Express API
│   ├── prisma/            # Database schema and migrations
│   ├── src/
│   │   ├── config/        # Environment and DB configurations
│   │   ├── modules/       # Feature modules (progress, reviews, health)
│   │   ├── utils/         # Helper functions (JWT, etc.)
│   │   └── server.ts      # Entry point
│   └── package.json
└── frontend/              # Next.js Application
    ├── app/               # App router pages (Next.js 13+)
    ├── components/        # Reusable UI components (Sidebar, etc.)
    ├── lib/               # Utility functions and API clients
    └── package.json
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
