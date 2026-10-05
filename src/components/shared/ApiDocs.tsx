"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

import { EApiRoutes } from "@/constants/routes";

export const ApiDocs = () => {
  return <SwaggerUI url={EApiRoutes.openapi} docExpansion="list" />;
};
