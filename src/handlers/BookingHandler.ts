import * as readlineSync from "readline-sync";
import { BookingService } from "../services/BookingService";
import { TrainHandler } from "./TrainHandler";
import { Train } from "../models/Train";

export class BookingHandler {
    private bookingService: BookingService;
    private trainHandler: TrainHandler;

    constructor(bookingService: BookingService, trainHandler: TrainHandler) {
        this.bookingService = bookingService;
        this.trainHandler = trainHandler;
    }

    // Function to search for trains and handle booking
    searchAndBookTrain(loggedInUser: any): void {
        const src = readlineSync.question("Enter source station: ");
        const dest = readlineSync.question("Enter destination station: ");

        // Get trains between stations
        this.trainHandler.handleGetTrainsBetweenStations(src, dest);

        const trainNumber = readlineSync.question("Enter the train number to book: ");
        const selectedTrain = this.trainHandler.handleGetTrainByTrainno(trainNumber);

        if (!selectedTrain) {
            console.log("Train not found.");
            return;
        }

        const validClasses = Object.keys(selectedTrain.seats) as Array<keyof typeof selectedTrain.seats>;

        const travelClass = readlineSync.question(
            `Enter class (${validClasses.join(", ")}): `
        );

        if (!validClasses.includes(travelClass as keyof typeof selectedTrain.seats)) {
            console.log("Invalid class.");
            return;
        }

        const selectedSeat = selectedTrain.seats[travelClass as keyof typeof selectedTrain.seats];

        if (!selectedSeat) {
            console.log(`Seat type ${travelClass} is not available.`);
            return;
        }

        if (selectedSeat.available <= 0) {
            console.log(`No seats available in ${travelClass}.`);
            return;
        }

        console.log(`Selected class: ${travelClass}`);
        console.log("Seat availability:", selectedSeat.available);

        const passengers: Array<{ name: string; age: number }> = [];
        while (true) {
            const passengerName = readlineSync.question("Enter passenger name: ");
            const passengerAge = readlineSync.questionInt("Enter passenger age: ");
            passengers.push({ name: passengerName, age: passengerAge });

            const addMore = readlineSync.question("Add another passenger? (yes/no): ");
            if (addMore.toLowerCase() !== "yes") break;
        }

        // Calculate total charge
        const totalCharge = this.bookingService.calculateTotalCharge(passengers, selectedSeat.Rate);

        const ticket = {
            pnr: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
            userId: loggedInUser.userId,
            trainNumber: selectedTrain.trainId,
            trainName: selectedTrain.name,
            travelClass,
            passengers,
            totalCharge,
            status: "Confirmed",
        };

        // Reduce seat availability
        this.bookingService.reduceSeatAvailability(selectedSeat, passengers.length);

        // Save the ticket
        this.bookingService.saveTicket(ticket);

        console.log("Ticket booked successfully:", ticket);
    }

    // Function to display booking history with passenger details
    showBookingHistory(loggedInUser: any): void {
        if (!loggedInUser) {
            console.log("Please log in to view booking history.");
            return;
        }

        const userBookings = this.bookingService.getBookingHistory(loggedInUser.userId);

        if (userBookings.length === 0) {
            console.log("No booking history found.");
        } else {
            console.log("\nBooking History:");
            userBookings.forEach((ticket: any) => {
                console.log(ticket);
                //console.log(`PNR: ${ticket.pnr}, Train: ${ticket.trainName}, Class: ${ticket.travelClass}, Status: ${ticket.status}`);
                // ticket.passengers.forEach((passenger: any) => {
                //     console.log(`  Passenger: ${passenger.name}, Age: ${passenger.age}`);
                // });
            });

            // Ask if the user wants to cancel a ticket
            const cancelChoice = readlineSync.question("Do you want to cancel a ticket? (yes/no): ");
            if (cancelChoice.toLowerCase() === "yes") {
                const pnrToCancel = readlineSync.question("Enter PNR to cancel: ");
                const success = this.bookingService.cancelTicket(pnrToCancel);

                if (success) {
                    console.log("Ticket cancelled successfully.");
                } else {
                    console.log("Ticket cancellation failed.");
                }
            }
        }
    }
}
