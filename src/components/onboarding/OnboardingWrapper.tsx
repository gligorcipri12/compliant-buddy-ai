import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { useAuth } from "@/hooks/useAuth";
import CompanyOnboardingModal from "./CompanyOnboardingModal";

/**
 * OnboardingWrapper - Renders the onboarding modal when needed
 * 
 * This component checks if:
 * 1. User is authenticated
 * 2. Profile is loaded
 * 3. Onboarding is not completed
 * 
 * If all conditions are met, it shows the onboarding modal.
 */
const OnboardingWrapper = () => {
  const { user } = useAuth();
  const { 
    loading, 
    needsOnboarding, 
    formData, 
    saving, 
    saveProfile, 
    skipOnboarding 
  } = useCompanyProfile();

  // Don't render anything if not logged in or still loading
  if (!user || loading) {
    return null;
  }

  return (
    <CompanyOnboardingModal
      open={needsOnboarding}
      onComplete={saveProfile}
      onSkip={skipOnboarding}
      saving={saving}
      initialData={formData}
    />
  );
};

export default OnboardingWrapper;
