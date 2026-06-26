import pool from "../../../config/db.js";

const userProjectRepo = {
  upsertUserProject: async (userProjectData) => {
    let connection;
    try {
      const {
        userProjectId,
        userId,
        projectId,
        status,
        inactiveReason,
      } = userProjectData;

      const createdUser = 1;

      connection = await pool.getConnection();
      
      const query = `CALL LT_DC_DCS_SP_Insert_Update_User_Project(?, ?, ?, ?, ?, ?, @p_LogicApps_Result)`;
      const values = [
        userProjectId || 0,
        userId,
        projectId,
        createdUser,
        status,
        inactiveReason || "",
      ];

      await connection.query(query, values);
      const [resultRows] = await connection.query("SELECT @p_LogicApps_Result AS result");
      
      const resultMessage = resultRows[0]?.result;
      const resultStr = String(resultMessage || "").toLowerCase();
      
      const isDuplicate = resultStr.includes("duplicate") || resultStr.includes("already exists");
      const isError = resultStr.includes("error");
      
      // If resultMessage is null but no error thrown, treat as success (likely added but message table empty)
      const isSuccess = !isDuplicate && !isError;

      let finalMessage = isSuccess ? "User-Project mapping saved successfully" : "Failed to save mapping";
      if (isDuplicate) finalMessage = "Duplicate entry: This User-Project mapping already exists.";
      else if (resultMessage) finalMessage = resultMessage;

      return {
        success: isSuccess,
        message: finalMessage,
      };
    } catch (err) {
      console.error("❌ Repository Error (upsertUserProject):", err.message);
      return {
        success: false,
        message: "Error saving User-Project mapping.",
        error: err.message,
      };
    } finally {
      if (connection) connection.release();
    }
  },
};

export default userProjectRepo;
