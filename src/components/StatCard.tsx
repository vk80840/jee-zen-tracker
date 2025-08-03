import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "primary";
  className?: string;
}

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  variant = "default",
  className = ""
}: StatCardProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "success":
        return "bg-gradient-success text-secondary-foreground";
      case "warning":
        return "bg-gradient-to-br from-accent to-accent/80 text-accent-foreground";
      case "primary":
        return "bg-gradient-primary text-primary-foreground";
      default:
        return "bg-gradient-card text-card-foreground hover:shadow-soft";
    }
  };

  return (
    <div className={`
      rounded-lg p-4 transition-smooth border border-border/50
      ${getVariantClasses()} ${className}
    `}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium opacity-90">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-xs opacity-75">{subtitle}</p>
          )}
        </div>
        <Icon className="h-8 w-8 opacity-80" />
      </div>
    </div>
  );
};

export default StatCard;