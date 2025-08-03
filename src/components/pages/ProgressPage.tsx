import { useState } from "react";
import { Calendar, TrendingUp, Award, BookOpen, Clock, School, Brain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/StatCard";
import SimpleChart from "@/components/SimpleChart";
import { useLocalStorage, AppData } from "@/hooks/useLocalStorage";

const ProgressPage = () => {
  const [appData] = useLocalStorage<AppData>('jee-prep-data', {
    profile: { name: 'Aspirant', jeeYear: 2025, books: [], streak: 0, totalDays: 0 },
    entries: [],
    settings: { theme: 'light' }
  });

  const [viewMode, setViewMode] = useState<'week' | 'month' | 'all'>('week');

  // Calculate statistics
  const completedEntries = appData.entries.filter(entry => entry.completed);
  const totalDays = completedEntries.length;
  
  const totalQuestions = completedEntries.reduce((sum, entry) => 
    sum + entry.physics.questions + entry.chemistry.questions + entry.mathematics.questions, 0
  );
  
  const totalStudyHours = completedEntries.reduce((sum, entry) => sum + entry.studyHours, 0);
  
  const averageQuestionsPerDay = totalDays > 0 ? Math.round(totalQuestions / totalDays) : 0;
  const averageStudyHours = totalDays > 0 ? (totalStudyHours / totalDays).toFixed(1) : '0';

  // School attendance stats
  const schoolPresent = appData.entries.filter(entry => entry.schoolAttendance === 'present').length;
  const schoolAbsent = appData.entries.filter(entry => entry.schoolAttendance === 'absent').length;
  const schoolHolidays = appData.entries.filter(entry => entry.schoolAttendance === 'holiday').length;
  const attendanceRate = (schoolPresent + schoolAbsent) > 0 ? ((schoolPresent / (schoolPresent + schoolAbsent)) * 100).toFixed(1) : "0";

  // Chart data for last 7 days
  const last7Days = appData.entries
    .slice(-7)
    .map(entry => ({
      name: new Date(entry.date).toLocaleDateString('en-IN', { weekday: 'short' }),
      value: entry.physics.questions + entry.chemistry.questions + entry.mathematics.questions,
      date: entry.date
    }));

  const studyHoursChart = appData.entries
    .slice(-7)
    .map(entry => ({
      name: new Date(entry.date).toLocaleDateString('en-IN', { weekday: 'short' }),
      value: entry.studyHours,
      date: entry.date
    }));

  // Subject-wise breakdown
  const subjectStats = {
    physics: completedEntries.reduce((sum, entry) => sum + entry.physics.questions, 0),
    chemistry: completedEntries.reduce((sum, entry) => sum + entry.chemistry.questions, 0),
    mathematics: completedEntries.reduce((sum, entry) => sum + entry.mathematics.questions, 0),
  };

  // Get filtered entries based on view mode
  const getFilteredEntries = () => {
    const now = new Date();
    const entries = [...completedEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    switch (viewMode) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return entries.filter(entry => new Date(entry.date) >= weekAgo);
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return entries.filter(entry => new Date(entry.date) >= monthAgo);
      default:
        return entries;
    }
  };

  const filteredEntries = getFilteredEntries();

  // Calculate consistency percentage
  const getConsistencyPercentage = () => {
    if (viewMode === 'all') {
      const daysSinceFirstEntry = appData.entries.length > 0 ? 
        Math.ceil((Date.now() - new Date(appData.entries[0].date).getTime()) / (1000 * 60 * 60 * 24)) : 0;
      return daysSinceFirstEntry > 0 ? Math.round((totalDays / daysSinceFirstEntry) * 100) : 0;
    }
    
    const targetDays = viewMode === 'week' ? 7 : 30;
    return Math.round((filteredEntries.length / targetDays) * 100);
  };

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Progress Analytics</h1>
        <p className="text-muted-foreground">Track your JEE preparation journey</p>
      </div>

      {/* View Mode Selector */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg bg-muted p-1">
          {(['week', 'month', 'all'] as const).map((mode) => (
            <Button
              key={mode}
              variant={viewMode === mode ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode(mode)}
              className="capitalize"
            >
              {mode === 'all' ? 'All Time' : `Last ${mode}`}
            </Button>
          ))}
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title="Total Questions"
          value={totalQuestions}
          icon={BookOpen}
          variant="primary"
        />
        <StatCard
          title="Study Hours"
          value={`${totalStudyHours}h`}
          icon={Clock}
          variant="success"
        />
        <StatCard
          title="School Attendance"
          value={`${attendanceRate}%`}
          icon={School}
          variant="warning"
        />
        <StatCard
          title="Consistency"
          value={`${getConsistencyPercentage()}%`}
          icon={Calendar}
          variant="default"
        />
      </div>

      {/* School Attendance Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5 text-primary" />
            School Attendance Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-success">{schoolPresent}</div>
              <div className="text-sm text-muted-foreground">Present</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-destructive">{schoolAbsent}</div>
              <div className="text-sm text-muted-foreground">Absent</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-warning">{schoolHolidays}</div>
              <div className="text-sm text-muted-foreground">Holidays</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Daily Questions (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleChart 
              data={last7Days}
              title=""
              color="hsl(var(--primary))"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-success" />
              Study Hours (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleChart 
              data={studyHoursChart}
              title=""
              color="hsl(var(--success))"
            />
          </CardContent>
        </Card>
      </div>

      {/* Subject-wise Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Subject-wise Question Count</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(subjectStats).map(([subject, count]) => {
            const percentage = totalQuestions > 0 ? Math.round((count / totalQuestions) * 100) : 0;
            const color = subject === 'physics' ? 'bg-blue-500' : 
                         subject === 'chemistry' ? 'bg-green-500' : 'bg-purple-500';
            
            return (
              <div key={subject} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium capitalize">{subject}</span>
                  <span className="text-sm text-muted-foreground">{count} questions ({percentage}%)</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${color}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Recent Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Study Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No study sessions yet!</p>
              <p className="text-sm">Start logging your daily progress to see analytics here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEntries.slice(0, 5).map((entry) => {
                const totalQuestions = entry.physics.questions + entry.chemistry.questions + entry.mathematics.questions;
                
                return (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">
                        {new Date(entry.date).toLocaleDateString('en-IN', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {totalQuestions} questions • {entry.studyHours}h study
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-secondary">
                        {entry.goals.length} goals
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.lectures.length} lectures
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Motivational Section */}
      {totalDays > 0 && (
        <Card className="bg-gradient-primary text-primary-foreground">
          <CardContent className="text-center py-6">
            <Award className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">Keep Going! 🚀</h3>
            <p className="opacity-90">
              You've completed {totalDays} study days and solved {totalQuestions} questions. 
              Every question brings you closer to your JEE goal!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Helper function to calculate streak (same as in HomePage)
function calculateStreak(entries: any[]): number {
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

export default ProgressPage;