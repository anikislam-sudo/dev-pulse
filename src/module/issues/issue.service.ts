import { pool } from "../../config/db";

export const createIssueIntoDB = async (payload: any, reporterId: number) => {
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

export const getAllIssuesFromDB = async (queryData: any) => {
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
      updated_at: issue.updated_at,
    });
  }

  return finalData;
};

export const getSingleIssueFromDB = async (id: number) => {
  const query = "SELECT * FROM issues WHERE id=$1";

  const result = await pool.query(query, [id]);

  const issue = result.rows[0];

  if (!issue) {
    throw new Error("Issue not found");
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
    updated_at: issue.updated_at,
  };
};

export const updateIssueIntoDB = async (
  id: number,
  payload: any,
  user: any,
) => {
  const findQuery = "SELECT * FROM issues WHERE id=$1";

  const findResult = await pool.query(findQuery, [id]);

  const issue = findResult.rows[0];

  if (!issue) {
    throw new Error("Issue not found");
  }

  if (user.role === "contributor" && issue.reporter_id !== user.id) {
    throw new Error("You can only edit your own issue");
  }

  if (user.role === "contributor" && issue.status !== "open") {
    throw new Error("Cannot edit non-open issue");
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
    id,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

export const deleteIssueFromDB = async (id: number) => {
  const findQuery = "SELECT * FROM issues WHERE id=$1";

  const findResult = await pool.query(findQuery, [id]);

  if (findResult.rows.length === 0) {
    throw new Error("Issue not found");
  }

  const query = "DELETE FROM issues WHERE id=$1";

  await pool.query(query, [id]);
};
