export class ApiError extends Error {
  public code: string;
  public status: number;
  public path: string;

  constructor(code: string, status: number, message: string, path: string) {
    super(message);

    this.code = code;
    this.status = status;
    this.path = path;

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
