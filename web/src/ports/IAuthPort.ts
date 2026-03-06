import { User } from "../domain/entities/User";

export interface IAuthPort {
    signUp(email: string, password: string): Promise<User>;
    login(email: string, password: string): Promise<User>;
    logout(): Promise<void>;
    getToken(): Promise<string | null>;
    getCurrentUser(): User | null;
    onAuthStateChanged(callback: (user: User | null) => void): () => void;
}