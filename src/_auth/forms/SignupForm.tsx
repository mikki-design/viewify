import * as z from "zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
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
//import { useToast } from "@/components/ui/use-toast";

import {
  useCreateUserAccount,
  useSignInAccount,
} from "@/lib/react-query/queries";
import { SignupValidation } from "@/lib/validation";
import { useUserContext } from "@/context/AuthContext";

const SignupForm = () => {
  
  const navigate = useNavigate();
  const { checkAuthUser, isLoading: isUserLoading } = useUserContext();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof SignupValidation>>({
    resolver: zodResolver(SignupValidation),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const errors = form.formState.errors;

    if (errors.name) setErrorMessage(errors.name.message || "Invalid name");
    if (errors.username)
      setErrorMessage(errors.username.message || "Invalid username");
    if (errors.email) setErrorMessage(errors.email.message || "Invalid email");
    if (errors.password)
      setErrorMessage(errors.password.message || "Invalid password");
  }, [form.formState.errors]);

  // Automatically clear the error after 3 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const { mutateAsync: createUserAccount, isLoading: isCreatingAccount } =
    useCreateUserAccount();
  const { mutateAsync: signInAccount, isLoading: isSigningInUser } =
    useSignInAccount();

  const handleSignup = async (user: z.infer<typeof SignupValidation>) => {
    try {
      const newUser = await createUserAccount(user);

      if (!newUser) {
        setErrorMessage("Unable to create account. Please try again.");
        return;
      }
if (user.honeypot) {
  setErrorMessage("Bot detected!");
  return;
}

      const session = await signInAccount({
        email: user.email,
        password: user.password,
      });

      if (!session) {
        setErrorMessage("Please login to your new account manually.");
        navigate("/sign-in");
        return;
      }

      const isLoggedIn = await checkAuthUser();

      if (isLoggedIn) {
        form.reset();
        navigate("/");
      } else {
        setErrorMessage("Something went wrong after signup. Try again.");
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Unexpected error occurred");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center">
      {/* 🔴 Error message at the top */}
      {errorMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-2 rounded-md shadow-md text-sm animate-fade-in-out z-50">
          {errorMessage}
        </div>
      )}

      <Form {...form}>
        <div className="sm:w-420 flex-center flex-col px-4 sm:px-0 pb-10">
          <img src="/assets/images/viewss.png" alt="logo" className="pt-40" />

          <h2 className="h3-bold md:h2-bold">Create a new account</h2>
          <p className="text-light-3 small-medium md:base-regular mt-2">
            To use viewify, please enter your details
          </p>

          <form
            onSubmit={form.handleSubmit(handleSignup)}
            className="flex flex-col gap-5 w-full mt-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Name</FormLabel>
                  <FormControl>
                    <Input type="text" className="shad-input" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Username</FormLabel>
                  <FormControl>
                    <Input type="text" className="shad-input" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Email</FormLabel>
                  <FormControl>
                    <Input type="text" className="shad-input" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Password</FormLabel>
                  <FormControl>
                    <Input type="password" className="shad-input" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
<FormField
  control={form.control}
  name="honeypot"
  render={({ field }) => (
    <input
      type="text"
      style={{ display: "none" }}
      tabIndex={-1}
      autoComplete="off"
      {...field}
    />
  )}
/>

            <Button type="submit" className="shad-button_primary">
              {isCreatingAccount || isSigningInUser || isUserLoading ? (
                <div className="flex-center gap-2">
                  <Loader /> Loading...
                </div>
              ) : (
                "Sign Up"
              )}
            </Button>

            <p className="text-small-regular text-light-2 text-center mt-2">
              Already have an account?
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

      {/* ✅ Fixed bottom watermark */}
      <p className="fixed bottom-2 left-0 right-0 text-center text-xs text-gray-500 opacity-60">
        Designed by{" "}
        <span className="font-semibold text-primary-500">Mikkitech</span>
      </p>
    </div>
  );
};

export default SignupForm;
