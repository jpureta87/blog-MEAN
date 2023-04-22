import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { AuthData } from '../../auth-data.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit, OnDestroy {
  isLoading = false;
  authSub = new Subscription();

  constructor(private readonly authService: AuthService) {}

  ngOnInit(): void {
    this.authSub = this.authService.tokenData.subscribe((isAuth) => {
      this.isLoading = isAuth;
    });
  }

  onSignUp(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    const user: AuthData = {
      email: form.value.email,
      password: form.value.password,
    };
    this.authService.createUser(user);
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
  }
}
