import { ContactForm } from "./contact-form";

export const metadata = { title: "Contact Us" };

export default function ContactPage() {
  return (
    <div className="container max-w-2xl py-10">
      <h1 className="text-3xl font-bold">Get in touch</h1>
      <p className="mt-2 text-muted-foreground">
        We'd love to hear from you. Fill out the form and our team will respond within 24 hours.
      </p>
      <div className="mt-8">
        <ContactForm />
      </div>
    </div>
  );
}
