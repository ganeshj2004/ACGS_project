import userProjectService from "./userProjectService.js";

const userProjectController = {
  upsertUserProject: async (req, res) => {
    try {
      // The frontend might send an array if it's using the FormGrid pattern
      const data = Array.isArray(req.body) ? req.body[0] : req.body;
      const result = await userProjectService.upsertUserProject(data);
      res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error("❌ Controller Error (upsertUserProject):", err.message);
      res.status(500).json({ success: false, message: "Server error during mapping update.", error: err.message });
    }
  },
};

export default userProjectController;
