
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE'
}

export enum ActivityLevel {
  SEDENTARY = 'SEDENTARY',
  LIGHTLY_ACTIVE = 'LIGHTLY_ACTIVE',
  MODERATELY_ACTIVE = 'MODERATELY_ACTIVE',
  VERY_ACTIVE = 'VERY_ACTIVE',
  EXTRA_ACTIVE = 'EXTRA_ACTIVE'
}

export type Mood = 'HAPPY' | 'SAD' | 'ANGRY' | 'BORED' | null;

export interface UserProfile {
  name: string;
  avatar?: string;
  age: number;
  gender: Gender;
  height: number; // cm
  weight: number; // kg
  targetWeight: number; // kg
  startDate: string;
  activityLevel: ActivityLevel;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  isOnboarded: boolean;
}

export interface FoodItem {
  id?: string;
  name: string;
  unit: string;
  quantity: number;
  calories: number;
  caloriesPerUnit?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  image?: string; // Base64 of the specific food image
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  items: FoodItem[];
  totalCaloriesIn: number;
  mood: Mood;
}

export interface AppState {
  user: UserProfile;
  logs: Record<string, DailyLog>;
  selectedDate: string;
}

export enum View {
  ONBOARDING = 'ONBOARDING',
  MAIN = 'MAIN',
  LOG_FOOD = 'LOG_FOOD'
}

export enum Tab {
  DASHBOARD = 'DASHBOARD',
  CALENDAR = 'CALENDAR',
  PROFILE = 'PROFILE'
}
