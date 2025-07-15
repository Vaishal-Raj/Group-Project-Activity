import { Component } from '@angular/core';
import { Login } from "../login/login";
import { Register } from "../register/register";
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth-page',
  imports: [CommonModule,Login, Register],
  templateUrl: './auth-page.html',
  styleUrl: './auth-page.css'
})
export class AuthPage {
  isLoginVisible = true;

  toggleView(): void {
    this.isLoginVisible = !this.isLoginVisible;
  }
  signInWithGoogle() {
    window.location.href = 'http://localhost:5000/auth/google-login';
    
  }


}
