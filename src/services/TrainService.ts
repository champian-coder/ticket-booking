import { Train } from '../models/Train';
import * as fs from 'fs';
import * as path from 'path';

export class TrainService {
  private trains: Train[];

  constructor() {
    this.trains = this.loadTrains();
  }

  private loadTrains(): Train[] {
    const filePath = path.resolve(__dirname, '../data/trains.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as Train[];
  }

  getTrainsBetweenStations(start: string, end: string): Train[] {
    return this.trains.filter(train => train.source === start && train.destination === end);
  }

  updateSeatAvailability(trainno: string, seatType: "SL" | "3A" | "2A" | "1A", newAvailability: number): string {
    const train = this.trains.find(t => t.trainId === trainno);
    if (!train) {
      return "Train not found";
    }
    if (train.seats[seatType]) {
      train.seats[seatType].available = newAvailability;
      return `Seat availability for ${seatType} updated to ${newAvailability}`;
    }
    return "Seat type not available for this train";
  }

  getTrainByTrainno(trainno: string): Train | undefined {
    return this.trains.find(train => train.trainId === trainno);
  }

  displayTrains(): void {
    this.trains.forEach(train => {
      console.log(`Train Name: ${train.name} (${train.trainId})`);
      console.log(`Route: ${train.source} to ${train.destination}`);
      console.log("Seats:");
      for (let seatType in train.seats) {
        const seat = train.seats[seatType as keyof Train['seats']];
        if (seat) {
          console.log(`  ${seatType}: Available: ${seat.available}, Price: ₹${seat.Rate}`);
        }
      }
      console.log('--------------------------------------');
    });
  }
}
