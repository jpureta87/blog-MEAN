import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthData } from '../../auth-data.model';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  isLoading = false;
  form!: FormGroup;
  authSub = new Subscription();

  constructor(private readonly authService: AuthService) {}

  ngOnInit(): void {
    this.authSub = this.authService.tokenData.subscribe((isAuth) => {
      this.isLoading = isAuth;
    });
  }

  onLogin(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    const authData: AuthData = {
      email: form.value.email,
      password: form.value.password,
    };
    this.authService.login(authData);
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
  }
}
