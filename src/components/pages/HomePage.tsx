import { useEffect, useState } from "react";
import { Calendar, Target, Clock, Flame, Brain, CheckCircle, School } from "lucide-react";
import StatCard from "@/components/StatCard";
import SubjectCard from "@/components/SubjectCard";
import { Button } from "@/components/ui/button";
import { useLocalStorage, DailyEntry, AppData } from "@/hooks/useLocalStorage";

interface HomePageProps {
  onStartDaily: () => void;
}

const HomePage = ({ onStartDaily }: HomePageProps) => {
  const [appData, setAppData] = useLocalStorage<AppData>('jee-prep-data', {
    profile: { name: 'Aspirant', jeeYear: 2025, books: [], streak: 0, totalDays: 0 },
    entries: [],
    settings: { theme: 'light' }
  });

  const today = new Date().toISOString().split('T')[0];
  const todayEntry = appData.entries.find(entry => entry.date === today);
  
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate stats
  const totalQuestionsToday = todayEntry ? 
    todayEntry.physics.questions + todayEntry.chemistry.questions + todayEntry.mathematics.questions : 0;
  
  const totalTargetToday = todayEntry ?
    todayEntry.physics.target + todayEntry.chemistry.target + todayEntry.mathematics.target : 0;

  const studyHoursToday = todayEntry?.studyHours || 0;
  const goalsCompleted = todayEntry?.goals.length || 0;

  // Calculate streak
  const streak = calculateStreak(appData.entries);
  
  // Motivational message
  const getMotivationalMessage = () => {
    if (!todayEntry) return "Ready to start your study day? 📚";
    if (todayEntry.completed) return "Excellent work today! Keep the momentum! 🎯";
    if (totalQuestionsToday >= totalTargetToday && totalTargetToday > 0) return "Target achieved! You're on fire! 🔥";
    return "Keep pushing forward! Every question counts! 💪";
  };

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
          Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 18 ? 'Afternoon' : 'Evening'}, {appData.profile.name}!
        </h1>
        <p className="text-muted-foreground">
          {currentTime.toLocaleDateString('en-IN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
        <div className="bg-gradient-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium inline-block">
          {getMotivationalMessage()}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title="Questions Today"
          value={`${totalQuestionsToday}/${totalTargetToday}`}
          icon={Brain}
          variant={totalQuestionsToday >= totalTargetToday && totalTargetToday > 0 ? "success" : "default"}
        />
        <StatCard
          title="Study Hours"
          value={`${studyHoursToday}h`}
          icon={Clock}
          variant="primary"
        />
        <StatCard
          title="Current Streak"
          value={`${streak} days`}
          icon={Flame}
          variant={streak > 0 ? "warning" : "default"}
        />
        <StatCard
          title="School Today"
          value={todayEntry?.schoolAttendance ? todayEntry.schoolAttendance.charAt(0).toUpperCase() + todayEntry.schoolAttendance.slice(1) : "Not marked"}
          icon={School}
          variant={todayEntry?.schoolAttendance === 'present' ? "success" : todayEntry?.schoolAttendance === 'holiday' ? "warning" : "default"}
        />
      </div>

      {/* Subject Progress */}
      {todayEntry && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Today's Progress</h2>
          <div className="space-y-3">
            <SubjectCard
              subject="Physics"
              icon={Brain}
              questionsToday={todayEntry.physics.questions}
              target={todayEntry.physics.target}
              color="bg-blue-500"
            />
            <SubjectCard
              subject="Chemistry"
              icon={Brain}
              questionsToday={todayEntry.chemistry.questions}
              target={todayEntry.chemistry.target}
              color="bg-green-500"
            />
            <SubjectCard
              subject="Mathematics"
              icon={Brain}
              questionsToday={todayEntry.mathematics.questions}
              target={todayEntry.mathematics.target}
              color="bg-purple-500"
            />
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="text-center">
        {!todayEntry ? (
          <Button 
            onClick={onStartDaily}
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300 px-8 py-3 text-lg font-semibold"
          >
            <Calendar className="mr-2 h-5 w-5" />
            Start Study Day
          </Button>
        ) : !todayEntry.completed ? (
          <Button 
            onClick={onStartDaily}
            variant="outline"
            className="px-8 py-3 text-lg font-semibold border-primary text-primary hover:bg-primary/10"
          >
            Update Today's Log
          </Button>
        ) : (
          <div className="flex items-center justify-center gap-2 text-secondary font-semibold">
            <CheckCircle className="h-5 w-5" />
            Day Completed!
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to calculate streak
function calculateStreak(entries: DailyEntry[]): number {
  if (entries.length === 0) return 0;
  
  const sortedEntries = entries
    .filter(entry => entry.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (sortedEntries.length === 0) return 0;
  
  let streak = 0;
  let currentDate = new Date();
  
  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.date);
    const diffDays = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === streak) {
      streak++;
      currentDate = entryDate;
    } else if (diffDays === streak + 1) {
      // Allow for today not being completed yet
      if (streak === 0 && diffDays === 1) {
        streak++;
        currentDate = entryDate;
      } else {
        break;
      }
    } else {
      break;
    }
  }
  
  return streak;
}

export default HomePage;