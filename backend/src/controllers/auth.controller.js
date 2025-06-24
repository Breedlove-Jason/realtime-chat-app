import { generateToken } from "../lib/utils.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";

// Extracted validation functions
const validateRequestBody = (req) => {
  if (!req.body) {
    return { isValid: false, message: "Request body is missing" };
  }
  return { isValid: true };
};

// Modified to handle both signup and login cases
const validateRequiredFields = (fields) => {
  const missingFields = Object.entries(fields)
    .filter(([_, value]) => !value)
    .map(([key, _]) => key);
  
  if (missingFields.length > 0) {
    return {
      isValid: false,
      message: `Missing required fields (${missingFields.join(", ")})`,
      debug: fields
    };
  }
  return { isValid: true };
};

const validatePassword = (password) => {
  if (password.length < 6) {
    return {
      isValid: false,
      message: "Password must be at least 6 characters long"
    };
  }
  return { isValid: true };
};

// Standardized error response handler
const handleError = (res, status, message, error = null) => {
  if (error) console.error(message, error);
  return res.status(status).json({ message });
};

export const signup = async (req, res) => {
  console.log("Signup controller called");
  console.log("Request body:", req.body);

  try {
    // Validate request body
    const bodyValidation = validateRequestBody(req);
    if (!bodyValidation.isValid) {
      return handleError(res, 400, bodyValidation.message);
    }

    const { fullName, email, password } = req.body;

    // Validate required fields
    const fieldsValidation = validateRequiredFields({
      fullName,
      email,
      password
    });
    
    if (!fieldsValidation.isValid) {
      console.error("Missing required fields:", fieldsValidation.debug);
      return handleError(res, 400, fieldsValidation.message);
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return handleError(res, 400, passwordValidation.message);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return handleError(res, 400, "User already exists with this email");
    }

    // Create new user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    // Generate JWT token and save user
    generateToken(newUser._id, res);
    await newUser.save();
    
    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
      },
    });
  } catch (error) {
    return handleError(res, 500, "Internal server error", error.message);
  }
};

export const login = async (req, res) => {
  try {
    console.log("Login request body:", req.body);
    
    // Validate request body
    const bodyValidation = validateRequestBody(req);
    if (!bodyValidation.isValid) {
      return handleError(res, 400, bodyValidation.message);
    }

    const { email, password } = req.body;
    
    // Validate required fields for login (only email and password)
    const fieldsValidation = validateRequiredFields({
      email,
      password
    });
    
    if (!fieldsValidation.isValid) {
      return handleError(res, 400, fieldsValidation.message);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return handleError(res, 400, "Invalid Credentials");
    }
    
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return handleError(res, 400, "Invalid Credentials");
    }
    
    generateToken(user._id, res);
    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    return handleError(res, 500, "Internal server error", error.message);
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    return handleError(res, 500, "Internal server error", error.message);
  }
};

export const updateProfile = async (req, res) => {

}