import Article from "../models/Article.js";

export const getArticles = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 4;
    const skip = (page - 1) * limit;

    const articles = await Article.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Article.countDocuments();

    res.json({
      success: true,
      articles,
      hasMore: skip + articles.length < total,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article)
      return res
        .status(404)
        .json({ success: false, message: "Article not found" });

    res.json({ success: true, article });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
