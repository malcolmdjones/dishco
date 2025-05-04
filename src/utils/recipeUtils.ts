
/**
 * Gets the image URL for a recipe, with fallback to a type-based default image
 */
export const getRecipeImage = (imageUrl: string | null | undefined): string => {
  if (imageUrl && imageUrl.trim() !== '') {
    return imageUrl;
  }
  
  // Default image based on recipe type
  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c';
};

/**
 * Get the appropriate image for a recipe type
 */
export const getTypeBasedImage = (type: string | null | undefined): string => {
  if (!type) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c';
  
  const typeMap: Record<string, string> = {
    'breakfast': 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666',
    'lunch': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
    'dinner': 'https://images.unsplash.com/photo-1564834733143-6701a4b8fec9',
    'snack': 'https://images.unsplash.com/photo-1599642080669-0db91ed448fc',
    'dessert': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb'
  };
  
  return typeMap[type.toLowerCase()] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c';
};
