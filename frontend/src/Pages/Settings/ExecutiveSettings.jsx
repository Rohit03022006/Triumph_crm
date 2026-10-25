import React from "react";
import SettingsHeader from "@/components/Settings_Management/SettingsHeader";
import ChangePasswordForm from "@/components/Settings_Management/ChangePasswordForm";

const ExecutiveSettings = () => {
  return (
    <div className="space-y-6">
      <SettingsHeader />
      <ChangePasswordForm />
    </div>
  );
};

export default ExecutiveSettings;
