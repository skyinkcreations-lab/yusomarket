"use client";

import React from "react";
import Header from "../../../_components/Header";
import Footer from "../../../_components/Footer";

type TrackingPageProps = {
  params: { purchaseId: string };
};

export default function TrackingDetailsPage({ params }: TrackingPageProps) {
  const trackingId = params.purchaseId;

  // Placeholder tracking data
  const tracking = {
    id: trackingId,
    itemName: "Monstera plant",
    carrier: "AusPost (placeholder)",
    status: "In transit",
    estDelivery: "28 Nov 2025",
    events: [
      {
        label: "Out for delivery",
        date: "28 Nov 2025, 7:45am",
        done: false,
      },
      {
        label: "Arrived at local facility",
        date: "27 Nov 2025, 11:20pm",
        done: true,
      },
      {
        label: "Departed sorting facility",
        date: "26 Nov 2025, 3:10pm",
        done: true,
      },
      {
        label: "Parcel received by carrier",
        date: "25 Nov 2025, 9:05am",
        done: true,
      },
    ],
    shippingAddress: `Jordan Poole
123 Yuso Street
Brisbane QLD 4000
Australia`,
  };

  return (
    <>
      <Header />

      <main style={{ background: "#fff", minHeight: "calc(100vh - 200px)" }}>
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            padding: "32px 16px 56px",
          }}
        >
          <p
            style={{
              fontSize: 12,
              color: "#6b7280",
              marginBottom: 6,
            }}
          >
            Purchases &amp; Tracking /{" "}
            <span style={{ color: "#111827" }}>Tracking #{tracking.id}</span>
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 20,
            }}
          >
            {/* MAIN TRACKING CARD */}
            <section
              style={{
                flex: "1 1 560px",
                background: "#ffffff",
                borderRadius: 16,
                border: "1px solid #e5e7eb",
                padding: "22px 24px 24px",
                boxShadow: "0 8px 20px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 8,
                }}
              >
                <h1
                  style={{
                    fontSize: 20,
                    fontWeight: 600,
                    color: "#111827",
                  }}
                >
                  Tracking #{tracking.id}
                </h1>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: 999,
                    background: "#dbeafe",
                    color: "#1d4ed8",
                  }}
                >
                  {tracking.status}
                </span>
              </div>

              <p
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  marginBottom: 14,
                }}
              >
                {tracking.itemName} • Est. delivery {tracking.estDelivery}
              </p>

              <div
                style={{
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  padding: 14,
                  marginBottom: 16,
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    color: "#4b5563",
                    marginBottom: 4,
                  }}
                >
                  Carrier: {tracking.carrier}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: "#4b5563",
                  }}
                >
                  Tracking number: <span>YT1234567890AU</span> (placeholder)
                </p>
              </div>

              <h2
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 10,
                  color: "#111827",
                }}
              >
                Tracking updates
              </h2>

              {/* Timeline */}
              <ol
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                }}
              >
                {tracking.events.map((event, idx) => {
                  const isLast = idx === tracking.events.length - 1;
                  return (
                    <li
                      key={idx}
                      style={{
                        display: "flex",
                        gap: 10,
                        paddingBottom: isLast ? 0 : 14,
                        position: "relative",
                      }}
                    >
                      {/* dot + vertical line */}
                      <div
                        style={{
                          width: 14,
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            border: "2px solid #1d4ed8",
                            background: event.done ? "#1d4ed8" : "#ffffff",
                            marginTop: 3,
                          }}
                        />
                        {!isLast && (
                          <div
                            style={{
                              position: "absolute",
                              left: 6,
                              top: 16,
                              bottom: 0,
                              width: 1,
                              background: "#e5e7eb",
                            }}
                          />
                        )}
                      </div>

                      <div>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#111827",
                          }}
                        >
                          {event.label}
                        </p>
                        <p
                          style={{
                            fontSize: 11,
                            color: "#6b7280",
                          }}
                        >
                          {event.date}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>

            {/* SIDEBAR: shipping address + help */}
            <aside
              style={{
                flex: "1 1 260px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div style={sideCard}>
                <h3 style={sideTitle}>Ship to</h3>
                <p style={sideBody}>{tracking.shippingAddress}</p>
              </div>

              <div style={sideCard}>
                <h3 style={sideTitle}>Have an issue?</h3>
                <p style={sideBody}>
                  If your parcel is delayed or lost, reach out to us and we&apos;ll
                  help you chase it up with the carrier.
                </p>
                <button
                  type="button"
                  style={{
                    marginTop: 8,
                    padding: "8px 14px",
                    borderRadius: 999,
                    border: "none",
                    background: "#111827",
                    color: "#ffffff",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Contact support
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

/* helper styles */

const sideCard: React.CSSProperties = {
  background: "#f9fafb",
  borderRadius: 16,
  border: "1px solid #e5e7eb",
  padding: 14,
};

const sideTitle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "#111827",
  marginBottom: 6,
};

const sideBody: React.CSSProperties = {
  fontSize: 12,
  color: "#4b5563",
  whiteSpace: "pre-line",
};
