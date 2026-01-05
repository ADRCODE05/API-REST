import { Injectable, type NestInterceptor, type ExecutionContext, type CallHandler } from "@nestjs/common"
import type { Observable } from "rxjs"
import { map } from "rxjs/operators"

export interface Response<T> {
  success: boolean
  data: T
  message: string
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data is already in the final response format, return it
        if (data && typeof data === "object" && "success" in data && "data" in data) {
          return data
        }

        // If data is an array, wrap it in the standard format
        if (Array.isArray(data)) {
          return {
            success: true,
            data: data,
            message: "Operación exitosa",
          }
        }

        // If it's an object with a message, use its structure
        if (data && typeof data === "object" && "message" in data) {
          return {
            success: true,
            data: data.data !== undefined ? data.data : data,
            message: data.message || "Operación exitosa",
          }
        }

        // Default wrapping
        return {
          success: true,
          data: data,
          message: "Operación exitosa",
        }
      }),
    )
  }
}
