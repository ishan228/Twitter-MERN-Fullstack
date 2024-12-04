import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req, res) => {
  try {
    const { text, img } = req.body;
    const userId = req.user._id.toString();

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Validate input
    if (!text && !img) {
      return res.status(400).json({ error: "Post must have text or image" });
    }

    let imgUrl = null;
    if (img) {
      try {
        const uploadedResponse = await cloudinary.uploader.upload(img);
        imgUrl = uploadedResponse.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError.message);
        return res.status(500).json({ error: "Failed to upload image" });
      }
    }

    // Create and save the post
    const newPost = new Post({
      user: userId,
      text,
      img: imgUrl,
    });
    await newPost.save();

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: newPost,
    });
  } catch (error) {
    console.error("Error in createPost controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const deletePost = async (req, res) => {
  try {
    // Corrected parameter retrieval
    const post = await Post.findById(req.params.Id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if the user is authorized to delete the post
    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ error: "You are not authorized to delete this post" });
    }

    // Delete the associated image from Cloudinary if it exists
    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }

    // Delete the post from the database
    await Post.findByIdAndDelete(postId);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log("Error in deletePost controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
