import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Authentication error</CardTitle>
          <CardDescription>Something went wrong while signing you in.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/auth/login">Try again</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
