const { ObjectId } = require("mongodb");
const { randomUUID } = require("crypto");

const getCart = (req, res) => {
  res.status(200).json(req.session.cart ?? []);
};

async function addToCart(req, res) {
  try {
    const { productId, size, color } = req.body;
    const quantity = Number(req.body.quantity);

    if (
      !ObjectId.isValid(productId) ||
      typeof size !== "string" ||
      !size.trim() ||
      typeof color !== "string" ||
      !color.trim() ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return res.status(400).json({ message: "Invalid cart item." });
    }

    const product = await req.app.locals.db
      .collection("products")
      .findOne({ _id: new ObjectId(productId) });

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    if (
      !product.sizes?.includes(size) ||
      !product.colors?.includes(color)
    ) {
      return res.status(400).json({ message: "Invalid product options." });
    }

    const cart = req.session.cart ?? [];

    const newItem = {
      itemId: randomUUID(),
      productId: product._id.toString(),
      name: product.name,
      image: product.image,
      size,
      color,
      quantity,
      unitPrice: product.price,
    };

    req.session.cart = [...cart, newItem];
    return res.status(201).json(req.session.cart);
  } catch (error) {
    console.error("Could not add cart item:", error.message);
    return res.status(500).json({ message: "Could not add item to cart." });
  }
}

function updateCartItem(req, res) {
  const quantity = Number(req.body.quantity);
  const cart = req.session.cart ?? [];
  const item = cart.find(({ itemId }) => itemId === req.params.itemId);

  if (!Number.isInteger(quantity) || quantity < 1) {
    return res
      .status(400)
      .json({ message: "Quantity must be a positive integer." });
  }

  if (!item) {
    return res.status(404).json({ message: "Cart item not found." });
  }

  item.quantity = quantity;
  req.session.cart = cart;

  return res.status(200).json(cart);
}

function removeCartItem(req, res) {
  const cart = req.session.cart ?? [];
  const remainingItems = cart.filter(
    ({ itemId }) => itemId !== req.params.itemId
  );

  if (remainingItems.length === cart.length) {
    return res.status(404).json({ message: "Cart item not found." });
  }

  req.session.cart = remainingItems;
  return res.status(200).json(remainingItems);
}

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
};