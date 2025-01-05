import { Train } from '../models/Train';
import { FileUtil } from "../utils/AppUtil";
import * as path from "path";

export class TrainService {
  private trains: Train[];
  public filePath = path.resolve(__dirname, '../data/trains.json');
  constructor() {
    this.trains = this.loadTrains();
  }

  private loadTrains(): Train[] {
    
    const data = FileUtil.readFile(this.filePath);
    //console.log(data);
    return data as Train[];
  }

  getTrainsBetweenStations(start: string, end: string): Train[] {
    const train = this.trains.filter(train => 
      train.source.toLowerCase() === start.toLowerCase() && 
      train.destination.toLowerCase() === end.toLowerCase()
    );
    return train;
  }

  updateSeatAvailability(trainno: string, seatType: "SL" | "3A" | "2A" | "1A", booked: number): string {
    const train = this.trains.find(t => t.trainId === trainno);
    if (!train) {
      return "Train not found";
    }
    if (train.seats[seatType]) {
      train.seats[seatType].available = train.seats[seatType].available-booked;
      this.saveTrainData();
    }
    
    return "Seat type not available for this train";
  }

  private saveTrainData(): void {
    // Ensure that the trains array is correctly formatted and not empty
    if (this.trains && this.trains.length > 0) {
      FileUtil.writeFile(this.filePath, JSON.stringify(this.trains, null, 2));
    } else {
      console.error("No train data to write to the file.");
    }
  }

  getTrainByTrainno(trainno: string): Train | undefined {
    const train=this.trains.find(train => train.trainId === trainno);
    return train;
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
