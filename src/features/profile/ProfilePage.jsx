import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../../shared/components/ui/card";
import { Button } from "../../shared/components/ui/button";
import { Input } from "../../shared/components/ui/input";
import { Separator } from "../../shared/components/ui/separator";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "../../shared/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../shared/components/ui/dialog";
import axiosInstance from "../../shared/lib/axios";

// Define the supported currencies for the app
const AVAILABLE_CURRENCIES = [
  { code: "IDR", name: "Indonesian Rupiah" },
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "CNY", name: "Chinese Yuan" },
];

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const currencySchema = z.object({
  mainCurrency: z.string().min(3, "Please select a main currency"),
  currencies: z.array(z.string()).min(1, "At least one currency must be selected"),
});

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isCurrencyDialogOpen, setCurrencyDialogOpen] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  
  // Form for basic profile details
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
    },
  });

  // Form for currency preferences
  const currencyForm = useForm({
    resolver: zodResolver(currencySchema),
    defaultValues: {
      mainCurrency: user?.preferences?.mainCurrency || "IDR",
      currencies: user?.preferences?.currencies || ["IDR"],
    },
  });

  // Check if this is the first login (no currencies set) and show the currency modal
  useEffect(() => {
    if (user && (!user.preferences || !user.preferences.mainCurrency)) {
      setIsFirstLogin(true);
      setCurrencyDialogOpen(true);
    }
  }, [user]);

  // Update form values when user data changes
  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name || "",
      });

      currencyForm.reset({
        mainCurrency: user?.preferences?.mainCurrency || "IDR",
        currencies: user?.preferences?.currencies || ["IDR"],
      });
    }
  }, [user, profileForm, currencyForm]);
  
  // Handle profile form submission
  const onSubmitProfile = async (values) => {
    setIsLoading(true);
    
    try {
      const success = await updateProfile({
        name: values.name
      });
      
      if (success) {
        toast.success("Profile updated successfully");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle currency preferences form submission
  const onSubmitCurrencyPreferences = async (values) => {
    setIsLoading(true);
    
    try {
      // Make sure main currency is included in currencies array
      if (!values.currencies.includes(values.mainCurrency)) {
        values.currencies.push(values.mainCurrency);
      }
      
      const success = await updateProfile({
        preferences: {
          ...user?.preferences,
          mainCurrency: values.mainCurrency,
          currencies: values.currencies,
        }
      });
      
      if (success) {
        toast.success("Currency preferences updated successfully");
        setCurrencyDialogOpen(false);
      } else {
        toast.error("Failed to update currency preferences");
      }
    } catch (error) {
      console.error("Currency preferences update error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your basic profile information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form
                onSubmit={profileForm.handleSubmit(onSubmitProfile)}
                className="space-y-4"
              >
                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="email"
                  render={() => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          value={user?.email || ""}
                          disabled
                          readOnly
                        />
                      </FormControl>
                      <FormDescription>
                        Your email cannot be changed.
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Currency Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Currency Preferences</CardTitle>
            <CardDescription>
              Configure your default currency and other currency options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-1">Main Currency</h3>
                  <p className="text-sm text-muted-foreground">
                    {user?.preferences?.mainCurrency || "Not set"}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Additional Currencies</h3>
                  <p className="text-sm text-muted-foreground">
                    {user?.preferences?.currencies?.filter(c => c !== user?.preferences?.mainCurrency).join(", ") || "None"}
                  </p>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setCurrencyDialogOpen(true)}
              >
                Edit Currency Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Currency Preferences Dialog */}
      <Dialog open={isCurrencyDialogOpen} onOpenChange={setCurrencyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isFirstLogin ? "Set Your Currency Preferences" : "Edit Currency Preferences"}
            </DialogTitle>
            <DialogDescription>
              {isFirstLogin 
                ? "Before you start, please set your main currency and any additional currencies you'll be using."
                : "Update your main currency and the currencies you want to use in your accounts."
              }
            </DialogDescription>
          </DialogHeader>

          <Form {...currencyForm}>
            <form
              onSubmit={currencyForm.handleSubmit(onSubmitCurrencyPreferences)}
              className="space-y-4 py-4"
            >
              <FormField
                control={currencyForm.control}
                name="mainCurrency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Currency</FormLabel>
                    <FormControl>
                      <select
                        className="w-full p-2 rounded-md border border-input"
                        {...field}
                      >
                        <option value="">Select a currency</option>
                        {AVAILABLE_CURRENCIES.map(currency => (
                          <option key={currency.code} value={currency.code}>
                            {currency.code} - {currency.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormDescription>
                      This will be your default currency for new accounts.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={currencyForm.control}
                name="currencies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Currencies</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-2 gap-2">
                        {AVAILABLE_CURRENCIES.map(currency => (
                          <label key={currency.code} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              value={currency.code}
                              checked={field.value.includes(currency.code)}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (e.target.checked) {
                                  field.onChange([...field.value, value]);
                                } else {
                                  // Don't allow unchecking main currency
                                  if (value === currencyForm.getValues().mainCurrency) {
                                    toast.info("You cannot remove your main currency");
                                    return;
                                  }
                                  field.onChange(field.value.filter(v => v !== value));
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">{currency.code}</span>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Select all currencies you plan to use in your accounts.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                {!isFirstLogin && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrencyDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Preferences"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;