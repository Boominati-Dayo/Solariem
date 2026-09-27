// Simplified minimal user shape for admin utilities
export type MinimalUser = {
  isAdmin?: boolean;
  isActive?: boolean;
  emailVerified?: boolean;
} | null;

/**
 * Check if a user has admin privileges
 * @param user - Minimal user object
 * @returns boolean - true if user is admin, false otherwise
 */
export const isAdmin = (user: MinimalUser): boolean => {
  return user?.isAdmin === true;
};

/**
 * Check if a user account is active
 * @param user - Minimal user object
 * @returns boolean - true if user is active, false otherwise
 */
export const isActiveUser = (user: MinimalUser): boolean => {
  return user?.isActive !== false; // Default to true if not set
};

/**
 * Check if a user can access admin features
 * @param user - Minimal user object
 * @returns boolean - true if user can access admin features
 */
export const canAccessAdmin = (user: MinimalUser): boolean => {
  return isAdmin(user) && isActiveUser(user);
};

/**
 * Get user role display name
 * @param user - Minimal user object
 * @returns string - User role display name
 */
export const getUserRole = (user: MinimalUser): string => {
  if (!user) return 'Guest';
  if (isAdmin(user)) return 'Admin';
  return 'Investor';
};

/**
 * Check if user needs email verification
 * @param user - Minimal user object
 * @returns boolean - true if email verification is needed
 */
export const needsEmailVerification = (user: MinimalUser): boolean => {
  return user?.emailVerified === false;
};

/**
 * Check if user can move money
 * @param user - Minimal user object
 * @returns boolean - true if the account is usable for money movement
 */
export const canTransact = (user: MinimalUser): boolean => {
  return isActiveUser(user) && !needsEmailVerification(user);
};





