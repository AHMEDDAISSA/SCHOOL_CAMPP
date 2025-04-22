"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCamp = void 0;
const Camp_1 = __importDefault(require("../models/Camp"));
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
const addCamp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type, year, location, description } = req.body;
    const camp = { type, year, location, description };
    if (!type || !year || !location || !description) {
        res.status(400).send('camp is required');
        return;
    }
    try {
        const c = new Camp_1.default(camp);
        yield c.save();
        res.send(`Camp saved: ${c}`);
    }
    catch (error) {
        console.error('Error saving camp:', error);
        res.status(500).send('Error saving camp');
    }
});
exports.addCamp = addCamp;
