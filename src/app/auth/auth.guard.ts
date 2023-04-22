import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(): boolean {
    // const accessToken = localStorage.getItem('accessToken');
    const isAuthenticated = this.authService.isAuthenticated();
    if (!isAuthenticated) {
      this.router.navigate(['/auth/login']); // Redirect to login page if accessToken is not present
    }
    // Allow access if accessToken is present
    return isAuthenticated;
  }
}
