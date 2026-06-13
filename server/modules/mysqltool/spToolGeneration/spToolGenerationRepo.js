import pool from "../../../config/db.js";

const spToolGenerationRepo = {
  insertOrUpdateSPTool: async (params) => {
    try {
      const {
        spGenDetailsId,
        spName,
        spDescription,
        moduleName,
        productName,
        authorName,
        tableName,
        columns,
        userVar,
        scopeIdentity,
        errMsg,
        scopeVar,
        status,
        inactiveReason,
        user,
      } = params;

      const query = `
        CALL LT_DC_SP_INSERT_UPDATE_SPTOOL_GENERATION_TEST_DETAILS(
            ?, ?, ?, ?, ?, ?, ?,    -- 1 to 7
            ?,                      -- 8 JSON
            ?, ?, ?, ?,             -- 9 to 12
            ?, ?, ?,                -- 13 to 15
            @p_C2C_Result           -- OUT param
        );
        `;

      // Convert JS Array → JSON String
      const columnsJSON =
        columns && columns.length
          ? JSON.stringify(columns)
          : JSON.stringify([]);

      await pool.query(query, [
        spGenDetailsId,
        spName,
        spDescription,
        moduleName,
        productName,
        authorName,
        tableName,
        columnsJSON,
        userVar,
        scopeIdentity,
        errMsg,
        scopeVar,
        status,
        inactiveReason,
        user,
      ]);

      // Out parameter
      const [rows] = await pool.query("SELECT @p_C2C_Result AS result;");

      const result = rows?.[0]?.result || "UNKNOWN";
      console.log("✅ Repo: SP Tool Generation Result:", result);

      const isError =
        result.toString().toLowerCase().includes("error") ||
        result.toString().toLowerCase().includes("failed");

      return {
        success: !isError,
        message: result,
        insertedId: !isError ? Number(result) : null,
      };
    } catch (err) {
      console.error("❌ Repo Error (insertOrUpdateSPTool):", err.message);

      return {
        success: false,
        message: "Repository Error",
        error: err.message,
      };
    }
  },
};

export default spToolGenerationRepo;
