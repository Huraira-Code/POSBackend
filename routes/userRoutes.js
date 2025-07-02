const express = require("express");
const {
  // loginController,
  registerController,
  deleteUserController,
} = require("./../controllers/userController");

const router = express.Router();

//routes
//Method - get
// router.post("/login", loginController);

//MEthod - POST
router.post("/register", registerController);

// Method - DELETE
router.delete("/:id", deleteUserController);

module.exports = router;
