
import { User } from "../models/User";
import { FileUtil } from "../utils/AppUtil";
import * as path from "path";

export class AuthService {
    private usersFile = path.join(__dirname, "../data/users.json");

    private readUsers(): User[] {
        let users: User[];
        try {
            users = FileUtil.readFile(this.usersFile);
        } catch (error) {
            console.error("Failed to read users:", error);
            users = [];
        }
        return users;
    }

    private writeUsers(users: User[]): void {
        try {
            FileUtil.writeFile(this.usersFile, JSON.stringify(users, null, 2));
        } catch (error) {
            console.error("Failed to write users:", error);
        }
    }

    register(name: string, email: string, password: string): User {
        let newUser: User;
        try {
            const users = this.readUsers();
            const userId = (users.length + 1).toString();
            newUser = new User(userId, name, email, password);
            users.push(newUser);
            this.writeUsers(users);
        } catch (error) {
            console.error("Registration failed:", error);
            throw error;
        }
        return newUser;
    }

    login(email: string, password: string): User | null {
        let loggedInUser: User | null = null;
        try {
            const users = this.readUsers();
            loggedInUser = users.find(
                user => user.email === email && user.password === password
            ) || null;
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
        return loggedInUser;
    }
}

