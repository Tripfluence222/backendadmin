import { NextResponse } from "next/server";

// Standard HTTP response helpers
export const ok = (data: any, meta?: any) => {
  return NextResponse.json({
    success: true,
    data,
    ...meta,
  });
};

export const created = (data: any, meta?: any) => {
  return NextResponse.json({
    success: true,
    data,
    ...meta,
  }, { status: 201 });
};

export const badReq = (message: string, errors?: any) => {
  return NextResponse.json({
    success: false,
    error: message,
    errors,
  }, { status: 400 });
};

export const unauth = (message: string = "Unauthorized") => {
  return NextResponse.json({
    success: false,
    error: message,
  }, { status: 401 });
};

export const forbidden = (message: string = "Forbidden") => {
  return NextResponse.json({
    success: false,
    error: message,
  }, { status: 403 });
};

export const notFound = (message: string = "Not found") => {
  return NextResponse.json({
    success: false,
    error: message,
  }, { status: 404 });
};

export const conflict = (message: string = "Conflict") => {
  return NextResponse.json({
    success: false,
    error: message,
  }, { status: 409 });
};

export const serverErr = (message: string = "Internal server error", error?: any) => {
  console.error("Server error:", error);
  
  return NextResponse.json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && error && { details: error.message }),
  }, { status: 500 });
};

export const serviceUnavailable = (message: string = "Service unavailable") => {
  return NextResponse.json({
    success: false,
    error: message,
  }, { status: 503 });
};

// Pagination helper
export const paginate = (data: any[], page: number, limit: number) => {
  const total = data.length;
  const pages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    data: data.slice(startIndex, endIndex),
    pagination: {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
    },
  };
};

// Error response helper
export const errorResponse = (error: any) => {
  if (error.name === "ValidationError") {
    return badReq("Validation failed", error.errors);
  }
  
  if (error.name === "NotFoundError") {
    return notFound(error.message);
  }
  
  if (error.name === "UnauthorizedError") {
    return unauth(error.message);
  }
  
  if (error.name === "ForbiddenError") {
    return forbidden(error.message);
  }
  
  if (error.name === "ConflictError") {
    return conflict(error.message);
  }
  
  return serverErr("An unexpected error occurred", error);
};