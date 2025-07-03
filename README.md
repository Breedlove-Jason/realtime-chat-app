# Realtime Chat Application

A modern, feature-rich real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.io for real-time communication.

![Realtime Chat App](https://placeholder-for-app-screenshot.com)

## Features

- **Real-time Messaging**: Instant message delivery using Socket.io
- **User Authentication**: Secure signup and login functionality
- **Online Status**: See which users are currently online
- **Image Sharing**: Send and receive images in conversations
- **Profile Management**: Update profile information and avatar
- **Theme Support**: Toggle between light and dark themes
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technologies Used

### Backend
- **Node.js** & **Express**: Server framework
- **MongoDB** & **Mongoose**: Database and ODM
- **Socket.io**: Real-time bidirectional communication
- **JWT**: Authentication and authorization
- **bcrypt.js**: Password hashing
- **Cloudinary**: Cloud storage for images

### Frontend
- **React**: UI library
- **Vite**: Build tool
- **React Router**: Navigation and routing
- **Zustand**: State management
- **Tailwind CSS** & **DaisyUI**: Styling
- **Socket.io Client**: Real-time communication with the server
- **Axios**: HTTP requests
- **React Hot Toast**: Notifications

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup
1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/realtime-chat-app.git
   cd realtime-chat-app
   ```

2. Install backend dependencies
   ```bash
   cd backend
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5006
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. Start the backend server
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Open a new terminal and navigate to the frontend directory
   ```bash
   cd ../frontend
   ```

2. Install frontend dependencies
   ```bash
   npm install
   ```

3. Start the frontend development server
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Sign Up**: Create a new account with your email, username, and password
2. **Log In**: Access your account with your credentials
3. **Start Chatting**: Click on a user from the sidebar to start a conversation
4. **Send Messages**: Type your message in the input field and press Enter or click the send button
5. **Share Images**: Click the image icon to upload and send images
6. **Update Profile**: Navigate to the profile page to update your information and avatar
7. **Change Theme**: Toggle between light and dark themes in the settings

## API Documentation

### Authentication Endpoints
- `POST /api/auth/signup`: Register a new user
- `POST /api/auth/login`: Authenticate a user
- `GET /api/auth/logout`: Log out a user
- `GET /api/auth/check`: Check authentication status

### Message Endpoints
- `GET /api/messages/:userId`: Get messages between the authenticated user and another user
- `POST /api/messages`: Send a new message

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Socket.io Documentation](https://socket.io/docs/v4/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express Documentation](https://expressjs.com/)