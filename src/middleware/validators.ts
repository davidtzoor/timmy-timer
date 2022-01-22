import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";

import { HttpErrorStatusCode } from "@/utils/errors";

export const timersGetValidator = () => [
  param("id", "id needs to be a positive integer").isInt({ min: 1 }),
];

export const timersPostValidator = () => [
  body(["hours", "minutes", "seconds"], "Time params can't be negative").isInt({
    min: 0,
  }),
  body("url").isURL({ require_tld: false, require_protocol: true }),
];

export const fakeEndpointValidator = () => [
  param("id", "id needs to be a positive integer").isInt({ min: 1 }),
]

export const validate = (req: Request<any>, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  return res
    .status(HttpErrorStatusCode.UNPROCESSABLE_ENTITY)
    .json({ errors: errors.array() });
};
