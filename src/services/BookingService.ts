import { FileUtil } from "../utils/AppUtil";
import * as path from "path";
import * as dotenv from 'dotenv';
import { TrainService } from "./TrainService";
dotenv.config();
const ticketsFile = path.join(__dirname, "../data/bookings.json");

export class BookingService {
    // Function to save the ticket details to a file
    saveTicket(ticket: object): void {
        let tickets = [];
        try {
            tickets = FileUtil.readFile(ticketsFile);
        } catch (error) {
            console.error("Failed to read tickets file:", error);
        }

        tickets.push(ticket);

        try {
            FileUtil.writeFile(ticketsFile, JSON.stringify(tickets, null, 4));
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

    // Function to fetch booking history for a specific user
    getBookingHistory(userId: string): any[] {
        try {
            const tickets = FileUtil.readFile(ticketsFile);
            return tickets.filter((ticket: any) => ticket.userId === userId);
        } catch (error) {
            console.error("Failed to fetch booking history:", error);
        }
        return [];
    }

    // Function to cancel a ticket by PNR
    cancelTicket(pnr: string): boolean {
        try {
                let tickets =FileUtil.readFile(ticketsFile,);
                const ticketIndex = tickets.findIndex((ticket: any) => ticket.pnr === pnr);
    
                if (ticketIndex !== -1) {
                  const ticket = tickets[ticketIndex];
                  
                  if (ticket.status != "Cancelled") {
                    // Save the updated tickets back to the file
                    ticket.status = "Cancelled";
                    tickets[ticketIndex] = ticket; // Update the ticket status in the array
                    FileUtil.writeFile(
                      ticketsFile,
                      JSON.stringify(tickets, null, 4)
                    );
                    const trainService = new TrainService();
                    trainService.updateSeatAvailability(
                      ticket.trainNumber,
                      ticket.travelClass,
                      ticket.passengers.length * -1
                    );
                    console.log("Ticket cancelled successfully.");
                    return true;
                  }
                  else{
                    console.log("Ticket is already cancelled can't be done again.");
                    return false;
                  }
                
                }
        } catch (error) {
            console.error("Error cancelling ticket:", error);
        }
        console.log("Ticket not found.");
        return false;
    }
    
}
