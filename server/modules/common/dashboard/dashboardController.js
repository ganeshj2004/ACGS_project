import dashboardRepo from "./dashboardRepo.js";

const dashboardController = {
  getStats: async (req, res) => {
    try {
      const stats = await dashboardRepo.getStats();
      res.json({ success: true, data: stats });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

export default dashboardController;
