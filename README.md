# AltSchool Africa Todo Application

## Backend Engineering Submission -- AltSchool Africa

------------------------------------------------------------------------

## 📌 Project Description

This Todo Application is a full-stack backend-driven task management
system built with Node.js, Express, MongoDB, and EJS templating.

The application demonstrates core backend engineering concepts
including:

-   Session-based authentication and authorization
-   Secure password hashing using bcrypt
-   RESTful routing principles
-   MVC architectural structure
-   MongoDB schema design with Mongoose
-   Task filtering and state management
-   Production-ready deployment configuration

Users can register, login, create tasks, edit them, mark them as
completed, soft-delete them, and permanently remove deleted tasks. The
system enforces proper access control, ensuring users can only manage
their own tasks.

The project was developed to meet AltSchool Backend Engineering
requirements and follows clean, modular coding standards.

------------------------------------------------------------------------

## 🚀 Live Deployment

Live URL: https://your-app-name.onrender.com\
(Update with your deployed link)

------------------------------------------------------------------------

## 🛠 Tech Stack

-   Node.js
-   Express.js
-   MongoDB Atlas
-   Mongoose ODM
-   express-session
-   bcryptjs
-   EJS
-   Bootstrap 5
-   Morgan
-   dotenv
-   Render (Deployment)

------------------------------------------------------------------------

## 📁 Project Structure

    altschool-todo-app/
    ├── models/          
    ├── views/           
    │   ├── auth/        
    │   ├── partials/    
    │   ├── dashboard.ejs
    │   └── edit-task.ejs
    ├── routes/          
    ├── middleware/      
    ├── public/          
    │   ├── css/style.css
    │   └── js/app.js
    ├── scripts/         
    ├── .env.example     
    ├── .gitignore
    ├── index.js         
    ├── package.json
    └── README.md

The application follows MVC principles for maintainability and
scalability.

------------------------------------------------------------------------

## 🔐 Authentication & Authorization

-   Session-based authentication using express-session
-   Password hashing using bcrypt
-   Protected dashboard and task routes
-   Users can only access and modify their own tasks

Session secret is stored securely in environment variables.

------------------------------------------------------------------------

## 📬 Application Routes Summary

### Authentication Routes

  Method   Route       Description
  -------- ----------- -------------------
  GET      /login      Login page
  POST     /login      Authenticate user
  GET      /register   Registration page
  POST     /register   Create new user
  GET      /logout     Logout user

------------------------------------------------------------------------

### Task Routes (Protected)

  Method   Route               Description
  -------- ------------------- -------------------------
  GET      /dashboard          User dashboard
  POST     /tasks              Create new task
  POST     /tasks/:id/status   Update task status
  GET      /tasks/:id/edit     Edit task form
  POST     /tasks/:id/edit     Update task
  POST     /tasks/:id/delete   Permanently delete task

------------------------------------------------------------------------

## 🗄️ Database Schema

### User Schema

-   username (unique, required)
-   password (hashed, required)
-   timestamps

### Task Schema

-   title (required)
-   description (optional)
-   status (pending, completed, deleted)
-   priority (low, medium, high)
-   user (reference to User)
-   timestamps

------------------------------------------------------------------------

## 🧪 Testing

Testing was conducted using:

-   Manual testing via browser
-   Health check endpoint
-   Session debugging endpoint
-   Jest and Supertest (where implemented)

Test Command:

    npm test

------------------------------------------------------------------------

## 🌍 Environment Variables

  Variable         Required   Description
  ---------------- ---------- ---------------------------
  PORT             Yes        Server port
  MONGODB_URI      Yes        MongoDB connection string
  SESSION_SECRET   Yes        Session encryption key
  NODE_ENV         No         Environment type

------------------------------------------------------------------------

## 🚀 Deployment Instructions (Render)

1.  Push code to GitHub
2.  Create new Web Service on Render
3.  Set:
    -   Build Command: npm install
    -   Start Command: npm start
4.  Add environment variables
5.  Deploy

Ensure MongoDB Atlas IP whitelist includes 0.0.0.0/0 for Render access.

------------------------------------------------------------------------

## 🧪 Postman / Testing Guide

Although this is a server-rendered app, routes can be tested using
Postman for:

-   Login (POST)
-   Register (POST)
-   Task creation (POST)
-   Status updates

(Optional) Add your Postman collection link here: \[Insert Postman
Collection Link\]

------------------------------------------------------------------------

## ✅ AltSchool Requirement Alignment

✔ Session-based authentication\
✔ Password hashing\
✔ CRUD functionality\
✔ Soft delete implementation\
✔ Task filtering by status\
✔ Priority levels\
✔ Protected routes\
✔ Environment configuration\
✔ Deployment-ready setup\
✔ MVC structure

------------------------------------------------------------------------

## 📄 License

This project was created for educational purposes as part of the
AltSchool Africa Backend Engineering program.

------------------------------------------------------------------------

## 👨‍💻 Author

George Owoicho\
AltSchool Africa Backend Engineering Student\
GitHub: https://github.com/devGeorgeOwi/altschool-todo-app
