# 🏋️ Gym Management System

A modern web application for managing gym workouts, coaches, and client interactions. Built with **React, TypeScript, Material-UI, Node.js, Express, and MongoDB**.

---

## 🌟 Key Features

### 🏃 For Clients
- **Seamless Account Management**
  - Sign up/Login with email
  - Customize profile settings
  - Select preferred language

- **Effortless Workout Booking**
  - Explore available workout sessions
  - Filter by activity, date, time, and coach
  - Book or cancel sessions easily
  - View all scheduled workouts
  - Provide feedback after sessions

- **Engage with Coaches**
  - Browse coach profiles & testimonials
  - Schedule workouts with preferred coaches
  - Rate & review coaching sessions

### 🏋️‍♂️ For Coaches
- **Manage Workout Sessions**
  - View and organize scheduled sessions
  - Adjust workout slots & availability
  - Track client attendance
  - Receive and review client feedback

### 🔧 For Admins
- **Admin Dashboard**
  - Review member, coach, booking, and feedback totals
  - Browse recent member registrations and workouts

### 📄 Additional Pages
- `/about` — Learn about the platform and its approach to fitness.
- `/programs` — Explore workout activities and find a coach.
- `/testimonials` — Read feedback shared by members after coaching sessions.
- `/faq` — Answers to common booking, account, and coaching questions.
- `/contact` — Shortcuts to help, coaches, and account support.

### 🛡️ Admin Dashboard Setup
The admin dashboard is available at `/admin`. It requires an existing account promoted by a database administrator; public registration cannot grant admin access.

From `gym_management-be`, promote an existing user by their email:

```bash
npm run admin:promote -- admin@example.com
```

The user must sign in again after promotion. Admin API requests verify both the signed-in user and their current `isAdmin` value in MongoDB. The dashboard currently provides a read-only overview.

---

## 🚀 Getting Started

### ✅ Prerequisites
Ensure you have the following installed:
- **Vite** (for frontend)
- **Node.js** (v14 or higher)
- **MongoDB**
- **npm** or **yarn**
- **Git**

### 📥 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/adityasinghz/gym-management.git
   cd gym_management
   ```

2. Install dependencies for both frontend and backend:
   ```bash
   cd gym_management-fe
   npm install
   cd ../gym_management-be
   npm install
   ```

3. Create a `.env` file in the backend root directory and add:
   ```env
   MONGO_URI=<your_mongodb_connection_string>
   PRIVATE_KEY_PATH=private.pem
   PUBLIC_KEY_PATH=public.pem
   ```
   Generate a fresh local RSA key pair first by running `node generateRSAKeys.js` from the backend directory. The generated `private.pem` and `public.pem` files are gitignored; do not commit signing keys. Do not use the legacy tracked key files.

4. Start the backend server:
   ```bash
   npm start
   ```
   The API will be running on `http://localhost:5000`.

5. Start the frontend:
   ```bash
   npm run dev
   ```
   The application will be running on `http://localhost:5173`.

---

## 🛠️ Tech Stack

| **Technology**      | **Usage**                          |
|--------------------|---------------------------------|
| React + TypeScript | Frontend development           |
| Material-UI (MUI)  | UI components & design system  |
| Redux             | State management               |
| React Hook Form + Zod | Form handling & validation  |
| React Router v6   | Client-side navigation         |
| Axios            | HTTP client for API requests   |
| Node.js + Express | Backend server                 |
| MongoDB + Mongoose | Database & ODM               |
| JWT + bcrypt     | Authentication & security      |
| CORS & dotenv    | Environment & security configs |
| react-i18next   | Language Translation |
---

## 📱 User Journeys

### 🔹 Client Flow
1. **Sign Up & Login**: Create an account, log in, and get redirected based on your role.
2. **Find Workouts**: Browse and filter sessions by time, activity, and coach.
3. **Book a Session**: Select a preferred date/time, confirm, and receive a booking confirmation.
4. **Manage Bookings**: View upcoming sessions, cancel if needed, and leave feedback after completion.

### 🔹 Coach Flow
1. **Session Dashboard**: Track upcoming workouts and client bookings.
2. **Availability Management**: Adjust time slots and update professional details.
3. **Client Interaction**: Receive ratings, reviews, and feedback from clients.

### 🔹 Admin Flow (Upcoming)
1. **User & Coach Management**: View, approve, or suspend users and coaches.
2. **Monitor Activity**: Track all bookings, testimonials, and feedback.
3. **Ensure System Integrity**: Remove spam testimonials or flag inappropriate activities.

---

## 🔗 API Endpoints

### **User Endpoints**
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Log in a user
- `GET /api/users/coach` - Get a list of coaches
- `PUT /api/users/update/:userId` - Update user information
- `POST /api/users/filter` - Filter coaches based on criteria

### **Workout Endpoints**
- `POST /api/workouts/book` - Book a workout
- `GET /api/workouts/:userId/:isCoach` - Get workouts for a user or coach
- `PATCH /api/workouts/:workoutId/status` - Cancel a workout

### **Testimonial Endpoints**
- `POST /api/testimonials` - Create a new testimonial
- `GET /api/testimonials/:coachId` - Get testimonials for a specific coach

---

## 🔒 Security Measures

- **JWT-based authentication** for secure user sessions
- **HTTP-only cookies** for better security
- **Protected routes** to prevent unauthorized access
- **Form validation** to ensure data integrity
- **Secure password handling** with encryption

---

## 🎨 User Experience Highlights

- **Responsive Design**: Works seamlessly across devices
- **Dark/Light Mode**: Choose your preferred theme
- **Smooth Navigation**: Intuitive UI for easy access
- **Loading States & Error Handling**: Improves app performance
- **Toast Notifications**: Instant feedback on actions

---

## 🚀 Deployment Options

- **Frontend**:
  - Vercel (`vercel.json` configured)
  - Render (`_redirects` file for routing)
  - Any static hosting service

- **Backend**:
  - Deployed on **Render** or **Railway.app**
  - MongoDB hosted on **MongoDB Atlas**
  - Can be hosted on **AWS EC2, Heroku, or DigitalOcean**

---

## 🤝 Contributing

Want to contribute? Follow these steps:
1. **Fork the repository**
2. **Create a feature branch**
3. **Commit your changes**
4. **Push to your branch**
5. **Open a Pull Request**

---

## 📄 License

This project is licensed under the **MIT License**. See the LICENSE file for details.

---

🔗 Happy coding & fitness tracking! 🚀💪
