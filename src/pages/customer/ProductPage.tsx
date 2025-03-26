import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db, auth } from "../../firebase/firebaseconfig";
import { doc, getDoc } from "firebase/firestore";
import { updateLeadScore } from "../../utils/updateCustomerData";

const ProductPage: React.FC = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const docRef = doc(db, "products", id!);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProduct(docSnap.data());
      }
    };
    fetchProduct();

    // Update lead score when product is viewed
    const user = auth.currentUser;
    if (user) {
      updateLeadScore(user.uid, `Viewed product: ${id}`, 5);
    }
  }, [id]);

  if (!product) return <p>Loading product...</p>;

  return (
    <div>
      <h2>{product.name}</h2>
      <img src={product.image} alt={product.name} />
      <p>{product.description}</p>
      <p>Price: ${product.price}</p>
    </div>
  );
};

export default ProductPage;
