"use client";

import Link from "next/link";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import { useSearchParams } from "next/navigation";

export default function CheckoutReturnPage() {

  const params = useSearchParams();
  const sessionId = params.get("session_id");

  return (
    <>
      <Header />

      <main className="checkout-success">

        <div className="success-card">

          <div className="success-icon">
            ✓
          </div>

          <h1>Payment Successful</h1>

          <p>
            Thank you for your purchase. Your order has been received and is now
            being processed.
          </p>

          {sessionId && (
            <p className="session-id">
              Order Reference: <strong>{sessionId.slice(-10)}</strong>
            </p>
          )}

          <div className="success-actions">

            <Link href="/">
              <button className="continue-btn">
                Continue Shopping
              </button>
            </Link>

            <Link href="/account/orders">
              <button className="orders-btn">
                View My Orders
              </button>
            </Link>

          </div>

        </div>

      </main>

      <Footer />

      <style jsx>{`

        .checkout-success{
          min-height:70vh;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:60px 20px;
          background:#f8f8f8;
        }

        .success-card{
          background:#fff;
          max-width:520px;
          width:100%;
          padding:40px;
          border-radius:12px;
          text-align:center;
          box-shadow:0 10px 40px rgba(0,0,0,0.08);
        }

        .success-icon{
          width:70px;
          height:70px;
          margin:0 auto 20px;
          border-radius:50%;
          background:#22c55e;
          color:#fff;
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:32px;
          font-weight:bold;
        }

        h1{
          font-size:28px;
          margin-bottom:12px;
        }

        p{
          color:#666;
          margin-bottom:16px;
          line-height:1.5;
        }

        .session-id{
          font-size:14px;
          color:#999;
        }

        .success-actions{
          margin-top:28px;
          display:flex;
          gap:14px;
          justify-content:center;
          flex-wrap:wrap;
        }

        button{
          padding:12px 20px;
          border-radius:8px;
          border:none;
          font-weight:600;
          cursor:pointer;
        }

        .continue-btn{
          background:#111;
          color:white;
        }

        .orders-btn{
          background:#22c55e;
          color:white;
        }

        button:hover{
          opacity:0.9;
        }

      `}</style>

    </>
  );
}