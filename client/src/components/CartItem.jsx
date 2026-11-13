import React from "react";

function CartItem({ item, removeFromCart, updateQuantity }) {
  const handleQuantityChange = (event) => {
    const quantity = Number(event.target.value);

    if (Number.isInteger(quantity) && quantity >= 1) {
      updateQuantity(item.itemId, quantity);
    }
  };

  const lineTotal = Number(item.unitPrice) * item.quantity;

  return (
    <div className="cart-item">
      <img
        src={item.image}
        alt={item.name}
        style={{ width: "100px", height: "auto" }}
      />

      <h4>{item.name}</h4>
      <p>Price: ${Number(item.unitPrice).toFixed(2)}</p>
      <p>Size: {item.size}</p>
      <p>Color: {item.color}</p>

      <div className="quantity-controls">
        <button
          type="button"
          onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
        >
          +
        </button>

        <input
          type="number"
          value={item.quantity}
          onChange={handleQuantityChange}
          min="1"
        />

        <button
          type="button"
          onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
          disabled={item.quantity <= 1}
        >
          -
        </button>

        <button
          type="button"
          onClick={() => removeFromCart(item.itemId)}
        >
          Remove
        </button>
      </div>

      <p>Line total: ${lineTotal.toFixed(2)}</p>
    </div>
  );
}

export default CartItem;