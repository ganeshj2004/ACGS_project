import express from "express";
const router = express.Router();

// Import module route files
import languageRoutes from "../modules/common/language/languageRoutes.js";
import lovRoutes from "../modules/common/lov/lovRoutes.js";
import moduleRoutes from "../modules/common/module/moduleRoutes.js";
import lov_detRoutes from "../modules/common/lov_det/lov_detRoutes.js";
import projectRoutes from "../modules/common/project/projectRoutes.js";
import dbConnectionRoutes from "../modules/common/dbConnection/dbConnectionRoutes.js";
import dropDownRoutes from "../modules/common/dropDowm/dropDownRoutes.js";
import masterGridRoutes from "../modules/common/masterGrid/masterGridRoutes.js";
import errorMessageRoutes from "../modules/common/errorMessage/errorMessageRoutes.js";
import productRoutes from "../modules/common/product/productRoutes.js";
import userRoutes from "../modules/common/user/userRoutes.js";
import userProjectRoutes from "../modules/common/userProject/userProjectRoutes.js";


// ✅ Use routes with base paths
router.use("/language", languageRoutes);
router.use("/lov", lovRoutes);
router.use("/module", moduleRoutes);
router.use("/lov_det", lov_detRoutes);
router.use("/project", projectRoutes);
router.use("/dbConnection", dbConnectionRoutes);
router.use("/drop-down", dropDownRoutes);
router.use("/master-grid", masterGridRoutes);
router.use("/error-msg", errorMessageRoutes);
router.use("/product", productRoutes);
router.use("/user", userRoutes);
router.use("/user-project", userProjectRoutes);

export default router;
