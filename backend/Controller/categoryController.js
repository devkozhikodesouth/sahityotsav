const Category = require("../models/CategoryModel");
const Item = require("../models/itemModel");

const addCategory = async (req, res) => {
  try {
    const { categoryName } = req.body;

    if (!categoryName) {
      return res.status(400).json({ message: "Category name is required." });
    }

    const existingCategory = await Category.findOne({
      categoryName,
    });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists." });
    }

    const category = new Category({
      categoryName,
    });
    const savedCategory = await category.save();

    res.status(201).json({
      data: savedCategory,
      message: "Category added successfully.",
    });
  } catch (error) {
    console.error("Error adding category:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};

const deletecategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const isItemAvailable = await Item.findOne({
      categoryName: categoryId,
    });
    if (isItemAvailable) {
      return res.status(400).json({
        success: false,
        message: "This category has items associated with it",
      });
    }

    const deletedCategory = await Category.findOneAndDelete({
      _id: categoryId,
    });

    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    } else {
      return res
        .status(200)
        .json({ success: true, message: "Category deleted successfully" });
    }
  } catch (error) {
    console.error("Error deleting category:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};

const editCategoryName = async (req, res) => {
  try {
    const { categoryId, categoryName } = req.body;

    const existingCategory = await Category.findOne({
      categoryName,
    });
    if (existingCategory && existingCategory._id.toString() !== categoryId) {
      return res
        .status(400)
        .json({ success: false, message: "Category name already exists" });
    }

    const savedCategory = await Category.findOneAndUpdate(
      { _id: categoryId },
      { categoryName },
      { new: true }
    );

    if (!savedCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Category Not Found" });
    } else {
      return res.status(200).json({
        data: savedCategory,
        message: "Category name updated successfully",
      });
    }
  } catch (error) {
    console.error("Edit category error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getCategory = async (req, res) => {
  try {
    const getCategoryNames = await Category.find();
    if (getCategoryNames) {
      res.status(200).json({
        data: getCategoryNames,
        message: "Category names fetched successfully",
      });
    } else {
      res.status(400).json({
        data: [],
        message: "Category names not found",
      });
    }
  } catch (error) {
    console.error("Get categories error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addCategory,
  deletecategory,
  editCategoryName,
  getCategory,
};
