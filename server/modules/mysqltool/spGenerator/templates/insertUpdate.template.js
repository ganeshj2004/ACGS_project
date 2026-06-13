export function generateInsertUpdateSP(meta) {
  const parent = meta.parent || {};
  const rows = meta.columns || [];

  const procName = parent.name || "sp_generated_proc";
  const table = parent.table || "YOUR_TABLE";

  const author = parent.author || "unknown_user";
  const product = parent.product || "";
  const module = parent.module || "";
  const description = parent.description || "";
  const createdOn = parent.date || new Date().toISOString();

  const userVar = parent.userVar || "C2C_User";
  const resultVar = parent.resultVar || "LogicApps_Result";

  const errSuccessInsert = parent.errSuccessInsert || "S1010";
  const errSuccessUpdate = parent.errSuccessUpdate || "S1011";
  const errDuplicate = parent.errDuplicate || "E1011";
  const errSqlException = parent.errSqlException || "E1012";

  // ====================================================================
  // Helper: Convert "column1,column2" / "[col1,col2]" / "col1" into array
  // ====================================================================
  function colArray(val) {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === "string" && val.startsWith("[") && val.endsWith("]")) {
      try {
        return JSON.parse(val.replace(/'/g, '"'));
      } catch (e) {}
    }
    return [val];
  }

  // Build column sets
  const insertCols = rows.flatMap((r) => colArray(r.Insert));
  const updateCols = rows.flatMap((r) => colArray(r.Update));
  const whereCols = rows.flatMap((r) => colArray(r.Where));
  const dateCols = rows.flatMap((r) => colArray(r.ConvertDate));

  // Remove unwanted parameters (your requirement)
  const removeParams = ["C2C_Cuser", "C2C_Uuser", "C2C_Cdate", "C2C_Udate"].map(
    (x) => x.toUpperCase()
  );

  // Build unique IN parameters
  const uniqueParams = [
    ...new Set([...insertCols, ...updateCols, ...whereCols]),
  ].filter((p) => !removeParams.includes(p.toUpperCase()));

  const params = uniqueParams
    .map((c) => `IN p_${c} VARCHAR(255)`)
    .join(",\n    ");

  const finalParams = `
    ${params},
    IN p_${userVar} INT,


    
    OUT p_${resultVar} VARCHAR(250)
  `.trim();

  // ============================================================
  // INSERT column/value builder
  // ============================================================
  const insertColNames = insertCols.map((c) => `\`${c}\``).join(", ");

  const insertValues = insertCols
    .map((c) => {
      const col = c.toUpperCase();
      if (col.endsWith("_CDATE"))
        return `CONVERT_TZ(NOW(), '+00:00', '+05:30')`;
      if (col.endsWith("_CUSER")) return `p_${userVar}`;
      if (dateCols.includes(c)) return `CONVERT_TZ(NOW(), '+00:00', '+05:30')`;
      return `p_${c}`;
    })
    .join(", ");

  // ============================================================
  // UPDATE SET builder
  // ============================================================
  const updateSet = updateCols
    .map((c) => {
      const col = c.toUpperCase();
      if (col.endsWith("_UDATE"))
        return `\`${c}\` = CONVERT_TZ(NOW(), '+00:00', '+05:30')`;
      if (col.endsWith("_UUSER")) return `\`${c}\` = p_${userVar}`;
      return `\`${c}\` = p_${c}`;
    })
    .join(",\n            ");

  // WHERE clause
  const whereClause = whereCols.length
    ? whereCols.map((c) => `\`${c}\` = p_${c}`).join(" AND ")
    : "1=0";

  const pk = whereCols[0]; // primary key (first Where column)

  // ============================================================
  // FINAL SP TEMPLATE
  // ============================================================
  const sp = `
DELIMITER $$

CREATE PROCEDURE ${procName} (
    ${finalParams}
)
BEGIN
    -- ===============================================================================
    -- Company: LogicAppsMI       Description: ${description}
    -- Product: ${product}        Module: ${module}
    -- Date: ${createdOn}         Author: ${author}
    -- ===============================================================================

    DECLARE v_Record_Count INT DEFAULT 0;
    DECLARE v_Err_Msg VARCHAR(250);

    -- SQL Exception Handler
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SELECT Error_Msg INTO v_Err_Msg
        FROM DCS_M_ERR_MESSAGE
        WHERE Error_Code = '${errSqlException}'
        LIMIT 1;

        SET p_${resultVar} = v_Err_Msg;
        ROLLBACK;
    END;

    START TRANSACTION;

    -- Duplicate check logic
    SELECT COUNT(*) INTO v_Record_Count
    FROM ${table}
    WHERE ${whereClause};

    -- INSERT CASE
    IF (p_${pk} <= 0 AND v_Record_Count = 0) THEN
        
        SELECT Error_Msg INTO v_Err_Msg
        FROM DCS_M_ERR_MESSAGE
        WHERE Error_Code = '${errSuccessInsert}'
        LIMIT 1;

        INSERT INTO ${table} (
            ${insertColNames}
        ) VALUES (
            ${insertValues}
        );

        SET p_${resultVar} = v_Err_Msg;

    -- INSERT DUPLICATE
    ELSEIF (p_${pk} <= 0 AND v_Record_Count > 0) THEN
        
        SELECT Error_Msg INTO v_Err_Msg
        FROM DCS_M_ERR_MESSAGE
        WHERE Error_Code = '${errDuplicate}'
        LIMIT 1;

        SET p_${resultVar} = v_Err_Msg;

    -- UPDATE CASE
    ELSEIF (p_${pk} > 0 AND v_Record_Count = 0) THEN
        
        SELECT Error_Msg INTO v_Err_Msg
        FROM DCS_M_ERR_MESSAGE
        WHERE Error_Code = '${errSuccessUpdate}'
        LIMIT 1;

        UPDATE ${table}
        SET
            ${updateSet}
        WHERE ${whereClause};

        SET p_${resultVar} = v_Err_Msg;

    -- UPDATE DUPLICATE
    ELSEIF (p_${pk} > 0 AND v_Record_Count > 0) THEN
        
        SELECT Error_Msg INTO v_Err_Msg
        FROM DCS_M_ERR_MESSAGE
        WHERE Error_Code = '${errDuplicate}'
        LIMIT 1;

        SET p_${resultVar} = v_Err_Msg;
    END IF;

    COMMIT;
END $$

DELIMITER ;
`;

  return sp;
}
