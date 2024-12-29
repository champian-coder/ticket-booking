
import { AuthService } from "../services/AuthService";
import { User } from "../models/User";

export class AuthHandler {
    private authService = new AuthService();

    register(name: string, email: string, password: string): User {
        return this.authService.register(name, email, password);
    }

    login(email: string, password: string): User | null {
        return this.authService.login(email, password);
    }
}
