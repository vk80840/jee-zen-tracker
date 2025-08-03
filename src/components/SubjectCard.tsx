import { LucideIcon } from "lucide-react";

interface SubjectCardProps {
  subject: string;
  icon: LucideIcon;
  questionsToday: number;
  target: number;
  color: string;
}

const SubjectCard = ({ subject, icon: Icon, questionsToday, target, color }: SubjectCardProps) => {
  const progress = target > 0 ? (questionsToday / target) * 100 : 0;
  const isCompleted = questionsToday >= target;

  return (
    <div className="bg-gradient-card border border-border rounded-lg p-4 transition-smooth hover:shadow-soft">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-card-foreground">{subject}</h3>
          <p className="text-sm text-muted-foreground">
            {questionsToday}/{target} questions
          </p>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Progress</span>
          <span className={`text-xs font-medium ${isCompleted ? 'text-secondary' : 'text-muted-foreground'}`}>
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              isCompleted ? 'bg-secondary' : 'bg-primary'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default SubjectCard;