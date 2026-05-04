import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/items').then(res => setItems(res.data));
  }, []);

  const addToCart = (item) => {
    const existing = cart.find(c => c._id === item._id);
    if (existing) {
      existing.qty++;
      setCart([...cart]);
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const placeOrder = async () => {
    await axios.post('http://localhost:5000/order', { items: cart, total });
    alert('Order placed!');
    setCart([]);
  };

  return (
    <div className="container">
      <h1>Coffee Shop</h1>

      <div className="menu">
        {items.map(item => (
          <div key={item._id} className="card">
            <h3>{item.name}</h3>
            <p>₹{item.price}</p>
            <p>Stock: {item.stock}</p>
            <button onClick={() => addToCart(item)}>Add</button>
          </div>
        ))}
      </div>

      <div className="cart">
        <h2>Cart</h2>
        {cart.map(i => (
          <p key={i._id}>{i.name} x {i.qty}</p>
        ))}
        <h3>Total: ₹{total}</h3>
        <button onClick={placeOrder}>Checkout</button>
      </div>
    </div>
  );
}

export default App;
