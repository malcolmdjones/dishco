
// Helper function to get recipe image url with fallback
export const getRecipeImage = (imageUrl?: string): string => {
  // If image URL starts with 'http', it's a valid URL
  if (imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('/'))) {
    return imageUrl;
  }
  
  // Default image if no valid URL is provided
  return '/images/recipe-placeholder.jpg';
};

// Helper function to get type-based image for recipe types
export const getTypeBasedImage = (type?: string): string => {
  if (!type) return '/images/recipe-placeholder.jpg';
  
  switch (type.toLowerCase()) {
    case 'breakfast':
      return '/images/breakfast.jpg';
    case 'lunch':
      return '/images/lunch.jpg';  
    case 'dinner':
      return '/images/dinner.jpg';
    case 'snack':
      return '/images/snack.jpg';
    case 'dessert':
      return '/images/dessert.jpg';
    default:
      return '/images/recipe-placeholder.jpg';
  }
};
