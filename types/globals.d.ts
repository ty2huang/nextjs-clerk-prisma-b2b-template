import { Group } from "@prisma/client";

export {}

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      currentGroup?: Group
    }
  }
} 