import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
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

// ✅ Validation Schema
const ResetPasswordValidation = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ✅ Appwrite Setup
const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("687d64fb003444cfedc1");

const account = new Account(client);

const ResetPasswordConfirm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  const [topError, setTopError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof ResetPasswordValidation>>({
    resolver: zodResolver(ResetPasswordValidation),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // ✅ Validation error display
  useEffect(() => {
    const errors = form.formState.errors;
    const firstError =
      errors.password?.message || errors.confirmPassword?.message;
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

  // ✅ Handle password reset confirmation
  const handleReset = async (data: z.infer<typeof ResetPasswordValidation>) => {
    setIsLoading(true);
    setTopError(null);

    try {
      await account.updateRecovery(userId!, secret!, data.password, data.confirmPassword);
      toast({
        title: "Password Reset Successful",
        description: "Redirecting you to login...",
      });
      setTimeout(() => navigate("/sign-in"), 3000);
    } catch (err: any) {
      const message = err?.message || "Failed to reset password. Please try again.";
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
      {/* 🔴 Fixed top error message (mobile only) */}
      {topError && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-sm text-center py-2 z-50 animate-slideDown sm:hidden">
          {topError}
        </div>
      )}

      <Form {...form}>
        <div className="sm:w-420 flex-center flex-col px-4 sm:px-0 pb-10">
          <img src="/assets/images/viewss.png" alt="logo" className="pt-40" />

          <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">Set New Password</h2>
          <p className="text-light-3 small-medium md:base-regular mt-2">
            Enter and confirm your new password below.
          </p>

          <form
            onSubmit={form.handleSubmit(handleReset)}
            className="flex flex-col gap-5 w-full mt-4"
          >
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      className="shad-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      className="shad-input"
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
                  <Loader /> Updating...
                </div>
              ) : (
                "Update Password"
              )}
            </Button>

            <p className="text-small-regular text-light-2 text-center mt-2">
              Remembered your password?
              <button
                type="button"
                onClick={() => navigate("/sign-in")}
                className="text-primary-500 text-small-semibold ml-1"
              >
                Log in
              </button>
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

export default ResetPasswordConfirm;
