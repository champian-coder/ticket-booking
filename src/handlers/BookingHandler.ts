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
        const train=this.trainHandler.handleGetTrainsBetweenStations(src, dest);
        console.log("Trains between", src, "and", src, ":");
        
        if (train != null && train.length > 0) {
          // If the train array exists and is not empty, loop through each train
          train.forEach((trainObj) => {
            console.log(`Train No: ${trainObj.trainId}`);
            console.log(`Train Name: ${trainObj.name}`);
            console.log(`Seats:`);

            // Iterate through the seats object and log availability and price
            for (let seatType in trainObj.seats) {
              const seat =
                trainObj.seats[seatType as keyof typeof trainObj.seats];
                if (seat !== undefined) {
                    console.log(`  ${seatType}: Available: ${seat.available}, Price: ₹${seat.Rate}`);
                  } else {
                    console.log(`  ${seatType}: No data available`);
                  }
            }
            console.log("----------------------------------"); // To separate trains in the log
          });
        }else{
            console.log("No trains between", src, "and", src);
            //const dest = readlineSync.question("");
            return;
        }
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
        const seatType: "SL" | "3A" | "2A" | "1A" = travelClass.toUpperCase() as "SL" | "3A" | "2A" | "1A";
        if (!validClasses.includes(seatType as keyof typeof selectedTrain.seats)) {
            console.log("Invalid class.");
            return;
        }

        const selectedSeat = selectedTrain.seats[seatType as keyof typeof selectedTrain.seats];

        if (!selectedSeat) {
            console.log(`Seat type ${seatType} is not available.`);
            return;
        }

        if (selectedSeat.available <= 0) {
            console.log(`No seats available in ${seatType}.`);
            return;
        }

        console.log(`Selected class: ${seatType}`);
        console.log("Seat availability:", selectedSeat.available);
        console.log("Seat Price:", selectedSeat.Rate);
        const passengers: Array<{ name: string; age: number; status: string }> = [];
        while (true) {
            const passengerName = readlineSync.question("Enter passenger name: ");
            const passengerAge = readlineSync.questionInt("Enter passenger age: ");
            let passengerStatus="CNF"
            if(selectedSeat.available<=passengers.length){
                passengerStatus="WL"+(selectedSeat.available-passengers.length+1);
            }
            passengers.push({ name: passengerName, age: passengerAge, status: passengerStatus});
            
            const addMore = readlineSync.question("Add another passenger? (yes/no): ");
            if (addMore.toLowerCase() !== "yes") break;
        }
        let ticketStatus="Confirmed";
        if(selectedSeat.available<passengers.length){
            ticketStatus="WaitListed";
        }
        // Calculate total charge
        const totalCharge = this.bookingService.calculateTotalCharge(passengers, selectedSeat.Rate);

        const ticket = {
            pnr: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
            userId: loggedInUser.userId,
            trainNumber: selectedTrain.trainId,
            trainName: selectedTrain.name,
            travelClass:seatType,
            passengers,
            NoofPassanger: passengers.length,
            totalCharge,
            status: ticketStatus,
        };
        // Reduce seat availability
        this.trainHandler.handleUpdateSeatAvailability(selectedTrain.trainId,seatType, passengers.length);

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
                this.bookingService.cancelTicket(pnrToCancel);

            }
        }
    }
}
