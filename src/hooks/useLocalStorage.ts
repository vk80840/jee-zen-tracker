import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

export interface DailyEntry {
  id: string;
  date: string;
  goals: string[];
  physics: { questions: number; target: number; topics: string[] };
  chemistry: { questions: number; target: number; topics: string[] };
  mathematics: { questions: number; target: number; topics: string[] };
  studyHours: number;
  lectures: { subject: string; topic: string }[];
  backlog: string[];
  completed: boolean;
  notes?: string;
}

export interface UserProfile {
  name: string;
  jeeYear: number;
  books: string[];
  streak: number;
  totalDays: number;
}

export interface AppData {
  profile: UserProfile;
  entries: DailyEntry[];
  settings: {
    theme: 'light' | 'dark';
    reminderTime?: string;
  };
}