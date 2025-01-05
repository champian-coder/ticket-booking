import * as readlineSync from "readline-sync";
import { AuthHandler } from "./handlers/AuthHandler";
import { TrainHandler } from "./handlers/TrainHandler";
import { TrainService } from "./services/TrainService";
import { BookingService } from "./services/BookingService";
import { BookingHandler } from "./handlers/BookingHandler";
import {getErrorMessage} from './utils/AppUtil';
// Initialize the handlers and services
const authHandler = new AuthHandler();
const trainService = new TrainService();
const trainHandler = new TrainHandler(trainService);
const bookingService = new BookingService();
const bookingHandler = new BookingHandler(bookingService, trainHandler);

let loggedInUser: any = null;

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

// Function to handle post-login actions
function postLoginMenu(): void {
    let loggedIn = true;

    while (loggedIn) {
        try {
            console.log("\nPost-login Menu:");
            console.log("1. Search and Book Train");
            console.log("2. Booking History");
            console.log("3. Logout");

            const choice = readlineSync.question("Enter your choice: ");

            switch (choice) {
                case "1":
                    bookingHandler.searchAndBookTrain(loggedInUser);
                    break;
                case "2":
                    bookingHandler.showBookingHistory(loggedInUser);
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

// Main application loop
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



// Start the application
try {
    main();
} catch (error: unknown) {
    console.error("Critical error occurred. Exiting application:", getErrorMessage(error));
}
