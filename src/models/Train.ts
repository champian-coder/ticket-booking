import { SeatType } from './seatType';

export interface Train {
  trainId: string;
  name: string;
  source: string;
  destination: string;
  seats: {
    SL: SeatType;
    "3A": SeatType;
    "2A"?: SeatType;  // Optional seat type
    "1A"?: SeatType;  // Optional seat type
  };
}
