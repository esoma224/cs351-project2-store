import { Link, useLocation } from "react-router-dom";

export default function OrderConfirmationView() {
  const { state } = useLocation();
  const order = state?.order;

  if (!order) {
    return (
      <main className="container my-4">
        <h1>Order confirmation</h1>
        <p>
          Order details aren’t available on this page. You can view your orders
          from your account.
        </p>
        <Link to="/account" className="btn btn-primary">
          Go to Account
        </Link>
      </main>
    );
  }

  const formatAddress = (address) =>
    [address?.street, address?.city, address?.state, address?.zip]
      .filter(Boolean)
      .join(", ");

  const formatMoney = (amount) =>
    Number(amount ?? 0).toFixed(2);

  return (
    <main className="container my-4">
      <h1>Thank you for your order!</h1>

      <p>Order ID: {String(order._id)}</p>
      <p>
        Ordered by: {order.customer?.login} ({order.customer?.email})
      </p>
      <p>Shipping to: {formatAddress(order.shippingAddress)}</p>
      <p>Billing address: {formatAddress(order.billingAddress)}</p>
      <p>
        Payment: {order.payment?.cardType} ending in{" "}
        {order.payment?.lastFourDigits}
      </p>

      <h2>Items</h2>
      {order.items?.map((item, index) => (
        <div key={`${item.productId}-${index}`}>
          <p>
            {item.name} — Size: {item.size}, Color: {item.color}, Quantity:{" "}
            {item.quantity}
          </p>
          <p>Line total: ${formatMoney(item.lineTotal)}</p>
        </div>
      ))}

      <h2>Order total</h2>
      <p>Subtotal: ${formatMoney(order.totals?.subtotal)}</p>
      <p>Tax: ${formatMoney(order.totals?.tax)}</p>
      <p>Shipping: ${formatMoney(order.totals?.shipping)}</p>
      <p>
        <strong>Final total: ${formatMoney(order.totals?.total)}</strong>
      </p>

      <Link to="/shop" className="btn btn-primary">
        Continue shopping
      </Link>
    </main>
  );
}