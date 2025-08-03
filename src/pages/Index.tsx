import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import HomePage from "@/components/pages/HomePage";
import DailyLogPage from "@/components/pages/DailyLogPage";
import ProgressPage from "@/components/pages/ProgressPage";
import SettingsPage from "@/components/pages/SettingsPage";
import { useLocalStorage, AppData } from "@/hooks/useLocalStorage";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [appData, setAppData] = useLocalStorage<AppData>('jee-prep-data', {
    profile: { name: 'Aspirant', jeeYear: 2025, books: [], streak: 0, totalDays: 0 },
    entries: [],
    settings: { theme: 'light' }
  });

  // Apply theme on load
  useEffect(() => {
    if (appData.settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appData.settings.theme]);

  const handleStartDaily = () => {
    setActiveTab("daily");
  };

  const handleDailyComplete = () => {
    setActiveTab("home");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomePage onStartDaily={handleStartDaily} />;
      case "daily":
        return <DailyLogPage onComplete={handleDailyComplete} />;
      case "progress":
        return <ProgressPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <HomePage onStartDaily={handleStartDaily} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default Index;
