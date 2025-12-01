import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../pages/Public/Auth/Service/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // 1. Get current token
  const authToken = authService.getToken();

  // 2. Clone request with token if exists
  let authReq = req;
  if (authToken) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${authToken}` }
    });
  }

  // 3. Handle Request & Errors
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      
      // If error is 401 (Unauthorized) AND we haven't tried refreshing yet
      // (We check specific URL to avoid infinite loop on login/refresh endpoints)
      if (error.status === 401 && !req.url.includes('/auth/login') && !req.url.includes('/auth/refresh-token')) {
        
        const refreshToken = authService.getRefreshToken();
        const currentToken = authService.getToken();

        if (refreshToken && currentToken) {
          // 4. Call Refresh Token API
          return authService.refreshToken({ 
            accessToken: currentToken, 
            refreshToken: refreshToken 
          }).pipe(
            switchMap((res: any) => {
              if (res.isSuccess) {
                // 5. If refresh success: Retry original request with NEW token
                const newReq = req.clone({
                  setHeaders: { Authorization: `Bearer ${res.data.accessToken}` }
                });
                return next(newReq);
              } else {
                // If refresh failed (e.g. refresh token expired too), logout
                authService.logout();
                return throwError(() => error);
              }
            }),
            catchError((refreshErr) => {
              // If API call itself failed
              authService.logout();
              return throwError(() => refreshErr);
            })
          );
        }
      }

      // If not 401 or no tokens, propagate error
      return throwError(() => error);
    })
  );
};