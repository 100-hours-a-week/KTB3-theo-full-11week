export class ApiError extends Error {
  public code: string;
  public status: number;
  public path: string;

  constructor(code: string, status: number, message: string, path: string) {
    super(message);

    this.code = code;
    this.status = status;
    this.path = path;

    // Error 상속 시 브라우저/Node 환경에서 필요한 설정
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
