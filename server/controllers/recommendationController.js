export const getRecommendedArticles = async (req, res) => {
  try {
    const { styles } = req.query;
    if (!styles) {
      return res
        .status(400)
        .json({ success: false, message: "Не вказано стиль" });
    }

    // Розбиваємо рядок і прибираємо зайві пробіли навколо назв стилів
    const stylesArray = styles.split(",").map((s) => s.trim());

    // Шукаємо статті, де в масиві tags є ХОЧА Б ОДИН із надісланих стилів
    const articles = await Article.find({
      tags: { $in: stylesArray },
    }).limit(6);

    res.json({ success: true, articles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
