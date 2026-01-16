export interface GameResult {
  success: boolean;
  imageUrl: string | null;
  score: number;
  message: string;
  attemptsLeft?: number; 
}

export interface Challenge {
  id: string;
  image_url: string;
  photographer_name?: string;
  photographer_profile_url?: string;
}

export interface Guess {
  id: string;
  user_id: string;
  challenge_id: string;
  prompt: string;
  image_url: string;
  score: number;
  attempt_number: number;
  created_at?: string;
}