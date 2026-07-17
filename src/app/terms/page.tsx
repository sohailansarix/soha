export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="container max-w-3xl py-10 prose">
      <h1 className="text-3xl font-bold">Terms of Service</h1>
      <p className="text-muted-foreground">Last updated: {new Date().getFullYear()}</p>
      <h2>Orders</h2>
      <p>By placing an order you agree to pay the listed price plus applicable shipping and tax. We reserve the right to cancel orders that cannot be fulfilled.</p>
      <h2>Returns & Refunds</h2>
      <p>Returns are accepted within 30 days of delivery for unopened items. Refunds are issued to the original payment method.</p>
      <h2>Limitation of liability</h2>
      <p>SOHA is not liable for indirect or consequential damages arising from use of the site or products.</p>
    </div>
  );
}
