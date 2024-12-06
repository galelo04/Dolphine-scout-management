const express = require("express");
const Router = express.Router({ mergeParams: true });
const { validateParentID, validateParentScout } = require("../middlewares/Validate");
const parentController = require("../controllers/parentController");

Router.route("/")
    .get(parentController.getAllParents)
    .post(parentController.addParent)

Router.route("/:id")
    .get(parentController.getParentById)
    .delete(parentController.deleteParent)

Router.route("/:id/scouts")
    .get(validateParentID, parentController.getScouts)
    .post(validateParentScout, parentController.addScout);

module.exports = Router;