// lib/utils/external-api-helpers.ts
import { callExternalApi } from "./external-api-client";
import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";

// ===== EXAMPLE: JSONPlaceholder API =====
export const jsonPlaceholderApi = {
  // GET /users - External API trả về array trực tiếp
  getUsers: () => callExternalApi<User[]>(
    "https://jsonplaceholder.typicode.com/users",
    HTTP_METHOD_ENUM.GET
  ),

  // GET /users/1 - External API trả về object user
  getUser: (id: number) => callExternalApi<User>(
    `https://jsonplaceholder.typicode.com/users/${id}`,
    HTTP_METHOD_ENUM.GET
  ),

  // POST /users - External API trả về created user
  createUser: (userData: Partial<User>) => callExternalApi<User>(
    "https://jsonplaceholder.typicode.com/users",
    HTTP_METHOD_ENUM.POST,
    userData
  )
};

// ===== EXAMPLE: GitHub API =====
export const githubApi = {
  // GET /user/repos - Trả về array repos
  getUserRepos: (username: string) => callExternalApi<GitHubRepo[]>(
    `https://api.github.com/users/${username}/repos`,
    HTTP_METHOD_ENUM.GET
  ),

  // GET /repos/:owner/:repo - Trả về repo object
  getRepo: (owner: string, repo: string) => callExternalApi<GitHubRepo>(
    `https://api.github.com/repos/${owner}/${repo}`,
    HTTP_METHOD_ENUM.GET
  )
};

// ===== EXAMPLE: Weather API =====
export const weatherApi = {
  // External API có format khác: { weather: [...], main: {...} }
  getCurrentWeather: (city: string, apiKey: string) =>
    callExternalApi<WeatherResponse>(
      `https://api.openweathermap.org/data/2.5/weather`,
      HTTP_METHOD_ENUM.GET,
      { q: city, appid: apiKey, units: "metric" }
    )
};

// ===== TYPE DEFINITIONS =====
interface User {
  id: number;
  name: string;
  email: string;
  username: string;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  stargazers_count: number;
}

interface WeatherResponse {
  weather: Array<{
    main: string;
    description: string;
  }>;
  main: {
    temp: number;
    humidity: number;
  };
  name: string;
}