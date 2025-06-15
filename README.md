# Feedback_Smart

**Feedback_Smart** is a web application designed to collect, manage, and analyze user feedback efficiently. The project provides a streamlined interface for users to submit feedback and for administrators to review and act on it. The application emphasizes a clean UI and robust handling of form submissions, leveraging modern web development practices.

<br>

## 🚀 Features
- Modern, responsive React frontend
- RESTful API built with Express.js and Node.js
- MongoDB database for persistent feedback storage
- User authentication and authorization (if implemented)
- Admin dashboard for feedback management
- Scalable and modular codebase
<br>

## Tech Stack

- **Frontend:** React, JavaScript, CSS (optionally with frameworks like Bootstrap or Material-UI)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (with Mongoose ODM)

<br>

## 📂 Project Structure

   Feedback_Smart/
    │
    ├── backend/ # Express.js API
    │ ├── models/ # Mongoose models
    │ ├── routes/ # API routes
    │ ├── controllers/ # Route controllers
    │ ├── middleware/ # Custom middleware (e.g., auth)
    │ ├── .env # Environment variables
    │ └── server.js # Entry point
    │
    ├── frontend/ # React application
    │ ├── src/
    │ │ ├── components/ # Reusable components
    │ │ ├── pages/ # Page components
    │ │ ├── App.js
    │ │ └── index.js
    │ └── public/
    │
    ├── README.md
    └── ...

<br>

## 🛠 Prerequisites

- Node.js and npm
- MongoDB (local or cloud, e.g., MongoDB Atlas)
- Git


<br>

## ⚡️ Quickstart
1. **Clone the repository**
    ```bash
        git clone https://github.com/Srikiran05/Feedback_Smart.git
        cd Feedback_Smart
    ```

2. **Install backend dependencies**

    ```bash 
        cd backend
        npm install
    ```
   
3. **Install frontend dependencies**
    ```bash 
        cd ../frontend
        npm install
    ```


4. **Set up environment variables**
    - Create a `.env` file in the `backend` directory and add your MongoDB connection string and any other secrets

5. **Run the backend server**
    ```bash 
        node server.js
    ```

6. **Run the frontend development server**
    ```bash 
        npm run dev    
    ```

<br>

## 💬 Usage

* Register or log in to your account.

* Submit feedback using the provided form.

* Browse and upvote feedback from other users.

* Admins manage feedback through the dashboard (view, update status, or delete).

* Track the status of feedback as it moves from submission to resolution.
