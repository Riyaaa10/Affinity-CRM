import React, { useEffect, useState } from "react";
import { db } from "../../firebase/firebaseconfig";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <h2>Products</h2>
      <div className="product-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card" onClick={() => navigate(`/product/${product.id}`)}>
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>Price: ${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
