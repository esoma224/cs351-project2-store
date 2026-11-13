import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function OrdersView() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await fetch("/api/orders", {
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load orders.");
        }

        setOrders(data.orders || []);
      } catch (err) {
        setError(err.message || "Could not load orders.");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  if (loading) {
    return <p>Loading orders...</p>;
  }

  return (
    <main className="container my-4">
      <h1>Your Orders</h1>

      {error && <p className="text-danger">{error}</p>}

      {!error && orders.length === 0 && (
        <p>You haven’t placed any orders yet.</p>
      )}

      {orders.map((order) => (
        <section className="card mb-3" key={order._id}>
          <div className="card-body">
            <h2 className="h5">Order {String(order._id)}</h2>

            <p>
              Date:{" "}
              {order.createdAt
                ? new Date(order.createdAt).toLocaleDateString()
                : "Not available"}
            </p>

            <p>Items: {order.items?.length || 0}</p>

            <p>
              Total: ${Number(order.totals?.total || 0).toFixed(2)}
            </p>

            <Link
              to={`/orders/${order._id}`}
              className="btn btn-primary"
            >
              View Details
            </Link>
          </div>
        </section>
      ))}

      <Link to="/account" className="btn btn-secondary">
        Back to Account
      </Link>
    </main>
  );
}