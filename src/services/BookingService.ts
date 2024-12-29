
import { Booking } from "../models/Booking";
import * as fs from "fs";
import * as path from "path";

export class BookingService {
    private bookingsFile = path.join(__dirname, "../data/bookings.json");

    private readBookings(): Booking[] {
        const data = fs.readFileSync(this.bookingsFile, "utf-8");
        return JSON.parse(data);
    }

    private writeBookings(bookings: Booking[]): void {
        fs.writeFileSync(this.bookingsFile, JSON.stringify(bookings, null, 2));
    }

    bookTicket(userId: string, trainId: string, passengers: string[], fare: number): void {
        const bookings = this.readBookings();
        const totalFare = fare * passengers.length;
        const booking = new Booking(userId, trainId, passengers, totalFare);
        bookings.push(booking);
        this.writeBookings(bookings);
    }
}
