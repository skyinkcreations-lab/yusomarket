export const dynamic = "force-dynamic";

import Header from "../../_components/Header";
import Footer from "../../_components/Footer";
import SuccessContent from "./success-content";

export default function CheckoutReturnPage() {
  return (
    <>
      <Header />

      <main className="checkout-success">
        <SuccessContent />
      </main>

      <Footer />
    </>
  );
}