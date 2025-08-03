import { useState } from "react";
import { User, Book, Download, Upload, Trash2, Moon, Sun, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocalStorage, AppData } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const { toast } = useToast();
  const [appData, setAppData] = useLocalStorage<AppData>('jee-prep-data', {
    profile: { name: 'Aspirant', jeeYear: 2025, books: [], streak: 0, totalDays: 0 },
    entries: [],
    settings: { theme: 'light' }
  });

  const [profileData, setProfileData] = useState({
    name: appData.profile.name,
    jeeYear: appData.profile.jeeYear,
    books: appData.profile.books.join(', ')
  });

  const [isDark, setIsDark] = useState(appData.settings.theme === 'dark');

  const updateProfile = () => {
    const booksArray = profileData.books
      .split(',')
      .map(book => book.trim())
      .filter(book => book.length > 0);

    setAppData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        name: profileData.name,
        jeeYear: profileData.jeeYear,
        books: booksArray
      }
    }));

    toast({
      title: "Profile Updated! ✅",
      description: "Your profile information has been saved."
    });
  };

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    
    setAppData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        theme: newTheme
      }
    }));

    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    toast({
      title: `Switched to ${newTheme} mode! 🎨`,
      description: `App appearance changed to ${newTheme} theme.`
    });
  };

  const exportData = () => {
    const dataStr = JSON.stringify(appData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `jee-prep-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Data Exported! 💾",
      description: "Your study data has been downloaded as a backup file."
    });
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        // Validate the imported data structure
        if (importedData.profile && importedData.entries && importedData.settings) {
          setAppData(importedData);
          setProfileData({
            name: importedData.profile.name,
            jeeYear: importedData.profile.jeeYear,
            books: importedData.profile.books.join(', ')
          });
          setIsDark(importedData.settings.theme === 'dark');
          
          toast({
            title: "Data Imported! 📥",
            description: "Your study data has been successfully restored."
          });
        } else {
          throw new Error("Invalid file format");
        }
      } catch (error) {
        toast({
          title: "Import Failed! ❌",
          description: "Please check if the file is a valid JEE Prep Tracker backup.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const resetAllData = () => {
    if (window.confirm("Are you sure you want to reset all data? This action cannot be undone.")) {
      const defaultData: AppData = {
        profile: { name: 'Aspirant', jeeYear: 2025, books: [], streak: 0, totalDays: 0 },
        entries: [],
        settings: { theme: 'light' }
      };
      
      setAppData(defaultData);
      setProfileData({
        name: 'Aspirant',
        jeeYear: 2025,
        books: ''
      });
      setIsDark(false);
      document.documentElement.classList.remove('dark');

      toast({
        title: "Data Reset! 🔄",
        description: "All your data has been cleared. Start fresh!",
        variant: "destructive"
      });
    }
  };

  const getStatsText = () => {
    const totalEntries = appData.entries.length;
    const completedDays = appData.entries.filter(e => e.completed).length;
    const totalQuestions = appData.entries.reduce((sum, entry) => 
      sum + entry.physics.questions + entry.chemistry.questions + entry.mathematics.questions, 0
    );

    return `${completedDays} completed days • ${totalQuestions} total questions • ${totalEntries} total entries`;
  };

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={profileData.name}
              onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Your name"
            />
          </div>
          
          <div>
            <Label htmlFor="jeeYear">JEE Attempt Year</Label>
            <Input
              id="jeeYear"
              type="number"
              min="2024"
              max="2030"
              value={profileData.jeeYear}
              onChange={(e) => setProfileData(prev => ({ ...prev, jeeYear: parseInt(e.target.value) || 2025 }))}
            />
          </div>
          
          <div>
            <Label htmlFor="books">Books/Sources (comma-separated)</Label>
            <Input
              id="books"
              value={profileData.books}
              onChange={(e) => setProfileData(prev => ({ ...prev, books: e.target.value }))}
              placeholder="HC Verma, Allen Modules, Cengage..."
            />
          </div>
          
          <Button onClick={updateProfile} className="w-full">
            Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* App Settings */}
      <Card>
        <CardHeader>
          <CardTitle>App Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <span className="font-medium">Dark Mode</span>
            </div>
            <Button variant="outline" onClick={toggleTheme}>
              {isDark ? 'Switch to Light' : 'Switch to Dark'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5 text-primary" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <p className="font-medium mb-1">Current Data:</p>
            <p>{getStatsText()}</p>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <Button variant="outline" onClick={exportData} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export Data (Backup)
            </Button>
            
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Import Data (Restore)
              </Button>
            </div>
            
            <Button 
              variant="destructive" 
              onClick={resetAllData}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Reset All Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card className="bg-gradient-card">
        <CardContent className="text-center py-6">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-bold mb-2">JEE Prep Tracker</h3>
          <p className="text-sm text-muted-foreground">
            Smart Study Journal for JEE Aspirants
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Your data is stored locally and privately on your device.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;