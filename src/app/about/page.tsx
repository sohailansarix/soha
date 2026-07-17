export const metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <div className="container max-w-3xl py-10">
      <h1 className="text-3xl font-bold">About SOHA</h1>
      <p className="mt-4 text-muted-foreground">
        SOHA is a premium shopping destination built on a belief that great products deserve a
        beautiful experience. We curate quality items across categories and deliver them with care.
      </p>
      <h2 className="mt-8 text-xl font-semibold">Our mission</h2>
      <p className="mt-2 text-muted-foreground">
        To make premium shopping effortless — fast, transparent, and elegant from browse to doorstep.
      </p>
    </div>
  );
}
