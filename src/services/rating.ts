const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface Rating {
  id: string;
  rating: number;
  konsultasiId: string;
  review?: string;
  createdAt: string;
  updatedAt: string;
  pacilianId: string;
  caregiverId: string;
  pacilianName: string;
}

export interface RatingStats {
  averageRating: number;
  totalRatings: number;
  caregiverId: string;
  ratings: Rating[];
}

export interface CreateRatingRequest {
  rating: number;
  review?: string;
  konsultasiId: string;
}

export interface UpdateRatingRequest {
  rating: number;
  review?: string;
}

export const createRating = async (data: CreateRatingRequest): Promise<Rating> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
  };

  const response = await fetch(`${API_URL}/rating`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create rating');
  }
  
  const result = await response.json();
  return result.data;
};

export const getRatingById = async (ratingId: string): Promise<Rating> => {
  const headers: Record<string, string> = getAuthHeader();
  
  const response = await fetch(`${API_URL}/rating/${ratingId}`, {
    headers,
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch rating');
  }
  
  const result = await response.json();
  return result.data;
};

export const updateRating = async (ratingId: string, data: UpdateRatingRequest): Promise<Rating> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
  };

  const response = await fetch(`${API_URL}/rating/${ratingId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update rating');
  }
  
  const result = await response.json();
  return result.data;
};

export const deleteRating = async (ratingId: string): Promise<void> => {
  const headers: Record<string, string> = getAuthHeader();
  
  const response = await fetch(`${API_URL}/rating/${ratingId}`, {
    method: 'DELETE',
    headers,
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete rating');
  }
};

export const getUserRatings = async (pacilianId: string): Promise<Rating[]> => {
  const headers: Record<string, string> = getAuthHeader();
  
  const response = await fetch(`${API_URL}/rating/pacilian/${pacilianId}`, {
    headers,
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user ratings');
  }
  
  const result = await response.json();
  return result.data;
};

export const getCaregiverRatings = async (caregiverId: string): Promise<Rating[]> => {
  const response = await fetch(`${API_URL}/rating/caregiver/${caregiverId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch caregiver ratings');
  }
  
  const result = await response.json();
  return result.data;
};

export const getCaregiverRatingStats = async (caregiverId: string): Promise<RatingStats> => {
  const response = await fetch(`${API_URL}/rating/caregiver/${caregiverId}/stats`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch caregiver rating stats');
  }
  
  const result = await response.json();
  return result.data;
}; 