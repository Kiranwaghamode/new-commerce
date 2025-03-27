"use client";
import { useState } from "react";

const CheckoutButton = () => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            { name: "T-shirt", price: 25, quantity: 1, image: "/shirt.jpg" },
            { name: "Mug", price: 15, quantity: 2, image: "/mug.jpg" }
          ],
        }),
      });

      const { id } = await response.json();

      if (!id) {
        alert("Failed to create checkout session");
        setLoading(false);
        return;
      }

      window.location.href = `https://checkout.stripe.com/pay/${id}`;
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="bg-blue-500 text-white p-2 rounded"
    >
      {loading ? "Processing..." : "Checkout"}
    </button>
  );
};

export default CheckoutButton;
