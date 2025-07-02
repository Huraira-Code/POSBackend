const express = require("express");
const {
  getItemController,
  addItemController,
  editItemController,
  deleteItemController,
} = require("./../controllers/itemController");
const checkSubscription = require('../middleware/checkSubscription')

const router = express.Router();

//routes
//Method - get
router.get("/get-item",checkSubscription, getItemController);

//MEthod - POST
router.post("/add-item", addItemController);

//method - PUT
router.put("/edit-item", editItemController);

//method - DELETE
router.post("/delete-item", deleteItemController);

module.exports = router;
