import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthData } from './auth-data.model';

const BACKEND_URL = `${environment.apiUrl}/user`;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenUpdated = new BehaviorSubject<boolean>(false);
  tokenData: Observable<boolean> = this.tokenUpdated.asObservable();
  authenticated = false;
  tokenTimeOut: any;
  userId: string | null = null;

  constructor(private httpClient: HttpClient, private router: Router) {}

  isAuthenticated() {
    return this.authenticated;
  }

  getUserId() {
    return this.userId;
  }

  createUser(authData: AuthData) {
    this.httpClient.post(`${BACKEND_URL}/signup`, authData).subscribe({
      next: (res) => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.tokenUpdated.next(false);
      },
    });
  }

  login(authData: AuthData) {
    this.httpClient
      .post<{ token: string; expiresIn: number; userId: string }>(
        `${BACKEND_URL}/login`,
        authData
      )
      .subscribe({
        next: (response) => {
          const token = response.token;
          if (token) {
            const expiresInDuration = response.expiresIn;
            this.userId = response.userId;
            this.setAuthTimer(expiresInDuration);
            this.authenticated = true;
            this.tokenUpdated.next(this.authenticated);
            const now = new Date();
            const expirationDate = new Date(
              now.getTime() + expiresInDuration * 1000
            );
            this.saveAuthData(token, expirationDate, this.userId);
            this.router.navigate(['/']);
          }
        },
        error: (err) => {
          this.tokenUpdated.next(false);
        },
      });
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.authenticated = true;
      this.userId = authInformation.userId;
      this.setAuthTimer(expiresIn / 1000);
      this.tokenUpdated.next(true);
    }
  }

  logout() {
    this.authenticated = false;
    this.tokenUpdated.next(this.authenticated);
    clearTimeout(this.tokenTimeOut);
    this.userId = null;
    this.clearAuthData();
    this.router.navigate(['/']);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  private clearAuthData() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  private getAuthData() {
    const token = localStorage.getItem('accessToken');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    if (!token || !expirationDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId,
    };
  }

  private setAuthTimer(duration: number) {
    this.tokenTimeOut = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }
}
