import { storageService } from '@/services/storage.service';

const USERS_KEY = 'sp_users';
const CURRENT_USER_KEY = 'sp_current_user';

export const AuthService = {
    // Check Email Exists
    checkEmailExists(email) {
        const users = storageService.get(USERS_KEY) || [];
        return users.some(user => user.email === email);
    },

    // Register User
    async register(userData) {
        return new Promise((resolve, reject) => {
            // Simulated network latency
            setTimeout(() => {
                const users = storageService.get(USERS_KEY) || [];
                
                if (AuthService.checkEmailExists(userData.email)) {
                    return reject(new Error('Email already exists.'));
                }

                // In a realistic environment you'd hash the password here.
                const newUser = {
                    id: Date.now().toString(),
                    fullName: userData.fullName,
                    email: userData.email,
                    password: userData.password,
                    createdAt: new Date().toISOString()
                };

                users.push(newUser);
                storageService.set(USERS_KEY, users);
                
                const { password, ...userWithoutPassword } = newUser;
                
                AuthService.saveCurrentUser(userWithoutPassword);
                resolve(userWithoutPassword);
            }, 500); 
        });
    },

    // Login
    async login(credentials) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const users = storageService.get(USERS_KEY) || [];
                const user = users.find(u => u.email === credentials.email && u.password === credentials.password);
                
                if (!user) {
                    return reject(new Error('Invalid email or password.'));
                }
                
                const { password, ...userWithoutPassword } = user;
                
                AuthService.saveCurrentUser(userWithoutPassword);
                resolve(userWithoutPassword);
            }, 500);
        });
    },

    // Persist Session & Save Current User
    saveCurrentUser(user) {
        if (user) {
            storageService.set(CURRENT_USER_KEY, user);
        } else {
            storageService.remove(CURRENT_USER_KEY);
        }
    },

    // Get Current User
    getCurrentUser() {
        return storageService.get(CURRENT_USER_KEY);
    },

    // Update Profile
    async updateProfile(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const currentUser = storageService.get(CURRENT_USER_KEY);
                if (!currentUser) return reject(new Error('No authenticated user.'));

                const users = storageService.get(USERS_KEY) || [];
                const idx = users.findIndex(u => u.id === currentUser.id);
                if (idx === -1) return reject(new Error('User not found.'));

                // Only allow safe fields to be updated
                const allowedFields = ['fullName'];
                const updates = {};
                for (const key of allowedFields) {
                    if (data[key] !== undefined) updates[key] = data[key];
                }

                users[idx] = { ...users[idx], ...updates };
                storageService.set(USERS_KEY, users);

                const { password, ...updatedUser } = users[idx];
                storageService.set(CURRENT_USER_KEY, updatedUser);

                resolve(updatedUser);
            }, 400);
        });
    },

    // Change Password
    async changePassword(currentPassword, newPassword) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const currentUser = storageService.get(CURRENT_USER_KEY);
                if (!currentUser) return reject(new Error('No authenticated user.'));

                const users = storageService.get(USERS_KEY) || [];
                const idx = users.findIndex(u => u.id === currentUser.id);
                if (idx === -1) return reject(new Error('User not found.'));

                if (users[idx].password !== currentPassword) {
                    return reject(new Error('Current password is incorrect.'));
                }

                users[idx] = { ...users[idx], password: newPassword };
                storageService.set(USERS_KEY, users);

                resolve();
            }, 400);
        });
    },

    // Logout
    async logout() {
        return new Promise(resolve => {
            setTimeout(() => {
                storageService.remove(CURRENT_USER_KEY);
                resolve();
            }, 200);
        });
    }
};
