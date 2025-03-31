import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../shared/components/ui/dialog";
import { Button } from "../../shared/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "../../shared/components/ui/form";

// Define the supported currencies
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

const formSchema = z.object({
  mainCurrency: z.string().min(3, "Please select a main currency"),
  currencies: z.array(z.string()).min(1, "At least one currency must be selected"),
});

const CurrencySelectionModal = ({ 
  open, 
  onOpenChange, 
  onSave,
  defaultValues = { mainCurrency: "IDR", currencies: ["IDR"] },
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (values) => {
    setIsLoading(true);
    
    try {
      // Make sure main currency is included in currencies array
      if (!values.currencies.includes(values.mainCurrency)) {
        values.currencies.push(values.mainCurrency);
      }
      
      if (onSave) {
        await onSave(values);
      }
    } catch (error) {
      console.error("Currency preferences error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome to FinTrack!</DialogTitle>
          <DialogDescription>
            Please set your main currency and any additional currencies you'll be using.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
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
                    This will be your default currency for all accounts.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
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
                                if (value === form.getValues().mainCurrency) {
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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Preferences"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CurrencySelectionModal;