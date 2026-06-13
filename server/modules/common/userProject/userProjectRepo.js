import pool from "../../../config/db.js";

const userProjectRepo = {
  upsertUserProject: async (userProjectData) => {
    try {
      const {
        userProjectId,
        userId,
        projectId,
        status,
        inactiveReason,
      } = userProjectData;

      const createdUser = 1; // Default to admin for now

      const query = `CALL LT_DC_DCS_SP_Insert_Update_User_Project(?, ?, ?, ?, ?, ?, @p_LogicApps_Result)`;
      
      const values = [
        userProjectId || 0,
        userId,
        projectId,
        createdUser,
        status,
        inactiveReason || "",
      ];

      await pool.query(query, values);
      const [resultRows] = await pool.query("SELECT @p_LogicApps_Result AS result");
      
      const resultMessage = resultRows[0]?.result;
      const resultStr = String(resultMessage || "").toLowerCase();
      
      const isDuplicate = resultStr.includes("duplicate") || resultStr.includes("already exists");
      const isError = resultStr.includes("error");
      const isSuccess = resultMessage != null && !isDuplicate && !isError;

      let finalMessage = isSuccess ? "User-Project mapping saved successfully" : "Failed to save mapping";
      if (isDuplicate) finalMessage = "Duplicate entry: This User-Project mapping already exists.";
      else if (isError || !isSuccess) finalMessage = resultMessage || finalMessage;

      return {
        success: isSuccess,
        message: finalMessage,
      };
    } catch (err) {
      console.error("❌ Repository Error (upsertUserProject):", err.message || err.sqlMessage);
      return {
        success: false,
        message: "Error saving User-Project mapping.",
        error: err.message || err.sqlMessage,
      };
    }
  },
};

export default userProjectRepo;
