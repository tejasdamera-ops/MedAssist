import { body, param } from "express-validator";

export const idParam = [param("id").isMongoId()];
export const bodyRequired = [body().custom((value) => value && Object.keys(value).length > 0)];
export const patientIdParam = [param("patientId").isMongoId()];
