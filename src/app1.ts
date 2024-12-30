import * as readlineSync from "readline-sync";
import { AuthHandler } from "./handlers/AuthHandler";
import * as fs from "fs";
import * as path from "path";
import { User } from "./models/User";
import { TrainHandler } from "./handlers/TrainHandler";
import { TrainService } from "./services/TrainService";

// Initialize the AuthHandler
const authHandler = new AuthHandler();
const trainService = new TrainService();
const trainHandler = new TrainHandler(trainService);
let loggedInUser: User | null = null;
const ticketsFile = path.join(__dirname, "./data/bookings.json");

// Function to display the main menu
function mainMenu(): string {
    console.log("\nMain Menu:");
    console.log("1. Register");
    console.log("2. Login");
    console.log("3. Exit");

    const choice = readlineSync.question("Enter your choice: ");
    return choice;
}

// Function to handle user registration
function register(): void {
    try {
        const name = readlineSync.question("Enter name: ");
        const email = readlineSync.question("Enter email: ");
        const password = readlineSync.question("Enter password: ");
        const user = authHandler.register(name, email, password);
        console.log("User registered successfully:", user);
    } catch (error: unknown) {
        console.error("An error occurred during registration:", getErrorMessage(error));
    }
}

// Function to handle user login
function login(): void {
    try {
        const email = readlineSync.question("Enter email: ");
        const password = readlineSync.question("Enter password: ");
        const user = authHandler.login(email, password);

        if (user) {
            console.log("Login successful:", user);
            loggedInUser = user;
            postLoginMenu();
        } else {
            console.log("Invalid credentials.");
        }
    } catch (error: unknown) {
        console.error("An error occurred during login:", getErrorMessage(error));
    }
}

// Function to search for trains and book tickets
function searchTrain(): void {
    if (!loggedInUser) {
        console.log("Please log in to search for trains.");
        return;
    }

    const src = readlineSync.question("Enter source station: ");
    const dest = readlineSync.question("Enter destination station: ");

    // Get trains between stations using TrainHandler
    trainHandler.handleGetTrainsBetweenStations(src, dest);

    const trainNumber = readlineSync.question("Enter the train number to book: ");
    const selectedTrain = trainHandler.handleGetTrainByTrainno(trainNumber);

    if (!selectedTrain) {
        console.log("Train not found.");
        return;
    }

    // Extract valid seat classes from the selected train
    const validClasses = Object.keys(selectedTrain.seats) as Array<keyof typeof selectedTrain.seats>;

    // Ask the user to enter a valid travel class
    const travelClass = readlineSync.question(
        `Enter class (${validClasses.join(", ")}): `
    );

    // Validate the user input and ensure it's a valid seat class
    if (!validClasses.includes(travelClass as keyof typeof selectedTrain.seats)) {
        console.log("Invalid class.");
        return;
    }

    // Safely access the selected seat class details
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

    const totalCharge = passengers.length * selectedSeat.Rate;

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
    selectedSeat.available -= passengers.length;

    // Save the ticket to a file
    saveTicket(ticket);

    console.log("Ticket booked successfully:", ticket);
}


// Function to save ticket details to a file
function saveTicket(ticket: object): void {
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

// Function to handle post-login actions
function postLoginMenu(): void {
    let loggedIn = true;

    while (loggedIn) {
        try {
            console.log("\nPost-login Menu:");
            console.log("1. Search Train");
            console.log("2. Booking History");
            console.log("3. Logout");

            const choice = readlineSync.question("Enter your choice: ");

            switch (choice) {
                case "1":
                    searchTrain();
                    break;
                case "2":
                    console.log("Fetching booking history...");
                    showBookingHistory();
                    break;
                case "3":
                    console.log("Logging out...");
                    loggedInUser = null;
                    loggedIn = false;
                    break;
                default:
                    console.log("Invalid choice, please try again.");
            }
        } catch (error: unknown) {
            console.error("An error occurred in the post-login menu:", getErrorMessage(error));
        }
    }
}

// Function to show booking history for the logged-in user
function showBookingHistory(): void {
    if (!loggedInUser) {
        console.log("Please log in to view booking history.");
        return;
    }

    try {
        if (!fs.existsSync(ticketsFile)) {
            console.log("No tickets found.");
            return;
        }

        const tickets = JSON.parse(fs.readFileSync(ticketsFile, "utf8"));
        const userTickets = tickets.filter((ticket: any) => ticket.userId === loggedInUser?.userId);

        if (userTickets.length === 0) {
            console.log("No booking history found.");
        } else {
            console.log("\nBooking History:");
            userTickets.forEach((ticket: any) => console.log(ticket));
        }
    } catch (error) {
        console.error("Failed to fetch booking history:", error);
    }
}
// Define main() function
function main(): void {
    let isRunning = true;

    while (isRunning) {
        try {
            const choice = mainMenu();

            switch (choice) {
                case "1":
                    register();
                    break;
                case "2":
                    login();
                    break;
                case "3":
                    console.log("Exiting application...");
                    isRunning = false;
                    break;
                default:
                    console.log("Invalid choice, please try again.");
            }
        } catch (error: unknown) {
            console.error("An unexpected error occurred in the main loop:", getErrorMessage(error));
        }
    }
}
// Helper function to safely extract error messages
function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}

// Start the application
try {
    main();
} catch (error: unknown) {
    console.error("Critical error occurred. Exiting application:", getErrorMessage(error));
}
