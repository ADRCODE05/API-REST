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
        // Si ya tiene el formato correcto, lo retornamos
        if (data && typeof data === "object" && "success" in data) {
          return data
        }

        // Si es un objeto con mensaje personalizado
        if (data && typeof data === "object" && "message" in data) {
          return {
            success: true,
            data: data.data || data,
            message: data.message || "Operación exitosa",
          }
        }

        // Formato por defecto
        return {
          success: true,
          data: data,
          message: "Operación exitosa",
        }
      }),
    )
  }
}
