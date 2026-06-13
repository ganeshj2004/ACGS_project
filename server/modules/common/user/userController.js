import userService from "./userService.js";

const userController = {
  upsertUser: async (req, res) => {
    try {
      const result = await userService.upsertUser(req.body);
      res.status(result.success ? 201 : 400).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      const result = await userService.login(username, password);
      if (result.success) {
        res.status(200).json({ success: true, user: result.user });
      } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  getDeveloperProjects: async (req, res) => {
    try {
      const { userId } = req.params;
      const result = await userService.getDeveloperProjects(userId);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

export default userController;
