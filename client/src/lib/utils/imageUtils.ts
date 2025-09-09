/**
 * Utility functions for handling image paths
 */

/**
 * Resolves an image path to ensure it works correctly in both development and production environments
 * @param path The image path to resolve
 * @returns The resolved image path
 */
export const resolveImagePath = (path: string): string => {
  // If the path is already a full URL, return it as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // For local images, ensure they start with a slash
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }
  
  return path;
};
