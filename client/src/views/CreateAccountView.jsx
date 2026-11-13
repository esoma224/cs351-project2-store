import React, { useState } from "react";
import { Link } from "react-router-dom";

const CreateAccountView = ({ onCreateAccount }) => {
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (password === confirmPassword) {
      onCreateAccount(login, email, password);
    } else {
      alert("Passwords do not match.");
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center">Create Account</h1>

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mb-3">
          <label htmlFor="login" className="form-label">Login:</label>
          <input
            type="text"
            id="login"
            className="form-control"
            value={login}
            onChange={(event) => setLogin(event.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email:</label>
          <input
            type="email"
            id="email"
            className="form-control"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password:</label>
          <input
            type="password"
            id="password"
            className="form-control"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm Password:
          </label>
          <input
            type="password"
            id="confirmPassword"
            className="form-control"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Create Account
        </button>
      </form>

      <div className="mt-3 text-center">
        <p>
          Already have an account? <Link to="/account">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default CreateAccountView;