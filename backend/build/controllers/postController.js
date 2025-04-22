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
exports.deletePost = exports.updatePost = exports.getPostById = exports.getPosts = exports.createPost = void 0;
const Post_1 = __importDefault(require("../models/Post"));
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, title, description, category, published_by } = req.body;
        const newPost = new Post_1.default({ email, title, description, category, published_by });
        yield newPost.save();
        res.status(201).json(newPost);
    }
    catch (error) {
        res.status(500).json({ message: "Error creating post", error });
    }
});
exports.createPost = createPost;
const getPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield Post_1.default.find().populate("published_by");
        res.status(200).json(posts);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching posts", error });
    }
});
exports.getPosts = getPosts;
const getPostById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield Post_1.default.findById(req.params.id).populate("published_by");
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        return res.status(200).json(post);
    }
    catch (error) {
        return res.status(500).json({ message: "Error fetching post", error });
    }
});
exports.getPostById = getPostById;
const updatePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedPost = yield Post_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedPost)
            return res.status(404).json({ message: "Post not found" });
        res.status(200).json(updatedPost);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating post", error });
    }
});
exports.updatePost = updatePost;
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedPost = yield Post_1.default.findByIdAndDelete(req.params.id);
        if (!deletedPost)
            return res.status(404).json({ message: "Post not found" });
        res.status(200).json({ message: "Post deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting post", error });
    }
});
exports.deletePost = deletePost;
