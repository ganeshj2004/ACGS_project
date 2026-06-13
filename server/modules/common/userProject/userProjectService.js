import userProjectRepo from "./userProjectRepo.js";

const userProjectService = {
  upsertUserProject: async (userProjectData) => {
    try {
      const normalizedData = {
        userProjectId: userProjectData.userProjectId || 0,
        userId: userProjectData.userId,
        projectId: userProjectData.projectId,
        status: userProjectData.status === undefined ? 1 : userProjectData.status,
        inactiveReason: userProjectData.inactiveReason?.trim() || "",
      };

      if (!normalizedData.userId || !normalizedData.projectId) {
        return {
          success: false,
          message: "User ID and Project ID are required.",
        };
      }

      return await userProjectRepo.upsertUserProject(normalizedData);
    } catch (err) {
      console.error("❌ Service Error (upsertUserProject):", err.message);
      return {
        success: false,
        message: "Error processing User-Project request in service layer.",
        error: err.message,
      };
    }
  },
};

export default userProjectService;
