import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import {  Link } from "react-router-dom";
import { Client, Account } from "appwrite";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loader from "@/components/shared/Loader";
import { useToast } from "@/components/ui/use-toast";

// ✅ Zod validation schema
const ResetPasswordValidation = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// ✅ Appwrite client
const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("687d64fb003444cfedc1");

const account = new Account(client);

const ResetPasswordForm = () => {
  const { toast } = useToast();
  //const navigate = useNavigate();
  const [topError, setTopError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof ResetPasswordValidation>>({
    resolver: zodResolver(ResetPasswordValidation),
    defaultValues: { email: "" },
  });

  // ✅ Display top validation error like SigninForm
  useEffect(() => {
    const errors = form.formState.errors;
    let firstError = null;

    if (errors.email) firstError = errors.email.message;

    if (firstError) {
      setTopError(firstError);
      toast({
        title: "Validation Error",
        description: firstError,
        variant: "destructive",
      });

      const timeout = setTimeout(() => setTopError(null), 4000);
      return () => clearTimeout(timeout);
    }
  }, [form.formState.errors, toast]);

  // ✅ Handle password reset
  const handleReset = async (data: z.infer<typeof ResetPasswordValidation>) => {
    setIsLoading(true);
    setTopError(null);

    try {
      await account.createRecovery(
        data.email,
        `${window.location.origin}/reset-password-confirm`
      );

      toast({
        title: "Reset Link Sent",
        description: "Please check your email for the reset instructions.",
      });

      form.reset();
    } catch (err: any) {
      const message = err?.message || "Failed to send reset email. Please try again.";
      setTopError(message);
      toast({
        title: "Reset Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center">
      {/* 🔴 Top error message (mobile only) */}
      {topError && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-sm text-center py-2 z-50 animate-slideDown sm:hidden">
          {topError}
        </div>
      )}

      <Form {...form}>
        <div className="sm:w-420 flex-center flex-col px-4 sm:px-0 pb-10">
          <img src="/assets/images/viewss.png" alt="logo" className="pt-40" />

          <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">Reset Password</h2>
          <p className="text-light-3 small-medium md:base-regular mt-2 text-center">
            Enter your registered email to receive a password reset link.
          </p>

          <form
            onSubmit={form.handleSubmit(handleReset)}
            className="flex flex-col gap-5 w-full mt-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      className="shad-input"
                      placeholder="Enter your email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="shad-button_primary">
              {isLoading ? (
                <div className="flex-center gap-2">
                  <Loader /> Sending...
                </div>
              ) : (
                "Send Reset Link"
              )}
            </Button>

            <p className="text-small-regular text-light-2 text-center mt-2">
              Remembered your password?
              <Link
                to="/sign-in"
                className="text-primary-500 text-small-semibold ml-1"
              >
                Log in
              </Link>
            </p>
          </form>
        </div>
      </Form>

      {/* ✅ Bottom watermark */}
      <div className="fixed bottom-3 left-0 right-0 flex justify-center items-center pointer-events-none select-none">
        <p className="text-xs text-light-4 tracking-wide">
          Designed by{" "}
          <span className="text-primary-500 font-semibold">Mikkitech</span>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
