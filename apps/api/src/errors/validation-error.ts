import { ZodError, type ZodIssue } from "zod";

import { ValidationError, type ErrorDetail } from "./app-error.js";

const safeCustomMessages = new Set(["Required", "Invalid email", "Invalid CPF", "Invalid phone"]);

function issueField(issue: ZodIssue): string | undefined {
  if (issue.path.length === 0) {
    return undefined;
  }

  return issue.path.map((segment) => String(segment)).join(".");
}

function invalidValueMessage(issue: ZodIssue): string {
  const values = "values" in issue && Array.isArray(issue.values) ? issue.values : undefined;

  if (values && values.length > 0 && values.every((value) => typeof value === "string")) {
    return `Must be one of: ${values.join(", ")}`;
  }

  return "Invalid value";
}

function issueMessage(issue: ZodIssue): string {
  switch (issue.code) {
    case "invalid_type":
      return issue.message.includes("received undefined") ? "Required" : "Invalid value";
    case "invalid_format":
      return "format" in issue && issue.format === "email" ? "Invalid email" : "Invalid value";
    case "invalid_value":
      return invalidValueMessage(issue);
    case "too_small":
      return "minimum" in issue && issue.minimum === 1 ? "Required" : "Invalid value";
    case "custom":
      return safeCustomMessages.has(issue.message) ? issue.message : "Invalid value";
    default:
      return "Invalid value";
  }
}

export function mapZodError(error: ZodError): ErrorDetail[] {
  return error.issues.map((issue) => ({
    field: issueField(issue),
    message: issueMessage(issue),
  }));
}

export function validationErrorFromZod(error: ZodError): ValidationError {
  return new ValidationError(mapZodError(error));
}
