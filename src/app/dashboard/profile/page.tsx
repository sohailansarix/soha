import { ProfileForm } from "./profile-form";
import { auth } from "@/lib/auth";

export default async function ProfilePage() {
  const session = await auth();
  const user = session!.user;
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Profile</h2>
      <ProfileForm
        defaultValues={{
          name: user.name ?? "",
          email: user.email ?? "",
        }}
      />
    </div>
  );
}
