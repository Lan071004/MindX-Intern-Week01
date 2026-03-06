import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged as firebaseOnAuthStateChanged } from 'firebase/auth';
import { User } from './../../../domain/entities/User';
import { mapFirebaseError } from '@/domain/errors/AuthError';
import { AuthError as FirebaseAuthError } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { IAuthPort } from '@/ports/IAuthPort';

export class FirebaseAuthAdapter implements IAuthPort {

    async signUp(email: string, password: string): Promise<User> {
        try {
            const credential = await createUserWithEmailAndPassword(auth, email, password);
            return {
                uid: credential.user.uid,
                email: credential.user.email || '',
                displayName: credential.user.displayName,
            };
        } catch (error) {
            throw mapFirebaseError((error as FirebaseAuthError).code);
            }
        }


    async login(email: string, password: string): Promise<User> {
        try {
            const credential = await signInWithEmailAndPassword(auth, email, password);
            return {
                uid: credential.user.uid,
                email: credential.user.email || '',
                displayName: credential.user.displayName,
            };
        } catch (error) {
            throw mapFirebaseError((error as FirebaseAuthError).code);
        }
    }


    async logout(): Promise<void> {
        try {
            await signOut(auth);
        } catch {
            throw new Error('Failed to logout');
        }
    }


    async getToken(): Promise<string | null> {
        const user = auth.currentUser;
        if (!user) return null;
        try {
            return await user.getIdToken();
        } catch {
            return null;
        }
    }


    getCurrentUser(): User | null {
        const user = auth.currentUser;
        if (!user) return null;
        return {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName,
        };
    }

    
    onAuthStateChanged(callback: (user: User | null) => void): () => void {
        return firebaseOnAuthStateChanged(auth, (firebaseUser) => {
            if(!firebaseUser) return callback(null);
            callback({
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName,
            });
        });
    }
}