"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// camp routes
const express_1 = __importDefault(require("express"));
const campController_1 = require("../controllers/campController");
const router = express_1.default.Router();
router.post('/addCamp', campController_1.addCamp);
exports.default = router;
