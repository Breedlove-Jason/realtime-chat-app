import {User} from '../models/user.model.js';

export const signup = (req, res) => {
  const {fullName, email, password} = req.body;
  try{
    if(password.length < 6) {
      return res.status(400).send('Password must be at least 6 characters long');
    }
    // const user= await User
  }catch(error) {
    console.error('Error during signup:', error);
    res.status(500).send('Internal Server Error');
  }
};

export const login = (req, res) => {
  res.send('login route');
};

export const logout = (req, res) => {
  res.send('logout route');
};
