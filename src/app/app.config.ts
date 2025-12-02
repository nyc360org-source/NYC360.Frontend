import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

// 1. تأكد أن هذا المسار يشير للملف الذي عدلناه في الخطوة 1

// 2. استيراد مكتبات جوجل
import { SocialAuthServiceConfig, GoogleLoginProvider } from '@abacritt/angularx-social-login';
import { authInterceptor } from './interceptor/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    
    provideClientHydration(withEventReplay()),

    // تفعيل HTTP Client مع الإنترسبتور المصحح
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor]) 
    ),

    // إعدادات Google Auth
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '498969207883-os0gf7vs10g5rcekdlo6rtd316ubatqc.apps.googleusercontent.com'
            )
          }
        ],
        onError: (err) => {
          console.error('Social Login Error:', err);
        }
      } as SocialAuthServiceConfig,
    }
  ]
};