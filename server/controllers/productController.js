const { ObjectId } = require("mongodb");

async function getProducts(req, res) {
  try {
    const products = await req.app.locals.db
      .collection("products")
      .find({})
      .toArray();

    res.json(products);
  } catch (error) {
    console.error("Could not get products:", error.message);
    res.status(500).json({ message: "Could not load products." });
  }
}

async function getProductById(req, res) {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID." });
    }

    const product = await req.app.locals.db
      .collection("products")
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.json(product);
  } catch (error) {
    console.error("Could not get product:", error.message);
    res.status(500).json({ message: "Could not load product." });
  }
}

module.exports = { getProducts, getProductById };