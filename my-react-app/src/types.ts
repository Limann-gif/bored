export interface UserDto {
  username: string;
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface AuthResponse {
  token: string;
}
