

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/server.ts
import dotenv3 from "dotenv";

// src/app.ts
import express3 from "express";
import cors from "cors";

// src/module/auth/auth.routes.ts
import express from "express";

// src/config/db.ts
import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();
var pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// src/module/auth/auth.service.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// src/utills/createError.ts
var createError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

// src/module/auth/auth.service.ts
var signup = async (payload) => {
  if (!payload) {
    throw createError("Request body missing", 400);
  }
  const { name, email, password, role } = payload;
  if (!name || !email || !password) {
    throw createError("Name, email and password are required", 400);
  }
  const emailQuery = "SELECT * FROM users WHERE email=$1";
  const emailResult = await pool.query(emailQuery, [email]);
  if (emailResult.rows.length > 0) {
    throw createError("Email already exists", 409);
  }
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
var login = async (payload) => {
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
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    }
  };
};

// src/utills/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data
  });
};
var sendResponse_default = sendResponse;

// src/module/auth/auth.controller.ts
var signupUser = async (req, res) => {
  try {
    const result = await signup(req.body);
    return sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result
    });
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 400,
      success: false,
      message: error.message
    });
  }
};
var loginUser = async (req, res) => {
  try {
    const result = await login(req.body);
    return sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 400,
      success: false,
      message: error.message
    });
  }
};

// src/module/auth/auth.routes.ts
var router = express.Router();
router.post("/signup", signupUser);
router.post("/login", loginUser);
var auth_routes_default = router;

// src/module/issues/issue.routes.ts
import express2 from "express";

// src/module/issues/issue.service.ts
var createIssueIntoDB = async (payload, reporterId) => {
  const query = `
    INSERT INTO issues
    (title,description,type,reporter_id)
    VALUES($1,$2,$3,$4)
    RETURNING *
  `;
  const values = [payload.title, payload.description, payload.type, reporterId];
  const result = await pool.query(query, values);
  return result.rows[0];
};
var getAllIssuesFromDB = async (queryData) => {
  let query = "SELECT * FROM issues";
  let conditions = [];
  let values = [];
  if (queryData.type) {
    values.push(queryData.type);
    conditions.push(`type=$${values.length}`);
  }
  if (queryData.status) {
    values.push(queryData.status);
    conditions.push(`status=$${values.length}`);
  }
  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }
  if (queryData.sort === "oldest") {
    query += " ORDER BY created_at ASC";
  } else {
    query += " ORDER BY created_at DESC";
  }
  const issuesResult = await pool.query(query, values);
  const issues = issuesResult.rows;
  const finalData = [];
  for (const issue of issues) {
    const userQuery = "SELECT id,name,role FROM users WHERE id=$1";
    const userResult = await pool.query(userQuery, [issue.reporter_id]);
    finalData.push({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter: userResult.rows[0],
      created_at: issue.created_at,
      updated_at: issue.updated_at
    });
  }
  return finalData;
};
var getSingleIssueFromDB = async (id) => {
  const query = "SELECT * FROM issues WHERE id=$1";
  const result = await pool.query(query, [id]);
  const issue = result.rows[0];
  if (!issue) {
    throw createError("Issue not found", 404);
  }
  const userQuery = "SELECT id,name,role FROM users WHERE id=$1";
  const userResult = await pool.query(userQuery, [issue.reporter_id]);
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: userResult.rows[0],
    created_at: issue.created_at,
    updated_at: issue.updated_at
  };
};
var updateIssueIntoDB = async (id, payload, user) => {
  const findQuery = "SELECT * FROM issues WHERE id=$1";
  const findResult = await pool.query(findQuery, [id]);
  const issue = findResult.rows[0];
  if (!issue) {
    throw createError("Issue not found", 404);
  }
  if (user.role === "contributor" && issue.reporter_id !== user.id) {
    throw createError("You can only edit your own issue", 403);
  }
  if (user.role === "contributor" && issue.status !== "open") {
    throw createError("Cannot edit non-open issue", 403);
  }
  const query = `
    UPDATE issues
    SET
      title=$1,
      description=$2,
      type=$3,
      status=$4,
      updated_at=CURRENT_TIMESTAMP
    WHERE id=$5
    RETURNING *
  `;
  const values = [
    payload.title || issue.title,
    payload.description || issue.description,
    payload.type || issue.type,
    payload.status || issue.status,
    id
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};
var deleteIssueFromDB = async (id) => {
  const findQuery = "SELECT * FROM issues WHERE id=$1";
  const findResult = await pool.query(findQuery, [id]);
  if (findResult.rows.length === 0) {
    throw createError("Issue not found", 404);
  }
  const query = "DELETE FROM issues WHERE id=$1";
  await pool.query(query, [id]);
};

// src/module/issues/issue.controller.ts
var createIssue = async (req, res) => {
  try {
    const result = await createIssueIntoDB(req.body, req.user.id);
    return sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result
    });
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 400,
      success: false,
      message: error.message
    });
  }
};
var getAllIssues = async (req, res) => {
  try {
    const result = await getAllIssuesFromDB(req.query);
    return sendResponse_default(res, {
      statusCode: 200,
      success: true,
      data: result
    });
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message
    });
  }
};
var getSingleIssue = async (req, res) => {
  try {
    const result = await getSingleIssueFromDB(
      Number(req.params.id)
    );
    return sendResponse_default(res, {
      statusCode: 200,
      success: true,
      data: result
    });
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 404,
      success: false,
      message: error.message
    });
  }
};
var updateIssue = async (req, res) => {
  try {
    const result = await updateIssueIntoDB(
      Number(req.params.id),
      req.body,
      req.user
    );
    return sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result
    });
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 400,
      success: false,
      message: error.message
    });
  }
};
var deleteIssue = async (req, res) => {
  try {
    await deleteIssueFromDB(Number(req.params.id));
    return sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 404,
      success: false,
      message: error.message
    });
  }
};

// src/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var auth = (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return sendResponse_default(res, {
        statusCode: 401,
        success: false,
        message: "Unauthorized"
      });
    }
    const decoded = jwt2.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 401,
      success: false,
      message: "Invalid token"
    });
  }
};

// src/middleware/checkRole.ts
var checkRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendResponse_default(res, {
        statusCode: 403,
        success: false,
        message: "Forbidden"
      });
    }
    next();
  };
};

// src/module/issues/issue.routes.ts
var router2 = express2.Router();
router2.post("/", auth, createIssue);
router2.get("/", getAllIssues);
router2.get("/:id", getSingleIssue);
router2.patch("/:id", auth, updateIssue);
router2.delete("/:id", auth, checkRole("maintainer"), deleteIssue);
var issue_routes_default = router2;

// src/app.ts
import dotenv2 from "dotenv";
dotenv2.config();
var app = express3();
app.use(cors());
app.use(express3.json());
app.use(express3.urlencoded({ extended: true }));
app.use("/api/auth", auth_routes_default);
app.use("/api/issues", issue_routes_default);
app.get("/", (req, res) => {
  res.send("DevPulse Server Running");
});
var app_default = app;

// src/server.ts
dotenv3.config();
var PORT = process.env.PORT || 5e3;
if (process.env.NODE_ENV !== "production") {
  app_default.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
}
//# sourceMappingURL=server.js.map