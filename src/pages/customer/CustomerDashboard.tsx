import React, { useEffect, useState } from "react";
import { auth, db, logCustomerActivity, submitCustomerFeedback, requestAssistance, storeSearchHistory } from "../../firebase/firebaseconfig";
import { useNavigate } from "react-router-dom";
import { collection, query, where, orderBy, getDocs, addDoc, deleteDoc, Timestamp } from "firebase/firestore";
import ChatbotAssistant from './ChatbotAssistant';

const sampleProducts = [
  { id: "1", name: "Nike Air Max", price: 1850, img: "https://tse3.mm.bing.net/th?id=OIP.hHcBdmUpKEDC4k8-zJCjJgHaHa&pid=Api&P=0&h=180" },
  { id: "2", name: "Adidas Ultraboost", price: 2000, img: "https://tse3.mm.bing.net/th?id=OIP.DSm-o7xotW41oaDQKYtdSAHaFN&pid=Api&P=0&h=180" },
  { id: "3", name: "Puma", price: 1950, img: "https://tse1.mm.bing.net/th?id=OIP.FtrvgyT3X02ZHnxUg9HJiwHaHa&pid=Api&P=0&h=180" },
  { id: "4", name: "Asics", price: 1900, img: "https://tse4.mm.bing.net/th?id=OIP.7n6JTkapojKc1qWnSHCdiwHaE8&pid=Api&P=0&h=180" },
  { id: "5", name: "Crocs", price: 999, img: "https://tse3.mm.bing.net/th?id=OIP.-LPKDrhNO1nO06X8lM-4FAHaHa&pid=Api&P=0&h=180" },
  { id: "6", name: "Reebok", price: 1350, img: "https://c.shld.net/rpx/i/s/i/spin/0/prod_2281865712??hei=64&wid=64&qlt=50" },
  { id: "7", name: "Bata", price: 850, img: "https://tse4.mm.bing.net/th?id=OIP.R5dkLH9-OBzciG6IjTPangHaHa&pid=Api&P=0&h=180" },
  { id: "8", name: "Converse", price: 1750, img: "https://tse3.mm.bing.net/th?id=OIP.jllKvn8gO-QwcLCfSNaBsQHaHa&pid=Api&P=0&h=180" },
  { id: "9", name: "Liberty", price: 799, img: "https://tse1.mm.bing.net/th?id=OIP.5vP8CI6GXHwSgIHbPjd5HgHaHa&pid=Api&P=0&h=180" },
];

const CustomerDashboard: React.FC = () => {
  const [user, setUser] = useState(auth.currentUser);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [pastActions, setPastActions] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [assistance, setAssistance] = useState("");
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(sampleProducts);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // New state for discount popup
  const [discountPopup, setDiscountPopup] = useState({ show: false, product: null, discountPercent: 0 });
  const [wishlistWithTimestamps, setWishlistWithTimestamps] = useState([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) navigate("/customer-auth");
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      const fetchPastActions = async () => {
        const q = query(
          collection(db, "customer_activity"),
          where("userId", "==", user.uid),
          orderBy("timestamp", "desc")
        );
        const querySnapshot = await getDocs(q);
        setPastActions(querySnapshot.docs.map((doc) => doc.data()));
      };
      fetchPastActions();

      // Fetch wishlist data with timestamps
      const fetchWishlist = async () => {
        const q = query(
          collection(db, "wishlist"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const wishlistItems = querySnapshot.docs.map((doc) => ({
          ...doc.data().product,
          timestamp: doc.data().timestamp,
          docId: doc.id
        }));
        setWishlist(wishlistItems.map(item => ({ ...item })));
        setWishlistWithTimestamps(wishlistItems);
      };
      fetchWishlist();
    }
  }, [user]);

  // Check for items in wishlist that qualify for discounts
  useEffect(() => {
    if (wishlistWithTimestamps.length > 0) {
      checkWishlistForDiscounts();
    }
  }, [wishlistWithTimestamps]);

  // Function to check wishlist items for potential discounts
  const checkWishlistForDiscounts = () => {
    const now = new Date();
    
    wishlistWithTimestamps.forEach(item => {
      if (!item.timestamp) return;
      
      const itemTimestamp = item.timestamp.toDate ? item.timestamp.toDate() : new Date(item.timestamp);
      const minutesDifference = Math.floor((now.getTime() - itemTimestamp.getTime()) / (1000 * 60));
      
      let discountPercent = 0;
      
      // Determine discount based on time in wishlist (in minutes)
      if (minutesDifference >= 10) {
        discountPercent = 20; // 20% discount for items in wishlist for over 10 minutes
      } else if (minutesDifference >= 5) {
        discountPercent = 15; // 15% discount for items in wishlist for over 5 minutes
      } else if (minutesDifference >= 2) {
        discountPercent = 10; // 10% discount for items in wishlist for over 2 minutes
      }
      
      // Show discount popup if eligible
      if (discountPercent > 0 && !discountPopup.show) {
        setDiscountPopup({
          show: true,
          product: item,
          discountPercent: discountPercent
        });
      }
    });
  };

  // Function to close discount popup
  const closeDiscountPopup = () => {
    setDiscountPopup({ show: false, product: null, discountPercent: 0 });
  };

  // Function to add discounted item to cart
  const addDiscountedItemToCart = async () => {
    if (!discountPopup.product) return;
    
    const discountedProduct = {
      ...discountPopup.product,
      originalPrice: discountPopup.product.price,
      price: Math.round(discountPopup.product.price * (1 - discountPopup.discountPercent / 100)),
      discountApplied: true,
      discountPercent: discountPopup.discountPercent
    };
    
    setCart(prev => [...prev, discountedProduct]);
    await logCustomerActivity(user.uid, user.email || "", "Added Discounted Item to Cart", discountedProduct);
    closeDiscountPopup();
  };

  useEffect(() => {
    if (user && search) {
      storeSearchHistory(user.uid, user.email || "", search);
    }
  }, [search]);

  // Search functionality
  useEffect(() => {
    if (search.trim() === "") {
      setFilteredProducts(sampleProducts);
    } else {
      const filtered = sampleProducts.filter(product => 
        product.name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [search]);

  const addToCart = async (product) => {
    setIsAnimating(true);
    setCart((prev) => [...prev, product]);
    await logCustomerActivity(user.uid, user.email || "", "Added to Cart", product);
    setTimeout(() => setIsAnimating(false), 1000);
  };

  // Add to wishlist function
  const addToWishlist = async (product) => {
    // Check if product is already in wishlist
    if (wishlist.some(item => item.id === product.id)) {
      alert("Product already in wishlist!");
      return;
    }
    
    const timestamp = new Date();
    setWishlist((prev) => [...prev, product]);
    setWishlistWithTimestamps(prev => [...prev, { ...product, timestamp }]);
    
    await logCustomerActivity(user.uid, user.email || "", "Added to Wishlist", product);
    
    // Store in Firebase
    try {
      const wishlistRef = collection(db, "wishlist");
      await addDoc(wishlistRef, {
        userId: user.uid,
        product: product,
        timestamp: timestamp
      });
    } catch (error) {
      console.error("Error adding to wishlist:", error);
    }
  };

  // Remove from wishlist function
  const removeFromWishlist = async (productId) => {
    setWishlist(prev => prev.filter(item => item.id !== productId));
    setWishlistWithTimestamps(prev => prev.filter(item => item.id !== productId));
    
    await logCustomerActivity(user.uid, user.email || "", "Removed from Wishlist", { id: productId });
    
    // Remove from Firebase
    try {
      const q = query(
        collection(db, "wishlist"),
        where("userId", "==", user.uid),
        where("product.id", "==", productId)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  const checkout = async () => {
    for (const product of cart) {
      await logCustomerActivity(user.uid, user.email || "", "Checked Out", product);
    }
    alert("Checkout Complete!");
    setCart([]);
  };

  // Keyframe animations using CSS
  const animationStyles = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideInUp {
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    @keyframes float {
      0% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-10px) rotate(5deg); }
      100% { transform: translateY(0px) rotate(0deg); }
    }
    @keyframes cartBounce {
      0% { transform: scale(1); }
      40% { transform: scale(1.2); }
      60% { transform: scale(0.9); }
      80% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    @keyframes gradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes popIn {
      0% { transform: scale(0.8); opacity: 0; }
      70% { transform: scale(1.1); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `;

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      background: 'linear-gradient(-45deg, #f9e5e5, #e5f9f2, #e5e5f9, #f9f2e5)',
      backgroundSize: '400% 400%',
      animation: 'gradient 15s ease infinite',
      color: '#333',
      fontFamily: 'Arial, sans-serif',
      padding: '50px 20px',
      overflow: 'hidden'
    }}>
      <style>{animationStyles}</style>
      
      <h1 style={{ 
        textAlign: 'center', 
        color: '#8e44ad', 
        fontSize: '42px', 
        marginBottom: '40px', 
        textShadow: '2px 2px 8px rgba(142, 68, 173, 0.3)',
        animation: 'fadeIn 1s ease-out, float 4s ease-in-out infinite'
      }}>
        Welcome, {user?.displayName || 'Customer'}!
      </h1>
      
      {/* Enhanced Discount Popup with Animations */}
      {discountPopup.show && discountPopup.product && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.4s forwards'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            animation: 'popIn 0.5s cubic-bezier(0.26, 1.36, 0.66, 0.93)'
          }}>
            {/* Animated background elements */}
            <div style={{
              position: 'absolute',
              top: '-50px',
              left: '-50px',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(233,30,99,0.2) 0%, rgba(233,30,99,0) 70%)',
              animation: 'float 6s infinite ease-in-out'
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: '-30px',
              right: '-30px',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(33,150,243,0.2) 0%, rgba(33,150,243,0) 70%)',
              animation: 'float 5s infinite ease-in-out reverse'
            }}></div>
            
            <h3 style={{ 
              color: '#e91e63', 
              marginTop: '0',
              fontSize: '24px',
              position: 'relative',
              animation: 'slideInUp 0.4s 0.1s both'
            }}>
              Special Offer Just For You!
            </h3>
            
            <p style={{ 
              position: 'relative',
              animation: 'slideInUp 0.4s 0.2s both'
            }}>
              We noticed <strong>{discountPopup.product.name}</strong> has been in your wishlist for a while.
            </p>
            
            <div style={{ 
              margin: '20px 0', 
              position: 'relative',
              animation: 'slideInUp 0.4s 0.3s both'
            }}>
              <div style={{
                position: 'relative',
                display: 'inline-block',
                animation: 'float 3s infinite ease-in-out'
              }}>
                <img 
                  src={discountPopup.product.img} 
                  alt={discountPopup.product.name} 
                  style={{ 
                    width: '150px', 
                    height: '150px', 
                    objectFit: 'cover', 
                    borderRadius: '10px',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                  }} 
                />
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  right: '-15px',
                  backgroundColor: '#e91e63',
                  color: 'white',
                  borderRadius: '50%',
                  width: '70px',
                  height: '70px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  animation: 'pulse 1.5s infinite',
                  boxShadow: '0 5px 15px rgba(233,30,99,0.4)',
                  fontSize: '20px'
                }}>
                  {discountPopup.discountPercent}% OFF
                </div>
              </div>
            </div>
            
            <div style={{ 
              position: 'relative',
              animation: 'slideInUp 0.4s 0.4s both'
            }}>
              <p style={{ fontSize: '16px' }}>
                Original price: <span style={{ textDecoration: 'line-through', color: '#999' }}>₹{discountPopup.product.price}</span>
              </p>
              <p style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#e91e63',
                margin: '5px 0 20px'
              }}>
                Special price: ₹{Math.round(discountPopup.product.price * (1 - discountPopup.discountPercent / 100))}
              </p>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginTop: '25px',
              position: 'relative',
              animation: 'slideInUp 0.4s 0.5s both'
            }}>
              <button
                onClick={closeDiscountPopup}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#f5f5f5',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#e0e0e0';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#e0e0e0';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Maybe Later
              </button>
              <button
                onClick={addDiscountedItemToCart}
                style={{
                  padding: '12px 25px',
                  backgroundColor: '#e91e63',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 10px rgba(233,30,99,0.3)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#d81b60';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(233,30,99,0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#e91e63';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 10px rgba(233,30,99,0.3)';
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: '0', color: '#333' }}>Welcome, {user?.email?.split('@')[0] || 'Customer'}</h1>
        <button 
          onClick={() => auth.signOut()} 
          style={{ 
            padding: '10px 15px', 
            backgroundColor: '#f44336', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d32f2f'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f44336'}
        >
          Logout
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Search products..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'center', 
        gap: '25px', 
        width: '80%',
        maxWidth: '2300px',
        animation: 'slideInUp 0.8s ease-out'
      }}>
        {filteredProducts.map((product) => (
          <div 
            key={product.id} 
            style={{ 
              border: '1px solid #ddd', 
              borderRadius: '8px', 
              padding: '15px', 
              display: 'flex', 
              flexDirection: 'column',
              animation: 'slideInUp 0.5s ease-out',
              transition: 'transform 0.3s, box-shadow 0.3s',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
            }}
          >
            <img 
              src={product.img} 
              alt={product.name} 
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px', marginBottom: '10px' }} 
            />
            <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>{product.name}</h3>
            <p style={{ margin: '0 0 15px 0', fontWeight: 'bold', color: '#e91e63' }}>₹{product.price}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
              <button 
                onClick={() => addToCart(product)} 
                style={{ 
                  padding: '8px 12px', 
                  backgroundColor: '#4CAF50', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  animation: isAnimating ? 'cartBounce 0.5s' : 'none',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
              >
                Add to Cart
              </button>
              <button 
                onClick={() => addToWishlist(product)} 
                style={{ 
                  padding: '8px 12px', 
                  backgroundColor: '#ff9800', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e68a00'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ff9800'}
              >
                Wishlist
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ 
          flex: '1', 
          minWidth: '300px', 
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          padding: '20px',
          backgroundColor: '#fff',
          marginTop:'30px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ borderBottom: '2px solid #e91e63', paddingBottom: '10px', color: '#333' }}>Your Wishlist</h2>
          {wishlist.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>Your wishlist is empty.</p>
          ) : (
            <div>
              {wishlist.map((product) => (
                <div key={product.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '15px',
                  padding: '10px',
                  borderRadius: '4px',
                  backgroundColor: '#f9f9f9',
                  animation: 'fadeIn 0.5s'
                }}>
                  <img 
                    src={product.img} 
                    alt={product.name} 
                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', marginRight: '15px' }} 
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 5px 0' }}>{product.name}</h4>
                    <p style={{ margin: '0', fontWeight: 'bold', color: '#e91e63' }}>₹{product.price}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => addToCart(product)}
                      style={{ 
                        padding: '6px 10px', 
                        backgroundColor: '#4CAF50', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: 'pointer' 
                      }}
                    >
                      Add to Cart
                    </button>
                    <button 
                      onClick={() => removeFromWishlist(product.id)}
                      style={{ 
                        padding: '6px 10px', 
                        backgroundColor: '#f44336', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: 'pointer' 
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ 
          flex: '1', 
          minWidth: '300px', 
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          padding: '20px',
          backgroundColor: '#fff',
          marginTop:'30px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ borderBottom: '2px solid #2196F3', paddingBottom: '10px', color: '#333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Your Cart</span>
            <span style={{ 
              backgroundColor: '#2196F3', 
              color: 'white', 
              borderRadius: '50%', 
              width: '30px', 
              height: '30px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '14px',
              animation: isAnimating ? 'cartBounce 0.5s' : 'none'
            }}>
              {cart.length}
            </span>
          </h2>
          
          {cart.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>Your cart is empty.</p>
          ) : (
            <div>
              {cart.map((product, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '15px',
                  padding: '10px',
                  borderRadius: '4px',
                  backgroundColor: '#f9f9f9',
                  animation: 'fadeIn 0.5s'
                }}>
                  <img 
                    src={product.img} 
                    alt={product.name} 
                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', marginRight: '15px' }} 
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 5px 0' }}>{product.name}</h4>
                    <p style={{ margin: '0', fontWeight: 'bold', color: '#e91e63' }}>
                      {product.discountApplied ? (
                        <>
                          <span style={{ textDecoration: 'line-through', color: '#999', marginRight: '8px' }}>
                            ₹{product.originalPrice}
                          </span>
                          ₹{product.price} ({product.discountPercent}% off)
                        </>
                      ) : (
                        <>₹{product.price}</>
                      )}
                    </p>
                  </div>
                </div>
              ))}
              
              <div style={{ 
                marginTop: '20px', 
                padding: '15px', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '4px',
                animation: 'fadeIn 0.5s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span>Subtotal:</span>
                  <span>₹{cart.reduce((total, item) => total + item.price, 0)}</span>
                </div>
                <button 
                  onClick={checkout}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    backgroundColor: '#2196F3', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    transition: 'background-color 0.3s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0b7dda'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2196F3'}
                >
                  Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ 
        marginTop: '30px', 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '20px' 
      }}>
        <div style={{ 
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          padding: '20px',
          backgroundColor: '#fff',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ borderBottom: '2px solid #9c27b0', paddingBottom: '10px', color: '#333' }}>Feedback</h2>
          <textarea 
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your thoughts about our products or service..."
            style={{ 
              width: '90%', 
              padding: '12px', 
              borderRadius: '4px', 
              border: '1px solid #ddd', 
              minHeight: '100px',
              marginBottom: '15px',
              resize: 'vertical'
            }}
          />
          <button 
            onClick={async () => {
              if (feedback.trim()) {
                await submitCustomerFeedback(user.uid, user.email || "", feedback);
                setFeedback("");
                alert("Thank you for your feedback!");
              }
            }}
            style={{ 
              padding: '10px 15px', 
              backgroundColor: '#9c27b0', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#7B1FA2'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#9c27b0'}
          >
            Submit Feedback
          </button>
        </div>

        <div style={{ 
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          padding: '20px',
          backgroundColor: '#fff',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ borderBottom: '2px solid #ff5722', paddingBottom: '10px', color: '#333' }}>Need Assistance?</h2>
          <textarea 
            value={assistance}
            onChange={(e) => setAssistance(e.target.value)}
            placeholder="Describe what help you need..."
            style={{ 
              width: '90%', 
              padding: '12px', 
              borderRadius: '4px', 
              border: '1px solid #ddd', 
              minHeight: '100px',
              marginBottom: '15px',
              resize: 'vertical'
            }}
          />
          <button 
            onClick={async () => {
              if (assistance.trim()) {
                await requestAssistance(user.uid, user.email || "", assistance);
                setAssistance("");
                alert("Your request has been submitted. Our team will contact you soon!");
              }
            }}
            style={{ 
              padding: '10px 15px', 
              backgroundColor: '#ff5722', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#E64A19'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ff5722'}
          >
            Request Help
          </button>
        </div>
      </div>

      <div style={{ 
        marginTop: '30px', 
        border: '1px solid #ddd', 
        borderRadius: '8px', 
        padding: '20px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ borderBottom: '2px solid #3f51b5', paddingBottom: '10px', color: '#333' }}>Virtual Assistant</h2>
        <ChatbotAssistant userId={user?.uid} userEmail={user?.email || ""} />
      </div>

      <div style={{ 
        marginTop: '30px', 
        border: '1px solid #ddd', 
        borderRadius: '8px', 
        padding: '20px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ borderBottom: '2px solid #607d8b', paddingBottom: '10px', color: '#333' }}>Recent Activity</h2>
        {pastActions.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No recent activity.</p>
        ) : (
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {pastActions.map((action, index) => (
                              <div 
                              key={index} 
                              style={{ 
                                padding: '10px', 
                                borderBottom: index < pastActions.length - 1 ? '1px solid #eee' : 'none',
                                animation: 'fadeIn 0.5s'
                              }}
                            >
                              <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{action.action}</p>
                              <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                                {new Date(action.timestamp.seconds * 1000).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
              );
            };
            
            export default CustomerDashboard;