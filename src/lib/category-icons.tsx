import {
  Baby,
  BookOpen,
  Briefcase,
  Car,
  HeartPulse,
  PawPrint,
  Sparkles,
  SprayCan,
  UtensilsCrossed,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  beauty: Sparkles,
  food: UtensilsCrossed,
  repair: Wrench,
  cleaning: SprayCan,
  childcare: Baby,
  pets: PawPrint,
  education: BookOpen,
  transport: Car,
  health: HeartPulse,
  other: Briefcase,
};
