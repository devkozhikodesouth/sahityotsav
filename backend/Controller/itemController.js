const Category = require("../models/CategoryModel");
const Item = require("../models/itemModel");
const Result = require("../models/resultModel");

const addItem = async (req, res) => {
  try {
    const { categoryId, itemName } = req.body;

    const isCategoryAvailable = await Category.findOne({
      _id: categoryId,
    });
    if (!isCategoryAvailable) {
      return res.status(404).json({ message: "The category is not available" });
    }

    const existingItemInSameCate = await Item.findOne({
      itemName,
      categoryName: categoryId,
    });
    if (existingItemInSameCate) {
      return res.status(400).json({ message: "Item already added" });
    }

    const newItem = new Item({
      itemName,
      categoryName: categoryId,
    });
    const savedData = await newItem.save();

    if (savedData) {
      res
        .status(200)
        .json({ data: savedData, message: "Item added successfully" });
    }
  } catch (error) {
    console.error("Add item error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getItem = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const itemData = await Item.find({
      categoryName: categoryId,
    });
    if (itemData) {
      return res
        .status(200)
        .json({ data: itemData, message: "Item data fetched successfully" });
    } else {
      return res.status(400).json({ message: "Item not found" });
    }
  } catch (error) {
    console.error("Get items error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getPublishedItem = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const publishedResults = await Result.find({
      category: categoryId,
      isPublished: { $ne: false },
    }).populate("item");

    const publishedItems = publishedResults
      .map((result) => result.item)
      .filter((item) => item != null);

    if (publishedItems) {
      return res.status(200).json({
        data: publishedItems,
        message: "Published items fetched successfully",
      });
    } else {
      return res.status(400).json({ message: "Item not found" });
    }
  } catch (error) {
    console.error("Get published items error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const deletedItem = await Item.findOneAndDelete({
      _id: itemId,
    });
    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    } else {
      return res
        .status(200)
        .json({ success: true, message: "Item deleted successfully" });
    }
  } catch (error) {
    console.error("Error deleting item:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};

const editItemName = async (req, res) => {
  try {
    const { itemId, categoryId, itemName } = req.body;

    const existingItem = await Item.findOne({
      categoryName: categoryId,
      itemName,
    });
    if (existingItem && existingItem._id.toString() !== itemId) {
      return res
        .status(400)
        .json({ success: false, message: "Item name already exists" });
    }

    const savedItem = await Item.findOneAndUpdate(
      { _id: itemId },
      { itemName },
      { new: true }
    );
    if (!savedItem) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    } else {
      return res.status(200).json({
        data: savedItem,
        message: "Item name updated successfully",
      });
    }
  } catch (error) {
    console.error("Edit item error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  addItem,
  getItem,
  getPublishedItem,
  deleteItem,
  editItemName,
};
