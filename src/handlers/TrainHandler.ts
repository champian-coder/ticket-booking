import { TrainService } from '../services/TrainService';

export class TrainHandler {
  private trainService: TrainService;

  constructor(trainService: TrainService) {
    this.trainService = trainService;
  }

  handleGetTrainsBetweenStations(start: string, end: string) {
    return this.trainService.getTrainsBetweenStations(start, end);  
  }

  handleUpdateSeatAvailability(trainno: string, seatType: "SL" | "3A" | "2A" | "1A", booked: number) {
    console.log(this.trainService.updateSeatAvailability(trainno, seatType, booked));
  }

  handleGetTrainByTrainno(trainno: string) {
    const train = this.trainService.getTrainByTrainno(trainno);
    console.log("Details of train", trainno, ":");
    console.log(train);
    return train;
  }

  handleDisplayTrains() {
    this.trainService.displayTrains();
  }
}
