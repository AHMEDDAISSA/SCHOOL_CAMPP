"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const postController_1 = require("../controllers/postController");
const postController_2 = require("../controllers/postController");
const router = express_1.default.Router();
router.post("/add", postController_1.createPost);
router.get("/get", postController_1.getPosts);
router.get("/:id", postController_2.getPostById);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);
exports.default = router;
