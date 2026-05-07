# Modern Learning Management System (LMS) 🎓

A full-stack Learning Management System designed to deliver educational content, track student progress, and facilitate interactive learning experiences. Recently migrated to a modern Python backend!

## 🌟 Features

*   **Video Course Delivery:** Integrated YouTube video player for seamless course consumption.
*   **Progress Tracking:** Keep track of completed lessons and overall course progress.
*   **Review System:** Allow students to leave reviews and feedback on courses.
*   **Secure Authentication:** User authentication powered by JSON Web Tokens (JWT) and securely hashed passwords.
*   **Payments Integration:** Razorpay integration for seamless purchasing of courses.
*   **Certificates:** Automatic PDF certificate generation upon course completion.
*   **Modern UI/UX:** A responsive, aesthetically pleasing interface built with Tailwind CSS featuring dark-themed, glassmorphism designs.
*   **State Management:** Efficient global state handling using Zustand.
*   **Type-Safe APIs:** End-to-end type safety using TypeScript (Frontend) and Pydantic (Backend).

## 🛠️ Tech Stack

### Frontend
*   **Framework:** Next.js 14 (React)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **State Management:** Zustand
*   **Icons:** Lucide React
*   **Data Fetching:** Axios
*   **Video Integration:** React YouTube

### Backend (Migrated to FastAPI)
*   **Framework:** FastAPI
*   **Language:** Python 3.9+
*   **Database ORM:** SQLAlchemy
*   **Database:** MySQL (PyMySQL)
*   **Authentication:** JWT (python-jose), passlib (bcrypt)
*   **Payments:** Razorpay
*   **PDF Generation:** ReportLab

*(Note: The legacy Node.js/Express backend is kept in the `backend` folder for reference, but the active production backend is `fastapi_backend`.)*

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [Python](https://www.python.org/) (v3.9 or higher)
*   A MySQL Database instance running locally or in the cloud.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  **Backend Setup:**
    ```bash
    cd fastapi_backend
    python -m venv venv
    ```
    *   Activate the virtual environment:
        *   **Windows:** `venv\Scripts\activate`
        *   **Mac/Linux:** `source venv/bin/activate`
    *   Install dependencies:
        ```bash
        pip install -r requirements.txt
        ```
    *   Create a `.env` file in the `fastapi_backend` directory with the following variables:
        ```env
        DATABASE_URL=mysql+pymysql://<user>:<password>@<host>:<port>/<dbname>
        SECRET_KEY=your_super_secret_jwt_key
        ALGORITHM=HS256
        ACCESS_TOKEN_EXPIRE_MINUTES=1440
        RAZORPAY_KEY_ID=your_razorpay_key
        RAZORPAY_KEY_SECRET=your_razorpay_secret
        ```
    *   *(Note: The database tables will be automatically created when you start the server.)*

3.  **Frontend Setup:**
    ```bash
    cd ../frontend
    npm install
    ```
    *   Create a `.env.local` file in the `frontend` directory:
        ```env
        NEXT_PUBLIC_API_URL=http://localhost:5000/api
        ```

### Running the Application

You will need to run both the frontend and backend development servers concurrently.

**1. Start the Backend Server:**
Open a terminal, activate your virtual environment in the `fastapi_backend` directory, and run:
```bash
uvicorn app.main:app --reload --port 5000
```
*The backend API will be available at `http://localhost:5000` and the interactive API documentation (Swagger UI) at `http://localhost:5000/docs`.*

**2. Start the Frontend Server:**
Open a new terminal window in the `frontend` directory and run:
```bash
npm run dev
```
*The frontend application will be available at `http://localhost:3000`.*

### Admin Management
To promote a regular user to an admin role, you can use the provided script in the backend directory:
```bash
cd fastapi_backend
python promote_admin.py <user_email>
```

## 🌍 Deployment

*   **Backend:** Configured for deployment on Render (see `render.yaml` in the `fastapi_backend` directory).
*   **Frontend:** Configured for deployment on Vercel.
*   **Database:** Compatible with cloud providers like Aiven MySQL or any standard MySQL host.

## 📂 Project Structure

```text
LMS/
├── fastapi_backend/       # Python + FastAPI Backend
│   ├── app/               # Main application package
│   │   ├── routers/       # API endpoints (auth, subjects, videos, etc.)
│   │   ├── models.py      # SQLAlchemy database models
│   │   ├── schemas.py     # Pydantic schemas for validation
│   │   ├── database.py    # Database connection logic
│   │   └── main.py        # FastAPI entry point
│   ├── render.yaml        # Render deployment configuration
│   ├── requirements.txt   # Python dependencies
│   └── promote_admin.py   # Script to manage admin roles
├── frontend/              # Next.js Application
│   ├── app/               # App router pages (Next.js 14)
│   ├── components/        # Reusable UI components
│   ├── lib/               # Utility functions and API clients
│   └── package.json       # Node.js dependencies
└── backend/               # Legacy Node.js backend (deprecated)
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
