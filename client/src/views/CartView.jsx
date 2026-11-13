import React from "react";
import { Link } from "react-router-dom";
import Cart from "../components/Cart";

const CartView = ({ cartItems, removeFromCart, updateQuantity }) => {
  return (
    <div>
      <h1>Your Shopping Cart</h1>

      <Cart
        items={cartItems}
        onRemoveItem={removeFromCart}
        onQuantityChange={updateQuantity}
      />

      {cartItems.length > 0 && (
        <Link to="/checkout" className="btn btn-primary mt-3">
          Proceed to Checkout
        </Link>
      )}
    </div>
  );
};

export default CartView;