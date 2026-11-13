import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ProductDetailView = ({ addToCart }) => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await fetch(`/api/products/${id}`);

        if (!response.ok) {
          throw new Error("Product could not be loaded.");
        }

        const data = await response.json();
        setProduct(data);
        setError("");
      } catch (fetchError) {
        setError(fetchError.message);
      }
    };

    loadProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      setError("Please select a size and color.");
      return;
    }

    addToCart({
      id: product.id,
      productId: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      size: selectedSize,
      color: selectedColor,
      quantity: Math.max(1, Number(quantity) || 1),
    });

    setError("");
  };

  if (error && !product) {
    return <p>{error}</p>;
  }

  if (!product) {
    return <p>Loading product...</p>;
  }

  return (
    <div>
      <h1>{product.name}</h1>

      <img
        src={product.image}
        alt={product.name}
        style={{ width: "200px" }}
      />

      <p>Price: ${Number(product.price).toFixed(2)}</p>

      <div className="mb-3">
        <label htmlFor="product-size">Size:</label>
        <select
          id="product-size"
          className="form-select"
          value={selectedSize}
          onChange={(event) => setSelectedSize(event.target.value)}
        >
          <option value="">Select size</option>
          {product.sizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label htmlFor="product-color">Color:</label>
        <select
          id="product-color"
          className="form-select"
          value={selectedColor}
          onChange={(event) => setSelectedColor(event.target.value)}
        >
          <option value="">Select color</option>
          {product.colors.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label htmlFor="product-quantity">Quantity:</label>
        <input
          id="product-quantity"
          className="form-control"
          type="number"
          min="1"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
        />
      </div>

      {error && <p className="text-danger">{error}</p>}

      <button className="btn btn-primary" onClick={handleAddToCart}>
        Add to Cart
      </button>
    </div>
  );
};

export default ProductDetailView;