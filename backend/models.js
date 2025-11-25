// MongoDB models for User
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    token: String,
    createdAt: { type: Date, default: Date.now }
});

const cartItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: String,
    category: String,
    quantity: { type: Number, default: 1 }
});

const cartSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true },
    items: [cartItemSchema],
    updatedAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    image: String,
    category: String,
    badge: String,
    affiliates: {
        amazon: String,
        flipkart: String
    },
    createdAt: { type: Date, default: Date.now }
});

// Create models
const User = mongoose.model('User', userSchema);
const Cart = mongoose.model('Cart', cartSchema);
const Product = mongoose.model('Product', productSchema);

module.exports = { User, Cart, Product };