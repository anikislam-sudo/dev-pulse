import { pool } from "../../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createError } from "../../utills/createError";

// Helper error function

// ================= SIGNUP =================
export const signup = async (payload: any) => {
  if (!payload) {
    throw createError("Request body missing", 400);
  }

  const { name, email, password, role } = payload;

  if (!name || !email || !password) {
    throw createError("Name, email and password are required", 400);
  }

  // check email exists
  const emailQuery = "SELECT * FROM users WHERE email=$1";
  const emailResult = await pool.query(emailQuery, [email]);

  if (emailResult.rows.length > 0) {
    throw createError("Email already exists", 409);
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = `
    INSERT INTO users(name,email,password,role)
    VALUES($1,$2,$3,$4)
    RETURNING id,name,email,role,created_at,updated_at
  `;

  const values = [name, email, hashedPassword, role || "contributor"];

  const result = await pool.query(query, values);

  return result.rows[0];
};

// ================= LOGIN =================
export const login = async (payload: any) => {
  if (!payload) {
    throw createError("Request body missing", 400);
  }

  const { email, password } = payload;

  if (!email || !password) {
    throw createError("Email and password are required", 400);
  }

  const query = "SELECT * FROM users WHERE email=$1";
  const result = await pool.query(query, [email]);

  const user = result.rows[0];

  if (!user) {
    throw createError("User not found", 404);
  }

  const isMatched = await bcrypt.compare(password, user.password);

  if (!isMatched) {
    throw createError("Password incorrect", 401);
  }

  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      role: user.role,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "7d",
    },
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
  };
};
