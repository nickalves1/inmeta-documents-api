export abstract class AuthServiceContract {
  abstract login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string }>;
}
