export function generateNodeStack(meta) {
  const parent = meta.parent || {};
  const rows = meta.columns || [];

  const procName = parent.name || "sp_generated_proc";
  const table = parent.table || "YOUR_TABLE";
  const userVar = parent.userVar || "C2C_User";
  const resultVar = parent.resultVar || "LogicApps_Result";

  function colArray(val) {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return [val];
  }

  const insertCols = rows.flatMap((r) => colArray(r.Insert));
  const updateCols = rows.flatMap((r) => colArray(r.Update));
  const whereCols = rows.flatMap((r) => colArray(r.Where));

  const uniqueParams = [...new Set([...insertCols, ...updateCols, ...whereCols])].filter(p => 
    !["C2C_CUSER", "C2C_UUSER", "C2C_CDATE", "C2C_UDATE"].includes(p.toUpperCase())
  );

  const controllerName = `${table.toLowerCase().split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}Controller`;

  const nodeCode = `
/**
 * GENERATED NODE.JS STACK FOR: ${table}
 * Procedure: ${procName}
 * Created On: ${new Date().toLocaleString()}
 */

// ==========================================
// 1. REPOSITORY (repo.js)
// ==========================================
import pool from "../../../config/db.js";

export const repository = {
  upsert: async (data, userId) => {
    const query = \`CALL ${procName}(
      ${uniqueParams.map(p => `?`).join(', ')},
      ?, -- \${userVar}
      @result
    )\`;
    
    const params = [
      ${uniqueParams.map(p => `data.${p} || null`).join(',\n      ')},
      userId
    ];

    await pool.query(query, params);
    const [resultRows] = await pool.query("SELECT @result as message");
    return resultRows[0].message;
  },

  getAll: async () => {
    const [rows] = await pool.query("SELECT * FROM ${table} ORDER BY 1 DESC");
    return rows;
  }
};


// ==========================================
// 2. CONTROLLER (controller.js)
// ==========================================
export const ${controllerName} = {
  save: async (req, res) => {
    try {
      const { rows } = req.body; // Expecting array of records
      const userId = req.user?.id || 1;
      
      const results = [];
      for (const row of rows) {
        const msg = await repository.upsert(row, userId);
        results.push({ row, message: msg });
      }

      res.json({ success: true, message: "Operation completed", results });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  list: async (req, res) => {
    try {
      const data = await repository.getAll();
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};


// ==========================================
// 3. ROUTES (routes.js)
// ==========================================
import express from "express";
const router = express.Router();

router.get("/list", ${controllerName}.list);
router.post("/save", ${controllerName}.save);

export default router;
`;

  return nodeCode;
}
