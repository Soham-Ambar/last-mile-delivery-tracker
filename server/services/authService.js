const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateAccessToken } = require('../utils/jwt');
const { AUTH_DUPLICATE_EMAIL, AUTH_INVALID_CREDENTIALS } = require('../constants/messages');
const { CUSTOMER } = require('../constants/roles');

async function registerUser(payload) {
  const { name, email, password, phone, role } = payload;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error(AUTH_DUPLICATE_EMAIL);
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phone,
    role: role || CUSTOMER,
  });

  return user;
}

async function loginUser(payload) {
  const { email, password } = payload;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new Error(AUTH_INVALID_CREDENTIALS);
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error(AUTH_INVALID_CREDENTIALS);
  }

  const token = generateAccessToken({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

async function logoutUser(user) {
  throw new Error('Not Implemented');
}

async function getProfile(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
};
