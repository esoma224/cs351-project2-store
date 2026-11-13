const { ObjectId } = require("mongodb");

const isValidAddress = (address) =>
  address &&
  ["street", "city", "state", "zip"].every(
    (field) =>
      typeof address[field] === "string" &&
      address[field].trim().length > 0
  );

async function createOrder(req, res) {
  const db = req.app.locals.db;

  try {
    const userId = req.session?.userId;

    if (!ObjectId.isValid(userId)) {
      return res.status(401).json({ message: "Please log in first." });
    }

    const cart = req.session.cart;

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    const {
      shippingAddress,
      billingAddress,
      cardType,
      lastFourDigits,
    } = req.body || {};

    if (!isValidAddress(shippingAddress) || !isValidAddress(billingAddress)) {
      return res.status(400).json({
        message:
          "Enter the street, city, state, and ZIP code for both addresses.",
      });
    }

    if (typeof cardType !== "string" || !cardType.trim()) {
      return res.status(400).json({ message: "Card type is required." });
    }

    const safeLastFour = String(lastFourDigits || "").trim();

    if (!/^\d{4}$/.test(safeLastFour)) {
      return res.status(400).json({
        message: "Last four digits must contain exactly four numbers.",
      });
    }

    const user = await db.collection("users").findOne(
      { _id: new ObjectId(userId) },
      { projection: { passwordHash: 0 } }
    );

    if (!user) {
      return res.status(404).json({ message: "Account not found." });
    }

    
    const checkedCart = [];

    for (const item of cart) {
      const productId = String(item.productId || "");
      const quantity = Number(item.quantity);

      if (
        !ObjectId.isValid(productId) ||
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          message: "Your cart contains an invalid item.",
        });
      }

      checkedCart.push({
        productId: new ObjectId(productId),
        quantity,
        size: item.size,
        color: item.color,
      });
    }

    const productIds = checkedCart.map((item) => item.productId);
    const products = await db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray();

    const productsById = new Map(
      products.map((product) => [product._id.toString(), product])
    );

    const items = [];

    for (const cartItem of checkedCart) {
      const product = productsById.get(cartItem.productId.toString());

      if (!product || !Number.isFinite(product.price) || product.price < 0) {
        return res.status(400).json({
          message: "A product in your cart is unavailable or has an invalid price.",
        });
      }

      if (
        (Array.isArray(product.sizes) &&
          !product.sizes.includes(cartItem.size)) ||
        (Array.isArray(product.colors) &&
          !product.colors.includes(cartItem.color))
      ) {
        return res.status(400).json({
          message: "A selected size or color is no longer available.",
        });
      }

      const unitPriceCents = Math.round(product.price * 100);
      const lineTotalCents = unitPriceCents * cartItem.quantity;

      items.push({
        productId: product._id,
        name: product.name,
        image: product.image,
        size: cartItem.size,
        color: cartItem.color,
        quantity: cartItem.quantity,
        unitPrice: unitPriceCents / 100,
        lineTotal: lineTotalCents / 100,
      });
    }

    
    const taxRate = 0.0375;
    const shippingCents = 799;

    const subtotalCents = items.reduce(
      (sum, item) => sum + Math.round(item.lineTotal * 100),
      0
    );
    const taxCents = Math.round(subtotalCents * taxRate);
    const totalCents = subtotalCents + taxCents + shippingCents;

    const order = {
      userId: new ObjectId(userId),
      createdAt: new Date(),
      customer: {
        login: user.login,
        email: user.email,
      },
      shippingAddress: {
        street: shippingAddress.street.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        zip: shippingAddress.zip.trim(),
      },
      billingAddress: {
        street: billingAddress.street.trim(),
        city: billingAddress.city.trim(),
        state: billingAddress.state.trim(),
        zip: billingAddress.zip.trim(),
      },
      payment: {
        cardType: cardType.trim(),
        lastFourDigits: safeLastFour,
      },
      items,
      totals: {
        subtotal: subtotalCents / 100,
        tax: taxCents / 100,
        shipping: shippingCents / 100,
        total: totalCents / 100,
      },
    };

    const insertResult = await db.collection("orders").insertOne(order);

    
    req.session.cart = [];

    return req.session.save((sessionError) => {
      if (sessionError) {
        console.error("Session save failed after order creation:", sessionError.message);
        return res.status(500).json({
          message: "Order was created, but the cart could not be cleared.",
        });
      }

      return res.status(201).json({
        message: "Order created.",
        order: {
          _id: insertResult.insertedId,
          ...order,
        },
      });
    });
  } catch (error) {
    console.error("Order creation failed:", error.message);
    return res.status(500).json({ message: "Could not create order." });
  }
}

async function getOrders(req, res) {
  try {
    if (!ObjectId.isValid(req.session?.userId)) {
      return res.status(401).json({ message: "Please log in first." });
    }

    const orders = await req.app.locals.db
      .collection("orders")
      .find({ userId: new ObjectId(req.session.userId) })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({ orders });
  } catch (error) {
    console.error("Order retrieval failed:", error.message);
    return res.status(500).json({ message: "Could not load orders." });
  }
}
async function getOrderById(req, res) {
  try {
    if (!ObjectId.isValid(req.session?.userId)) {
      return res.status(401).json({ message: "Please log in first." });
    }

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID." });
    }

    const order = await req.app.locals.db.collection("orders").findOne({
      _id: new ObjectId(req.params.id),
      userId: new ObjectId(req.session.userId),
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    return res.status(200).json({ order });
  } catch (error) {
    console.error("Order retrieval failed:", error.message);
    return res.status(500).json({ message: "Could not load order." });
  }
}

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
};