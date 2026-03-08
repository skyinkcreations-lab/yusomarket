"use client";

import Image from "next/image";
import { FiStar } from "react-icons/fi";

export interface Product {
  id: string;
  title: string;
  price: number;
  oldPrice?: number;
  vendor?: string;
  rating?: number;
  ratingCount?: number;
  badge?: string;
  image?: string;
}

export default function ProductCard({
  product,
  onAddToCart,
}: {
  product: Product;
  onAddToCart: (product: Product) => void;
}) {
  return (
    <div className="product-card">

      {/* Badge */}
      {product.badge && (
        <div className="product-card-badge">
          {product.badge}
        </div>
      )}

      {/* Image */}
      <div className="product-card-image-wrapper">
        <Image
          src={product.image || "/placeholder-product.png"}
          alt={product.title}
          width={300}
          height={300}
          className="product-card-image"
        />
      </div>

      {/* Title */}
      <h3 className="product-card-title">{product.title}</h3>

      {/* Rating */}
      {product.rating && (
        <div className="product-card-rating">
          <FiStar className="product-card-rating-star" />
          <span>{product.rating}</span>
          <span className="product-card-rating-count">
            ({product.ratingCount})
          </span>
        </div>
      )}

      {/* Prices */}
      <div className="product-card-price-row">
        <span className="product-card-price">
          A${product.price.toFixed(2)}
        </span>
        {product.oldPrice && (
          <span className="product-card-old-price">
            A${product.oldPrice.toFixed(2)}
          </span>
        )}
      </div>

      {/* Add Button */}
      <button
        className="product-card-btn"
        onClick={() => onAddToCart(product)}
      >
        Add to cart
      </button>
    </div>
  );
}
