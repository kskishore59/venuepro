import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export interface SubscriptionInfo {
  status: "active" | "trialing" | "past_due" | "canceled" | "unpaid" | "free_trial" | "expired" | "locked";
  isLocked: boolean;
  trialDaysLeft: number;
  showWarning: boolean;
  planName: string;
  currentPeriodEnd: string | null;
}

export const useSubscription = () => {
  const { organization, loading: authLoading } = useAuth();
  const [subInfo, setSubInfo] = useState<SubscriptionInfo>({
    status: "free_trial",
    isLocked: false,
    trialDaysLeft: 14,
    showWarning: false,
    planName: "Free Trial",
    currentPeriodEnd: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!organization) {
      setLoading(false);
      return;
    }

    const checkSubscription = async () => {
      try {
        // Query the subscriptions table
        const { data: subData, error: subError } = await supabase
          .from("subscriptions")
          .select("*, plans(*)")
          .eq("user_id", (await supabase.auth.getUser()).data.user?.id || "")
          .maybeSingle();

        // If the table doesn't exist or is not populated, fallback to organization created_at trial calculation
        if (subError || !subData) {
          calculateTrialFallback(organization.created_at);
          return;
        }

        // We have active subscription data from Stripe/DB
        const now = new Date();
        const status = subData.status;

        let isLocked = false;
        let showWarning = false;
        let trialDaysLeft = 0;

        if (status === "active" || status === "trialing") {
          isLocked = false;
          // Check if subscription cancel_at is soon
          if (subData.cancel_at) {
            const cancelDate = new Date(subData.cancel_at);
            const diffTime = cancelDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays <= 2 && diffDays > 0) {
              showWarning = true;
            }
          }
        } else if (status === "past_due") {
          // Warning for 3 days, then lock
          isLocked = true; // Safe lock on past_due
          showWarning = true;
        } else {
          isLocked = true;
        }

        setSubInfo({
          status: status as any,
          isLocked,
          trialDaysLeft,
          showWarning,
          planName: subData.plans?.name || "Premium Plan",
          currentPeriodEnd: subData.current_period_end || null,
        });
      } catch (err) {
        // Any query error fallback
        calculateTrialFallback(organization.created_at);
      } finally {
        setLoading(false);
      }
    };

    const calculateTrialFallback = (createdAtStr: string | undefined) => {
      const createdDate = createdAtStr ? new Date(createdAtStr) : new Date();
      const now = new Date();
      const trialDurationMs = 14 * 24 * 60 * 60 * 1000; // 14 days
      const trialEndDate = new Date(createdDate.getTime() + trialDurationMs);
      const diffTime = trialEndDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let status: SubscriptionInfo["status"] = "free_trial";
      let isLocked = false;
      let showWarning = false;

      if (diffDays <= 0) {
        status = "expired";
        isLocked = true;
      } else if (diffDays <= 2) {
        showWarning = true;
      }

      setSubInfo({
        status,
        isLocked,
        trialDaysLeft: Math.max(0, diffDays),
        showWarning,
        planName: "14-Day Free Trial",
        currentPeriodEnd: trialEndDate.toISOString(),
      });
    };

    checkSubscription();
  }, [organization, authLoading]);

  return { subInfo, loading };
};
