export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl py-10 prose">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="text-muted-foreground">Last updated: {new Date().getFullYear()}</p>
      <h2>Information we collect</h2>
      <p>We collect account information (name, email), order details, and usage analytics to provide and improve our service.</p>
      <h2>How we use your data</h2>
      <p>Your data is used to process orders, provide customer support, and send transactional communications. We never sell your personal information.</p>
      <h2>Cookies</h2>
      <p>We use cookies to keep you signed in and to remember your cart and preferences.</p>
      <h2>Your rights</h2>
      <p>You may request access to or deletion of your personal data by contacting us through the contact page.</p>
    </div>
  );
}
