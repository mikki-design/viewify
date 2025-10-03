import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loader from "@/components/shared/Loader";
import { useToast } from "@/components/ui/use-toast";

import { SigninValidation } from "@/lib/validation";
import { useSignInAccount } from "@/lib/react-query/queries";
import { useUserContext } from "@/context/AuthContext";

const SigninForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { checkAuthUser, isLoading: isUserLoading } = useUserContext();

  // Query
  const { mutateAsync: signInAccount, isLoading } = useSignInAccount();

  const form = useForm<z.infer<typeof SigninValidation>>({
    resolver: zodResolver(SigninValidation),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // ✅ Show toast when validation errors occur
  useEffect(() => {
    const errors = form.formState.errors;

    if (errors.email) {
      toast({
        title: "Email Error",
        description: errors.email.message,
        variant: "destructive",
      });
    }
    if (errors.password) {
      toast({
        title: "Password Error",
        description: errors.password.message,
        variant: "destructive",
      });
    }
  }, [form.formState.errors, toast]);

const handleSignin = async (user: z.infer<typeof SigninValidation>) => {
  try {
    const session = await signInAccount(user);

    if (!session) {
      throw new Error("Invalid email or password");
    }

    const isLoggedIn = await checkAuthUser();

    if (isLoggedIn) {
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.email}`,
        variant: "default",
      });

      form.reset();
      navigate("/");
    } else {
      throw new Error("Could not verify logged in user");
    }
  } catch (err: any) {
    let errorMessage = err?.message || "Something went wrong";

    // Map specific Appwrite errors to friendlier messages
    if (err?.code === 401 || errorMessage.includes("Invalid credentials")) {
      errorMessage = "Invalid email or password";
    }

    toast({
      title: "Login failed",
      description: errorMessage,
      variant: "destructive",
    });
  }
};




  return (
    <Form {...form}>
      <div className="sm:w-420 flex-center flex-col px-4 sm:px-0 pb-10">
        <img 
          src="/assets/images/viewss.png" 
          alt="logo" 
          className="pt-40" 
        />

        <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">
          Log in to your account
        </h2>
        <p className="text-light-3 small-medium md:base-regular mt-2">
          Welcome back! Please enter your details.
        </p>

        <form
          onSubmit={form.handleSubmit(handleSignin)}
          className="flex flex-col gap-5 w-full mt-4"
        >
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

          <Button type="submit" className="shad-button_primary">
            {isLoading || isUserLoading ? (
              <div className="flex-center gap-2">
                <Loader /> Loading...
              </div>
            ) : (
              "Log in"
            )}
          </Button>

          <p className="text-small-regular text-light-2 text-center mt-2">
            Don&apos;t have an account?
            <Link
              to="/sign-up"
              className="text-primary-500 text-small-semibold ml-1"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </Form>
  );
};

export default SigninForm;
