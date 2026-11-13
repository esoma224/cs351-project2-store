import { useState } from "react";
import { useNavigate } from "react-router-dom";

const emptyAddress = {
  street: "",
  city: "",
  state: "",
  zip: "",
};

export default function CheckoutView({ onOrderPlaced }) {
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({ ...emptyAddress });
  const [billingAddress, setBillingAddress] = useState({ ...emptyAddress });
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [cardType, setCardType] = useState("");
  const [lastFourDigits, setLastFourDigits] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateAddress(setAddress, field, value) {
    setAddress((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const billing = sameAsShipping ? shippingAddress : billingAddress;

    if (
      !shippingAddress.street.trim() ||
      !shippingAddress.city.trim() ||
      !shippingAddress.state.trim() ||
      !shippingAddress.zip.trim() ||
      !billing.street.trim() ||
      !billing.city.trim() ||
      !billing.state.trim() ||
      !billing.zip.trim()
    ) {
      setError("Complete all shipping and billing address fields.");
      return;
    }

    if (!cardType.trim() || !/^\d{4}$/.test(lastFourDigits)) {
      setError("Enter a card type and exactly four card digits.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          shippingAddress,
          billingAddress: billing,
          cardType: cardType.trim(),
          lastFourDigits,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not place your order.");
      }

      onOrderPlaced?.();
      navigate("/order-confirmation", { state: { order: data.order } });
    } catch (err) {
      setError(err.message || "Could not place your order.");
    } finally {
      setSubmitting(false);
    }
  }

  function renderAddressFields(title, address, setAddress) {
    return (
      <fieldset>
        <legend>{title}</legend>

        {["street", "city", "state", "zip"].map((field) => (
          <label key={`${title}-${field}`}>
            {field === "zip"
              ? "ZIP code"
              : field.charAt(0).toUpperCase() + field.slice(1)}
            <input
              type="text"
              name={`${title}-${field}`}
              autoComplete="off"
              value={address[field]}
              onChange={(event) =>
                updateAddress(setAddress, field, event.target.value)
              }
              required
            />
          </label>
        ))}
      </fieldset>
    );
  }

  return (
    <main>
      <h1>Checkout</h1>

      <form onSubmit={handleSubmit}>
        {renderAddressFields(
          "Shipping address",
          shippingAddress,
          setShippingAddress
        )}

        <label>
          <input
            type="checkbox"
            checked={sameAsShipping}
            onChange={(event) => setSameAsShipping(event.target.checked)}
          />
          Billing address is the same as shipping
        </label>

        {!sameAsShipping &&
          renderAddressFields(
            "Billing address",
            billingAddress,
            setBillingAddress
          )}

        <fieldset>
          <legend>Payment summary</legend>

          <label>
            Card type
            <select
              value={cardType}
              onChange={(event) => setCardType(event.target.value)}
              required
            >
              <option value="">Select a card type</option>
              <option value="Visa">Visa</option>
              <option value="Mastercard">Mastercard</option>
              <option value="American Express">American Express</option>
              <option value="Discover">Discover</option>
            </select>
          </label>

          <label>
            Last four digits
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              pattern="\d{4}"
              value={lastFourDigits}
              onChange={(event) =>
                setLastFourDigits(
                  event.target.value.replace(/\D/g, "").slice(0, 4)
                )
              }
              required
            />
          </label>

          <p>
            Do not enter a full card number or CVV. This form submits only the
            card type and last four digits.
          </p>
        </fieldset>

        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Placing order…" : "Place order"}
        </button>
      </form>
    </main>
  );
}