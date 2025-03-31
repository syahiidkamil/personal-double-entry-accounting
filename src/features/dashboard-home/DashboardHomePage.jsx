import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/hooks/useAuth";
import CurrencySelectionModal from "../profile/CurrencySelectionModal";
import { toast } from "sonner";

const DashboardHomePage = () => {
  const { user, updateProfile } = useAuth();
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  
  // Check if this is the first login (no currencies set) and show the currency modal
  useEffect(() => {
    if (user && (!user.preferences || !user.preferences.mainCurrency)) {
      setShowCurrencyModal(true);
    }
  }, [user]);

  // Handle currency preferences submission
  const handleSaveCurrencyPreferences = async (values) => {
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
        toast.success("Currency preferences saved successfully");
        setShowCurrencyModal(false);
      } else {
        toast.error("Failed to save currency preferences");
      }
    } catch (error) {
      console.error("Currency preferences error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Dashboard content will go here */}
        <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Welcome to FinTrack</h2>
          <p className="text-muted-foreground">
            Your personal double-entry accounting system. Start by setting up your 
            accounts and tracking your transactions.
          </p>
        </div>
      </div>
      
      {/* First login currency selection modal */}
      <CurrencySelectionModal
        open={showCurrencyModal}
        onOpenChange={setShowCurrencyModal}
        onSave={handleSaveCurrencyPreferences}
        defaultValues={{
          mainCurrency: "IDR",
          currencies: ["IDR"]
        }}
      />
    </div>
  );
};

export default DashboardHomePage;