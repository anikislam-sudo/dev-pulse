import { pool } from "../../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signup = async (payload: any) => {
  const emailQuery = "SELECT * FROM users WHERE email=$1";

  const emailResult = await pool.query(emailQuery, [payload.email]);

  if (emailResult.rows.length > 0) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const query = `
    INSERT INTO users(name,email,password,role)
    VALUES($1,$2,$3,$4)
    RETURNING id,name,email,role,created_at,updated_at
  `;

  const values = [
    payload.name,
    payload.email,
    hashedPassword,
    payload.role || "contributor",
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

export const login = async (payload: any) => {
  const query = "SELECT * FROM users WHERE email=$1";

  const result = await pool.query(query, [payload.email]);

  const user = result.rows[0];

  if (!user) {
    throw new Error("User not found");
  }

  const isMatched = await bcrypt.compare(payload.password, user.password);

  if (!isMatched) {
    throw new Error("Password incorrect");
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
