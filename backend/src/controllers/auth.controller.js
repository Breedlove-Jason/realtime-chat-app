import { generateToken } from "../lib/utils.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  console.log('Signup controller called');
  console.log('Request body:', req.body);
  
  try {
    // Check if req.body exists
    if (!req.body) {
      console.error('Request body is undefined');
      return res.status(400).json({ message: "Request body is missing" });
    }
    
    // Access body properties safely
    const fullName = req.body.fullName;
    const email = req.body.email;
    const password = req.body.password;
    
    // Check if required fields are present
    if (!fullName || !email || !password) {
      console.error('Missing required fields:', { 
        hasFullName: !!fullName, 
        hasEmail: !!email, 
        hasPassword: !!password 
      });
      return res.status(400).json({ 
        message: "Missing required fields (fullName, email, or password)" 
      });
    }
    
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    
    const user = await User.findOne({ email });
    if (user)
      return res.status(400).json({ message: "User already exists with this email" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });
    
    if (newUser) {
      // generate jwt token
      generateToken(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        message: "User created successfully",
        user: {
          id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
        },
      });
    } else {
      res.status(400).json({message: "User creation failed"});
    }
  } catch (error) {
    console.error("Error during signup:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = (req, res) => {
  res.send("login route");
};

export const logout = (req, res) => {
  res.send("logout route");
};