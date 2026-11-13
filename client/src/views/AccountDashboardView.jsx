import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";


const AccountDashboardView = ({ user, onLogout }) => {
  const [account, setAccount] = useState(user || null);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadAccount = async () => {
      try {
        const response = await fetch("/api/account", {
          credentials: "include",
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Could not load account.");
        }

        const loadedAccount = result.account || result;
        const savedAddress = loadedAccount.shippingAddress || {};

        setAccount(loadedAccount);
        setPhone(loadedAccount.phone || "");
        setAddress({
          street: savedAddress.street || "",
          city: savedAddress.city || "",
          state: savedAddress.state || "",
          zip: savedAddress.zip || "",
        });
      } catch (err) {
        setError(err.message || "Could not load account.");
      } finally {
        setLoading(false);
      }
    };

    loadAccount();
  }, []);

  const handleAddressChange = (event) => {
    const { name, value } = event.target;
    setAddress((previousAddress) => ({
      ...previousAddress,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const response = await fetch("/api/account", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          phone,
          shippingAddress: address,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not update account.");
      }

      setAccount(result.account || result);
      setMessage(result.message || "Account updated.");
    } catch (err) {
      setError(err.message || "Could not update account.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading account...</p>;
  }

  return (
    <section className="container mt-4">
      <h1>Welcome, {account?.login || user?.login || "Guest"}!</h1>
      <p>Email: {account?.email || user?.email || "Not added yet"}</p>

      {error && <p className="text-danger">{error}</p>}
      {message && <p className="text-success">{message}</p>}

      <form onSubmit={handleSubmit}>
        <h2>Edit phone and shipping address</h2>

        <div className="mb-3">
          <label className="form-label" htmlFor="phone">
            Phone
          </label>
          <input
            className="form-control"
            id="phone"
            name="phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="street">
            Street address
          </label>
          <input
            className="form-control"
            id="street"
            name="street"
            value={address.street}
            onChange={handleAddressChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="city">
            City
          </label>
          <input
            className="form-control"
            id="city"
            name="city"
            value={address.city}
            onChange={handleAddressChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="state">
            State
          </label>
          <input
            className="form-control"
            id="state"
            name="state"
            value={address.state}
            onChange={handleAddressChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="zip">
            ZIP code
          </label>
          <input
            className="form-control"
            id="zip"
            name="zip"
            value={address.zip}
            onChange={handleAddressChange}
            required
          />
        </div>

        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>

        <div className="mt-3">
            <Link to="/orders" className="btn btn-primary me-2">
            View Orders
            </Link>

      <button
        type="button"
        className="btn btn-secondary mt-3"
        onClick={onLogout}
      >
        Log Out
      </button>
      </div>
    </section>
  );
};

export default AccountDashboardView;