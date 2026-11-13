import React from "react";
import CartItem from "./CartItem";

function ShoppingCart({ items, onRemoveItem, onQuantityChange }) {
  const subtotal = items.reduce((amount, item) => {
    return amount + item.unitPrice * item.quantity;
  }, 0);

  const itemCount = items.reduce((count, item) => {
    return count + item.quantity;
  }, 0);

  return (
    <section>
      <h2>Shopping Cart</h2>
      <p>Subtotal: ${subtotal.toFixed(2)}</p>
      <p>Number of items: {itemCount}</p>

      {items.length === 0 ? (
        <p>Your shopping cart is empty.</p>
      ) : (
        <div>
          {items.map((item) => (
            <CartItem
              key={item.itemId}
              item={item}
              removeFromCart={onRemoveItem}
              updateQuantity={onQuantityChange}
            />
          ))}

          <h3>Cart total: ${subtotal.toFixed(2)}</h3>
        </div>
      )}
    </section>
  );
}

export default ShoppingCart;