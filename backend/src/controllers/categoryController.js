const Category = require("../models/Category");
const Note = require("../models/Note");

// Create category
exports.createCategory = async (req, res) => {
  try {
    const { name, color } = req.body;
    const userId = req.user.userId;

    // Check if category already exists for this user
    const existingCategory = await Category.findOne({
      name: name.toLowerCase(),
      user_id: userId,
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        errors: {
          name: "Category already exists",
        },
      });
    }

    const formattedColor = color ? color.replace("#", "") : "ffffff";

    const category = new Category({
      name: name.toLowerCase(),
      color: formattedColor,
      user_id: userId,
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: {
        id: category._id,
        name: category.name,
        color: `#${category.color}`,
        createdAt: category.createdAt,
      },
    });
  } catch (error) {
    console.error("Category creation error:", error);
    res.status(500).json({
      success: false,
      errors: {
        server: "Error creating category",
      },
    });
  }
};

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const userId = req.user.userId;

    const categories = await Category.find({ user_id: userId }).sort({
      name: 1,
    });

    res.json({
      success: true,
      categories: categories.map((category) => ({
        id: category._id,
        name: category.name,
        color: `#${category.color}`,
        createdAt: category.createdAt,
      })),
    });
  } catch (error) {
    console.error("Categories fetch error:", error);
    res.status(500).json({
      success: false,
      errors: {
        server: "Error fetching categories",
      },
    });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;
    const userId = req.user.userId;

    const category = await Category.findOne({
      _id: id,
      user_id: userId,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        errors: {
          category: "Category not found",
        },
      });
    }

    if (name) {
      const existingCategory = await Category.findOne({
        name: name.toLowerCase(),
        user_id: userId,
        _id: { $ne: id },
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          errors: {
            name: "Category name already exists",
          },
        });
      }
      category.name = name.toLowerCase();
    }

    if (color) {
      category.color = color.replace("#", "");
    }

    await category.save();

    res.json({
      success: true,
      message: "Category updated successfully",
      category: {
        id: category._id,
        name: category.name,
        color: `#${category.color}`,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
    });
  } catch (error) {
    console.error("Category update error:", error);
    res.status(500).json({
      success: false,
      errors: {
        server: "Error updating category",
      },
    });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Delete category
    const category = await Category.findOneAndDelete({
      _id: id,
      user_id: userId,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        errors: {
          category: "Category not found",
        },
      });
    }

    // Remove category from all notes
    await Note.updateMany({ user_id: userId }, { $pull: { categories: id } });

    res.json({
      success: true,
      message: "Category deleted successfully and removed from all notes",
    });
  } catch (error) {
    console.error("Category deletion error:", error);
    res.status(500).json({
      success: false,
      errors: {
        server: "Error deleting category",
      },
    });
  }
};
