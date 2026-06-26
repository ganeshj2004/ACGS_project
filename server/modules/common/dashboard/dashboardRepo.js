import pool from "../../../config/db.js";

const dashboardRepo = {
  getStats: async () => {
    const stats = {};
    
    // 1. Total Procedures
    const [procRows] = await pool.query("SELECT COUNT(*) as count FROM DCS_M_INSERT_UPDATE_SP_GEN_DETAILS");
    stats.totalProcedures = procRows[0].count;
    
    // 2. Active Projects
    const [projRows] = await pool.query("SELECT COUNT(*) as count FROM DCS_M_PROJECT WHERE C2C_Status = 1");
    stats.activeProjects = projRows[0].count;
    
    // 3. User Count
    const [userRows] = await pool.query("SELECT COUNT(*) as count FROM DCS_M_USER");
    stats.totalUsers = userRows[0].count;
    
    // 4. Recent Activity
    const [activityRows] = await pool.query(`
      SELECT 
        Insert_Update_SP_Name as name, 
        Insert_Update_SP_Module_Name as module,
        Insert_Update_SP_Author_Name as author,
        C2C_Cdate as date
      FROM DCS_M_INSERT_UPDATE_SP_GEN_DETAILS 
      ORDER BY C2C_Cdate DESC 
      LIMIT 5
    `);
    stats.recentActivity = activityRows;
    
    return stats;
  }
};

export default dashboardRepo;
