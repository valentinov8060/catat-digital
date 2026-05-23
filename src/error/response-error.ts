interface ResponseError extends Error {
  statusCode: number;
}

class ResponseError extends Error implements ResponseError {
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export { ResponseError };
