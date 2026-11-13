import React from 'react';
import { Link } from 'react-router-dom';


const HomeView = () => {
    return (
        <div className="home-container">
            <div className="hero-section">
                <h1>Welcome to Our Store!</h1>
                <p>Discover amazing products and enjoy a seamless shopping experience.</p>
                <Link to="/shop" className="shop-button">Shop Now</Link>
            </div>
            <div className="links-section">
                <h2>Quick Links</h2>
                <div className="link-cards">
                    <Link to="/cart" className="link-card">
                        <h3>Your Cart</h3>
                        <p>View items in your cart</p>
                    </Link>
                    <Link to="/account" className="link-card">
                        <h3>Login</h3>
                        <p>Access your account</p>
                    </Link>
                    <Link to="/create-account" className="link-card">
                        <h3>Create Account</h3>
                        <p>Join us for exclusive offers</p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HomeView;