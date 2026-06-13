import userRepo from "./userRepo.js";

const userService = {
  upsertUser: (userData) => userRepo.upsertUser(
    userData.userId || 0,
    userData.username,
    userData.password,
    userData.role,
    userData.createdUser,
    userData.status,
    userData.inactiveReason || ""
  ),
  login: (username, password) => userRepo.authenticate(username, password),
  getDeveloperProjects: (userId) => userRepo.getDeveloperProjects(userId)
};

export default userService;
