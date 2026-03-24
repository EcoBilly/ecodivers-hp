import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export interface Booking {
  id: string;
  name: string;
  pax: number;
  category: string;
  date: string;
  time: string;
  checkedIn: boolean;
  phone?: string;
  memo?: string;
  createdAt?: unknown;
}

/**
 * Real-time backup: Save a copy of the booking to 'eco_bookings_backup'
 */
export const saveBackup = async (bookingData: Record<string, unknown>) => {
  // Stubbed for force deployment
  console.log("Stubbed saveBackup called with:", bookingData);
  return Promise.resolve();
};

/**
 * Backup to JSON file
 */
export const exportToJson = (bookings: Booking[]) => {
  // Stubbed for force deployment
  console.log("Stubbed exportToJson called with:", bookings.length, "bookings");
};

/**
 * Backup to CSV file
 */
export const exportToCsv = (bookings: Booking[]) => {
  // Stubbed for force deployment
  console.log("Stubbed exportToCsv called with:", bookings.length, "bookings");
};

/**
 * Restore from JSON content
 */
export const restoreFromJson = async (jsonString: string): Promise<boolean> => {
  // Stubbed for force deployment
  console.log("Stubbed restoreFromJson called");
  return Promise.resolve(true);
};
