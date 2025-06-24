import { useState, FormEvent, ChangeEvent } from 'react';
import { supabase } from "@/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"; // CardFooter is not directly used with Tabs but can remain
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs components

function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("signIn"); // State to manage active tab

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (activeTab === "signUp") {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(signUpError.message);
      } else {
        setMessage("Sign-up successful! Please check your email to confirm your account.");
        setEmail("");
        setPassword("");
      }
    } else { // activeTab === "signIn"
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
      } else {
        setMessage("Signed in successfully!");
        // Redirect or perform further actions upon successful sign-in
      }
    }
    setLoading(false);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setError(null); // Clear errors when changing tabs
    setMessage(null); // Clear messages when changing tabs
    setEmail(""); // Clear fields
    setPassword(""); // Clear fields
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {activeTab === "signUp" ? "Create an Account" : "Sign In"}
          </CardTitle>
          <CardDescription className="text-center">
            {activeTab === "signUp"
              ? "Enter your email and password to create an account."
              : "Enter your email and password to access your account."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signIn">Sign In</TabsTrigger>
              <TabsTrigger value="signUp">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signIn" className="mt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-signin">Email</Label>
                  <Input
                    id="email-signin"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signin">Password</Label>
                  <Input
                    id="password-signin"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                {message && <p className="text-green-500 text-sm text-center">{message}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signUp" className="mt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-signup">Email</Label>
                  <Input
                    id="email-signup"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Password</Label>
                  <Input
                    id="password-signup"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                {message && <p className="text-green-500 text-sm text-center">{message}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing Up..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default Auth;