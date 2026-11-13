import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function formatCurrency(value) {
  return Number(value || 0).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
}

function AddressDetails({ title, address }) {
  if (!address) {
    return (
      <section className="mb-3">
        <h3 className="h6">{title}</h3>
        <p>Address not available.</p>
      </section>
    );
  }

  return (
    <section className="mb-3">
      <h3 className="h6">{title}</h3>
      <address>
        {address.street}
        <br />
        {address.city}, {address.state} {address.zip}
      </address>
    </section>
  );
}

export default function OrderDetailView() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/orders/${encodeURIComponent(id)}`,
          { credentials: "include" }
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load order.");
        }

        setOrder(data.order);
      } catch (err) {
        setError(err.message || "Could not load order.");
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [id]);

  if (loading) {
    return <p className="container my-4">Loading order...</p>;
  }

  return (
    <main className="container my-4">
      <h1>Order Details</h1>

      {error && <p className="text-danger">{error}</p>}

      {!error && order && (
        <>
          <section className="card my-3">
            <div className="card-body">
              <h2 className="h5">Order {String(order._id)}</h2>
              <p>
                Date:{" "}
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleString()
                  : "Not available"}
              </p>
              <p>
                Customer: {order.customer?.login} ({order.customer?.email})
              </p>
            </div>
          </section>

          <section className="card my-3">
            <div className="card-body">
              <h2 className="h5">Items</h2>

              {order.items?.length ? (
                <ul className="list-group list-group-flush">
                  {order.items.map((item, index) => (
                    <li
                      className="list-group-item"
                      key={`${item.productId}-${index}`}
                    >
                      <strong>{item.name || "Item"}</strong>
                      <div>Size: {item.size}</div>
                      <div>Color: {item.color}</div>
                      <div>Quantity: {item.quantity}</div>
                      <div>Unit price: {formatCurrency(item.unitPrice)}</div>
                      <div>Line total: {formatCurrency(item.lineTotal)}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No items listed.</p>
              )}
            </div>
          </section>

          <section className="card my-3">
            <div className="card-body">
              <h2 className="h5">Addresses</h2>
              <AddressDetails
                title="Shipping Address"
                address={order.shippingAddress}
              />
              <AddressDetails
                title="Billing Address"
                address={order.billingAddress}
              />
            </div>
          </section>

          <section className="card my-3">
            <div className="card-body">
              <h2 className="h5">Payment Summary</h2>
              <p>Card type: {order.payment?.cardType}</p>
              <p>Card ending in: {order.payment?.lastFourDigits}</p>
            </div>
          </section>

          <section className="card my-3">
            <div className="card-body">
              <h2 className="h5">Totals</h2>
              <p>Subtotal: {formatCurrency(order.totals?.subtotal)}</p>
              <p>Shipping: {formatCurrency(order.totals?.shipping)}</p>
              <p>Tax: {formatCurrency(order.totals?.tax)}</p>
              <hr />
              <p>
                <strong>
                  Final total: {formatCurrency(order.totals?.total)}
                </strong>
              </p>
            </div>
          </section>
        </>
      )}

      <Link to="/orders" className="btn btn-secondary">
        Back to Orders
      </Link>
    </main>
  );
}