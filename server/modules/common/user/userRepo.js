import pool from "../../../config/db.js";

const userRepo = {
  upsertUser: async (userId, username, password, role, createdUser, status, inactiveReason) => {
    try {
      const query = "CALL LT_DC_DCS_SP_Insert_Update_User(?, ?, ?, ?, ?, ?, ?, @p_LogicApps_Result);";
      await pool.query(query, [userId, username, password, role, createdUser, status, inactiveReason]);
      const [resultRows] = await pool.query("SELECT @p_LogicApps_Result AS message;");
      const message = resultRows?.[0]?.message || "Unknown response";
      const isError = message.toLowerCase().includes("error") || message.toLowerCase().includes("duplicate");
      return { success: !isError, message };
    } catch (err) {
      return { success: false, message: "Repo error", error: err.message };
    }
  },

  authenticate: async (username, password) => {
    try {
      const query = "CALL LT_DC_DCS_SP_Authenticate_User(?, ?);";
      const [rows] = await pool.query(query, [username, password]);
      return { success: rows[0].length > 0, user: rows[0][0] };
    } catch (err) {
      return { success: false, message: "Auth error", error: err.message };
    }
  },

  getDeveloperProjects: async (userId) => {
    try {
      const query = "CALL LT_DC_DCS_SP_Get_Developer_Projects(?);";
      const [rows] = await pool.query(query, [userId]);
      return { success: true, projects: rows[0] };
    } catch (err) {
      return { success: false, message: "Fetch projects error", error: err.message };
    }
  }
};

export default userRepo;
