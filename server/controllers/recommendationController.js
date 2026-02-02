import Article from "../models/Article.js";

// Отримати статті по типу стилю (масив topBlocks)
export const getRecommendedArticles = async (req, res) => {
  const { styles } = req.query; // ?styles=Авторитетний стиль,Ліберальний стиль
  if (!styles) return res.status(400).json({ message: "Не вказано стиль" });

  const stylesArray = styles.split(",");

  try {
    const articles = await Article.find({ tags: { $in: stylesArray } }).limit(
      10,
    );
    res.json({ success: true, articles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
