import { useState, useEffect } from "react";
import { Save, Plus, Minus, Clock, Target, Book, CheckCircle, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalStorage, DailyEntry, AppData } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";

interface DailyLogPageProps {
  onComplete: () => void;
}

const DailyLogPage = ({ onComplete }: DailyLogPageProps) => {
  const { toast } = useToast();
  const [appData, setAppData] = useLocalStorage<AppData>('jee-prep-data', {
    profile: { name: 'Aspirant', jeeYear: 2025, books: [], streak: 0, totalDays: 0 },
    entries: [],
    settings: { theme: 'light' }
  });

  const today = new Date().toISOString().split('T')[0];
  const existingEntry = appData.entries.find(entry => entry.date === today);

  const [formData, setFormData] = useState<Partial<DailyEntry>>(() => {
    if (existingEntry) return existingEntry;
    
    return {
      id: Date.now().toString(),
      date: today,
      goals: [''],
      physics: { questions: 0, target: 0, topics: [''] },
      chemistry: { questions: 0, target: 0, topics: [''] },
      mathematics: { questions: 0, target: 0, topics: [''] },
      studyHours: 0,
      lectures: [{ subject: 'Physics', topic: '', quantity: 1 }],
      backlog: [''],
      schoolAttendance: 'present' as const,
      completed: false,
      notes: ''
    };
  });

  const addGoal = () => {
    setFormData(prev => ({
      ...prev,
      goals: [...(prev.goals || []), '']
    }));
  };

  const updateGoal = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals?.map((goal, i) => i === index ? value : goal) || []
    }));
  };

  const removeGoal = (index: number) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals?.filter((_, i) => i !== index) || []
    }));
  };

  const updateSubject = (subject: 'physics' | 'chemistry' | 'mathematics', field: 'questions' | 'target', value: number) => {
    setFormData(prev => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        [field]: value
      }
    }));
  };

  const addTopic = (subject: 'physics' | 'chemistry' | 'mathematics') => {
    setFormData(prev => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        topics: [...(prev[subject]?.topics || []), '']
      }
    }));
  };

  const updateTopic = (subject: 'physics' | 'chemistry' | 'mathematics', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        topics: prev[subject]?.topics?.map((topic, i) => i === index ? value : topic) || []
      }
    }));
  };

  const addLecture = () => {
    setFormData(prev => ({
      ...prev,
      lectures: [...(prev.lectures || []), { subject: 'Physics', topic: '', quantity: 1 }]
    }));
  };

  const updateLecture = (index: number, field: 'subject' | 'topic' | 'quantity', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      lectures: prev.lectures?.map((lecture, i) => 
        i === index ? { ...lecture, [field]: value } : lecture
      ) || []
    }));
  };

  const addBacklog = () => {
    setFormData(prev => ({
      ...prev,
      backlog: [...(prev.backlog || []), '']
    }));
  };

  const updateBacklog = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      backlog: prev.backlog?.map((item, i) => i === index ? value : item) || []
    }));
  };

  const saveEntry = (completed: boolean = false) => {
    const entry: DailyEntry = {
      id: formData.id || Date.now().toString(),
      date: today,
      goals: formData.goals?.filter(g => g.trim()) || [],
      physics: formData.physics || { questions: 0, target: 0, topics: [] },
      chemistry: formData.chemistry || { questions: 0, target: 0, topics: [] },
      mathematics: formData.mathematics || { questions: 0, target: 0, topics: [] },
      studyHours: formData.studyHours || 0,
      lectures: formData.lectures?.filter(l => l.topic.trim()) || [],
      backlog: formData.backlog?.filter(b => b.trim()) || [],
      schoolAttendance: formData.schoolAttendance || 'present',
      completed,
      notes: formData.notes || ''
    };

    const updatedEntries = existingEntry 
      ? appData.entries.map(e => e.date === today ? entry : e)
      : [...appData.entries, entry];

    setAppData(prev => ({
      ...prev,
      entries: updatedEntries
    }));

    toast({
      title: completed ? "Day Completed! 🎉" : "Progress Saved! 💾",
      description: completed ? "Great job today! Keep the momentum going!" : "Your daily log has been saved."
    });

    if (completed) {
      onComplete();
    }
  };

  return (
    <div className="p-4 space-y-6 animate-slide-up">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Daily Study Log</h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString('en-IN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Goals Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Today's Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {formData.goals?.map((goal, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Enter your goal..."
                value={goal}
                onChange={(e) => updateGoal(index, e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => removeGoal(index)}
                disabled={formData.goals?.length === 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={addGoal} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
        </CardContent>
      </Card>

      {/* School Attendance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5 text-primary" />
            School Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {(['present', 'absent', 'holiday'] as const).map((status) => (
              <Button
                key={status}
                variant={formData.schoolAttendance === status ? "default" : "outline"}
                onClick={() => setFormData(prev => ({ ...prev, schoolAttendance: status }))}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subjects Section */}
      {(['physics', 'chemistry', 'mathematics'] as const).map((subject) => (
        <Card key={subject}>
          <CardHeader>
            <CardTitle className="capitalize flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${
                subject === 'physics' ? 'bg-blue-500' : 
                subject === 'chemistry' ? 'bg-green-500' : 'bg-purple-500'
              }`} />
              {subject}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Questions Practiced</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData[subject]?.questions || 0}
                  onChange={(e) => updateSubject(subject, 'questions', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Target Questions</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData[subject]?.target || 0}
                  onChange={(e) => updateSubject(subject, 'target', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            
            <div>
              <Label>Topics Covered</Label>
              {formData[subject]?.topics?.map((topic, index) => (
                <Input
                  key={index}
                  placeholder="Topic name..."
                  value={topic}
                  onChange={(e) => updateTopic(subject, index, e.target.value)}
                  className="mt-2"
                />
              ))}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => addTopic(subject)}
                className="mt-2 w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Topic
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Study Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Study Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="number"
            min="0"
            step="0.5"
            placeholder="Hours studied today"
            value={formData.studyHours || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, studyHours: parseFloat(e.target.value) || 0 }))}
          />
        </CardContent>
      </Card>

      {/* Lectures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5 text-primary" />
            Lectures Attended
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {formData.lectures?.map((lecture, index) => (
            <div key={index} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={lecture.subject}
                  onChange={(e) => updateLecture(index, 'subject', e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                </select>
                <Input
                  placeholder="Topic/Chapter"
                  value={lecture.topic}
                  onChange={(e) => updateLecture(index, 'topic', e.target.value)}
                />
              </div>
              <div>
                <Label>Number of Lectures</Label>
                <Input
                  type="number"
                  min="1"
                  value={lecture.quantity || 1}
                  onChange={(e) => updateLecture(index, 'quantity', parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={addLecture} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Lecture
          </Button>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Any additional notes, reflections, or reminders..."
            value={formData.notes || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pb-4">
        <Button 
          variant="outline" 
          onClick={() => saveEntry(false)}
          className="flex-1"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Progress
        </Button>
        <Button 
          onClick={() => saveEntry(true)}
          className="flex-1 bg-gradient-success hover:shadow-glow"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Complete Day
        </Button>
      </div>
    </div>
  );
};

export default DailyLogPage;