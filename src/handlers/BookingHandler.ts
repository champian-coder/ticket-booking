
import { BookingService } from "../services/BookingService";

export class BookingHandler {
    private bookingService = new BookingService();

    bookTicket(userId: string, trainId: string, passengers: string[], fare: number): void {
        this.bookingService.bookTicket(userId, trainId, passengers, fare);
    }
}
