export const getRecommendedArticles = async (req, res) => {
  try {
    const { styles } = req.query;
    if (!styles) {
      return res
        .status(400)
        .json({ success: false, message: "Не вказано стиль" });
    }

    const stylesArray = styles.split(",").map((s) => s.trim());

    const articles = await Article.find({
      tags: { $in: stylesArray },
    }).limit(6);

    res.json({ success: true, articles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
