"use client";

import Link from "next/link";
import {
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiYoutube,
} from "react-icons/fi";

export default function Footer() {
  return (
    <>
      <footer className="ym-footer">
        <div className="ym-footer-inner">

          {/* ================= TOP GRID ================= */}
          <div className="ym-footer-grid">

            {/* BRAND */}
            <div className="ym-footer-brand">
              <h2>YusoMarket</h2>
              <p>
                Discover products from trusted independent vendors across Australia.
                Fast shipping. Real stock. Buyer protection.
              </p>
            </div>

            {/* SHOP */}
            <div>
              <h3>Shop</h3>
              {[
                "Electronics",
                "Fashion",
                "Home & Living",
                "Beauty",
                "Sports",
                "Toys",
                "Pets",
                "Automotive",
              ].map((cat) => (
                <Link
                  key={cat}
                  href={`/category/${cat.toLowerCase().replace(/ & /g, "-")}`}
                >
                  {cat}
                </Link>
              ))}
            </div>

            {/* SUPPORT */}
            <div>
              <h3>Support</h3>
              <Link href="/returns">Returns & Refunds</Link>
              <Link href="/faq">FAQ</Link>
              <Link href="/contact">Contact Us</Link>
            </div>

            {/* SELL */}
            <div>
              <h3>Sell on YusoMarket</h3>
              <Link href="/sell">Become a Vendor</Link>
              <Link href="/vendor-login">Vendor Login</Link>
            </div>

            {/* LEGAL */}
            <div>
              <h3>Legal</h3>
              <Link href="/terms">Terms & Conditions</Link>
              <Link href="/privacy">Privacy Policy</Link>
            </div>

          </div>

          {/* ================= PAYMENTS ================= */}
          <div className="ym-footer-payments">
            <span>Secure Payments</span>

            <div className="ym-payment-icons">
              <img src="/payments/visa.png" alt="Visa" />
              <img src="/payments/MasterCard_Logo.svg.webp" alt="Mastercard" />
              <img src="/payments/Apple_Pay_logo.svg.png" alt="Apple Pay" />
            </div>
          </div>

          {/* ================= BOTTOM ================= */}
          <div className="ym-footer-bottom">

            <div className="ym-footer-socials">
              <FiFacebook />
              <FiInstagram />
              <FiTwitter />
              <FiYoutube />
            </div>

            <p>
              © {new Date().getFullYear()} YusoMarket. All rights reserved.
            </p>

          </div>

        </div>
      </footer>

      {/* ================= STYLES ================= */}
      <style jsx>{`
.ym-footer {
  background: linear-gradient(180deg, #2f4f88 0%, #385fa2 100%);
  color: #ffffff;        /* ← CHANGE THIS LINE */
  margin-top: 0px;
}

        .ym-footer-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 60px 24px 30px;
        }

        .ym-footer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 40px;
          margin-bottom: 50px;
        }

        .ym-footer-brand h2 {
          font-size: 22px;
          font-weight: 900;
          color: #ffffff;
          margin-bottom: 10px;
        }

        .ym-footer-brand p {
          font-size: 13.5px;
          line-height: 1.6;
          color: rgba(255,255,255,0.7);
          max-width: 260px;
        }

        .ym-footer h3 {
          font-size: 14px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 14px;
        }

        .ym-footer-grid > div {
  display: flex;
  flex-direction: column;
  gap: 9px;                    /* consistent spacing between links */
}

.ym-footer-grid > div h3 {
  margin-bottom: 6px;          /* heading spacing */
}

.ym-footer :global(a) {
  display: inline-flex;
  width: fit-content;
  max-width: 100%;
  font-size: 13px;
  line-height: 1.35;

  color: #ffffff !important;     /* FORCE WHITE */
  text-decoration: none !important;

  margin: 0;
  padding: 0;
  white-space: normal;
  transition: all 0.2s ease;
}

.ym-footer :global(a:hover) {
  color: #ffffff !important;
  opacity: 0.85;
  transform: translateX(3px);
}

        .ym-footer-payments {
          border-top: 1px solid rgba(255,255,255,0.12);
          border-bottom: 1px solid rgba(255,255,255,0.12);
          padding: 18px 0;
          margin-bottom: 26px;

          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
        }

        .ym-footer-payments span {
          font-size: 12px;
          color: rgba(255,255,255,0.65);
        }

        .ym-payment-icons {
          display: flex;
          gap: 18px;
          align-items: center;
        }

        .ym-footer-payments img {
          height: 26px;
          opacity: 0.9;
          filter: brightness(0) invert(1);
          transition: all 0.2s ease;
        }

        .ym-footer-payments img:hover {
          opacity: 1;
          transform: translateY(-2px);
        }

        .ym-footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 18px;
        }

        .ym-footer-socials {
          display: flex;
          gap: 14px;
          font-size: 18px;
        }

        .ym-footer-socials svg {
          cursor: pointer;
          opacity: 0.75;
          transition: all 0.2s ease;
        }

        .ym-footer-socials svg:hover {
          opacity: 1;
          transform: translateY(-2px);
        }

        .ym-footer-bottom p {
          font-size: 12.5px;
          color: rgba(255,255,255,0.6);
        }

        @media (max-width: 768px) {
          .ym-footer-inner {
            padding: 50px 18px 26px;
          }

          .ym-footer-bottom {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .ym-footer-brand p {
            max-width: 100%;
          }
        }
      `}</style>
    </>
  );
}