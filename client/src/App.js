import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import { QRCodeCanvas } from "qrcode.react";

const API_URL = process.env.REACT_APP_API_URL;

const upiId = "7989876452@ybl"; 

function App() {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const upiLink = `upi://pay?pa=${upiId}&pn=TheTenaliStarbucks&am=${total}&cu=INR&tn=CoffeeOrder`;

  useEffect(() => {
    axios.get(`${API_URL}/items`)
      .then(res => setItems(res.data))
      .catch(err => console.log(err));
  }, []);

  const addToCart = (item) => {
    const existing = cart.find(c => c._id === item._id);
    if (existing) {
      setCart(cart.map(c =>
        c._id === item._id ? { ...c, qty: c.qty + 1 } : c
      ));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const increaseQty = (id) => {
    setCart(cart.map(item =>
      item._id === id ? { ...item, qty: item.qty + 1 } : item
    ));
  };

  const decreaseQty = (id) => {
    setCart(cart
      .map(item =>
        item._id === id ? { ...item, qty: item.qty - 1 } : item
      )
      .filter(item => item.qty > 0)
    );
  };

  const removeItem = (id) => {
    setCart(cart.filter(item => item._id !== id));
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const placeOrder = async () => {
    await axios.post(`${API_URL}/order`, { items: cart, total });
    setShowReceipt(true);
  };

  const images = {
    Espresso: "https://images.pexels.com/photos/30349793/pexels-photo-30349793.jpeg",
    Cappuccino: "https://images.pexels.com/photos/30428206/pexels-photo-30428206.jpeg",
    Latte: "https://images.pexels.com/photos/30512719/pexels-photo-30512719.jpeg",
    Americano: "https://images.pexels.com/photos/7241337/pexels-photo-7241337.jpeg",
    Mocha: "https://images.pexels.com/photos/12261098/pexels-photo-12261098.jpeg",
    "Flat White": "https://images.pexels.com/photos/32321168/pexels-photo-32321168.jpeg",
    "Cold Brew": "https://images.pexels.com/photos/13735966/pexels-photo-13735966.jpeg",
    Macchiato: "https://images.pexels.com/photos/30648975/pexels-photo-30648975.jpeg",
    "Iced Latte": "https://images.pexels.com/photos/4869293/pexels-photo-4869293.jpeg",
    "Caramel Latte": "https://images.pexels.com/photos/5305639/pexels-photo-5305639.jpeg",
    "Vanilla Latte": "https://images.pexels.com/photos/20184870/pexels-photo-20184870.jpeg",
    "Hazelnut Coffee": "https://images.pexels.com/photos/27251668/pexels-photo-27251668.jpeg",
    "Irish Coffee": "https://images.pexels.com/photos/10725922/pexels-photo-10725922.jpeg",
    "Affogato": "https://images.pexels.com/photos/32972513/pexels-photo-32972513.jpeg"
  };

  return (
    <div className="container">
      <h1>The Tenali Brewery</h1>

      <input
        type="text"
        placeholder="Search coffee..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search"
      />

      {/* MENU */}
      <div className="menu">
        {items
          .filter(item =>
            item.name.toLowerCase().includes(search.toLowerCase())
          )
          .map(item => (
            <div key={item._id} className="card">
              <img
                src={images[item.name]}
                alt={item.name}
                onError={(e) =>
                  (e.target.src =
                    "https://via.placeholder.com/300?text=Coffee")
                }
              />
              <h3>{item.name}</h3>
              <p>₹{item.price}</p>
              <p>Stock: {item.stock}</p>
              <button onClick={() => addToCart(item)}>Add</button>
            </div>
          ))}
      </div>

      {/* CART */}
      <div className="cart">
        <h2>Cart</h2>

        {cart.map(i => (
          <div key={i._id} className="cart-item">
            <p>{i.name}</p>

            <div className="controls">
              <button onClick={() => decreaseQty(i._id)}>-</button>
              <span>{i.qty}</span>
              <button onClick={() => increaseQty(i._id)}>+</button>
            </div>

            <button className="remove" onClick={() => removeItem(i._id)}>
              ❌
            </button>
          </div>
        ))}

        <h3>Total: ₹{total}</h3>
        {cart.length > 0 && (
          <>
            <QRCodeCanvas value={upiLink} size={180} />
            <button onClick={placeOrder}>Checkout</button>
          </>
        )}
      </div>

      {/* RECEIPT POPUP */}
      {showReceipt && (
  <div className="receipt">
    <h2>Receipt 🧾</h2>

    {cart.map(item => (
      <p key={item._id}>
        {item.name} x {item.qty} = ₹{item.price * item.qty}
      </p>
    ))}

    <h3>Total: ₹{total}</h3>

    {/* 🔥 QR CODE */}
    <QRCode value={upiLink} size={200} />

    <p>Scan & Pay</p>

    <button onClick={() => {
      setCart([]);
      setShowReceipt(false);
    }}>
      Close
    </button>
  </div>
)}
    </div>
  );
}

export default App;