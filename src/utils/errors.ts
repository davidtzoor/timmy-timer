export enum HttpErrorStatusCode {
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER = 500,
}

export class GeneralError extends Error {
  constructor(message: string) {
    super();
    this.message = message;
  }

  getCode(): HttpErrorStatusCode {
    if (this instanceof BadRequest) {
      return HttpErrorStatusCode.BAD_REQUEST;
    }
    if (this instanceof NotFound) {
      return HttpErrorStatusCode.NOT_FOUND;
    }
    return HttpErrorStatusCode.INTERNAL_SERVER;
  }
}

export class BadRequest extends GeneralError {}
export class NotFound extends GeneralError {}
