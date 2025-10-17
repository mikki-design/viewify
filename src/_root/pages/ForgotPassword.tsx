import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { account } from "@/lib/appwrite/config"; // or your appwrite client
import { useToast } from "@/components/ui/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await account.createRecovery(
  email,
  `${window.location.origin}/reset-password-confirm`
);

      toast({
        title: "Recovery email sent",
        description: "Check your inbox to reset your password.",
        variant: "default",
      });
      setEmail("");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to send recovery email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4">
      <form
        onSubmit={handleReset}
        className="w-full max-w-sm bg-dark-2 p-6 rounded-xl shadow-lg"
      >
        <h2 className="text-xl font-semibold text-white mb-4">
          Forgot Password
        </h2>
        <p className="text-light-3 text-sm mb-4">
          Enter your registered email address and we’ll send you a link to reset your password.
        </p>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="shad-input mb-3"
          required
        />
        <Button
          type="submit"
          className="shad-button_primary w-full"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>
    </div>
  );
};

export default ForgotPassword;
