// routes/showroomRoutes.js
const express = require("express");
const {
  createShowroom,
  getShowrooms,
  getShowroomById,
  updateShowroom,
  deleteShowroom,
} = require("../controllers/showroomController");

const router = express.Router();

router.post("/", createShowroom);
router.get("/", getShowrooms);
router.get("/:id", getShowroomById);
router.put("/:id", updateShowroom);
router.delete("/:id", deleteShowroom);

module.exports = router;
