import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="container max-w-4xl px-4 py-16">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Form Builder App
            </h1>
            <p className="text-muted-foreground text-lg">
              Simple and clean data management
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Link href="/students" className="block transition-transform hover:scale-105">
              <Card className="h-full cursor-pointer border-2 hover:border-primary">
                <CardHeader>
                  <CardTitle>Students Database</CardTitle>
                  <CardDescription>
                    View all student records from the database
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Click to access the students table →
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Card className="h-full border-2">
              <CardHeader>
                <CardTitle>More Features</CardTitle>
                <CardDescription>
                  Coming soon
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Additional functionality will be added here
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
