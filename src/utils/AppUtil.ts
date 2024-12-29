
import * as fs from "fs";

export class FileUtil {
    static readFile(filePath: string): any {
        try {
            const data = fs.readFileSync(filePath, "utf-8");
            return JSON.parse(data);
        } catch (error) {
            console.error(`Error reading file from ${filePath}:`, error);
            throw error;
        }
    }

    static writeFile(filePath: string, data: any): void {
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error(`Error writing file to ${filePath}:`, error);
            throw error;
        }
    }
}
export function printHeader() {
    console.log("Welcome to the Ticket Booking System");
}
