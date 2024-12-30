import * as fs from "fs";
import * as path from "path";
import * as dotenv from 'dotenv';
dotenv.config();
const ticketsFile = path.join(__dirname, "../data/bookings.json");

export class BookingService {
    // Function to save the ticket details to a file
    saveTicket(ticket: object): void {
        let tickets = [];
        try {
            if (fs.existsSync(ticketsFile)) {
                tickets = JSON.parse(fs.readFileSync(ticketsFile, "utf8"));
            }
        } catch (error) {
            console.error("Failed to read tickets file:", error);
        }

        tickets.push(ticket);

        try {
            fs.writeFileSync(ticketsFile, JSON.stringify(tickets, null, 4));
        } catch (error) {
            console.error("Failed to save ticket:", error);
        }
    }

    // Function to calculate the total charge based on passengers and seat rate
    calculateTotalCharge(passengers: Array<{ name: string; age: number }>, rate: number): number {
        // Load the service charge and GST from the environment
        const serviceCharge = parseFloat(process.env.SERVICE_CHARGE || "0");
        const gst = parseFloat(process.env.GST || "0");
    
        // Calculate base total charge
        const total = passengers.length * rate;
    
        // Add service charge
        const totalWithServiceCharge = total + serviceCharge;
    
        // Add GST on the total with service charge
        const totalWithGST = totalWithServiceCharge * (1 + gst / 100);
    
        return totalWithGST;
    }

    // Function to reduce seat availability
    reduceSeatAvailability(selectedSeat: { available: number }, numberOfPassengers: number): void {
        selectedSeat.available -= numberOfPassengers;
    }

    // Function to fetch booking history for a specific user
    getBookingHistory(userId: string): any[] {
        try {
            if (fs.existsSync(ticketsFile)) {
                const tickets = JSON.parse(fs.readFileSync(ticketsFile, "utf8"));
                return tickets.filter((ticket: any) => ticket.userId === userId);
            }
        } catch (error) {
            console.error("Failed to fetch booking history:", error);
        }
        return [];
    }

    // Function to cancel a ticket by PNR
    cancelTicket(pnr: string): boolean {
        try {
            if (fs.existsSync(ticketsFile)) {
                let tickets = JSON.parse(fs.readFileSync(ticketsFile, "utf8"));
                const ticketIndex = tickets.findIndex((ticket: any) => ticket.pnr === pnr);
    
                if (ticketIndex !== -1) {
                    const ticket = tickets[ticketIndex];
                    // Update seat availability before changing the ticket status
                    // const trainSeats = ticket.train.seats;
                    // const seatType = ticket.travelClass as keyof typeof trainSeats;
                    // const selectedSeat = trainSeats[seatType];
    
                    // if (selectedSeat) {
                    //     selectedSeat.available += ticket.passengers.length;
                    //     console.log(`Seats for class ${ticket.travelClass} restored.`);
                    // }
    
                    // Change the ticket status to 'Cancelled'
                    ticket.status = "Cancelled";
    
                    // Save the updated tickets back to the file
                    tickets[ticketIndex] = ticket;  // Update the ticket status in the array
                    fs.writeFileSync(ticketsFile, JSON.stringify(tickets, null, 4));
    
                    console.log("Ticket cancelled successfully.");
                    return true;
                }
            }
        } catch (error) {
            console.error("Error cancelling ticket:", error);
        }
        console.log("Ticket not found.");
        return false;
    }
    
}
