import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeToggle } from "./theme-toggle/theme-toggle";
import { Login } from "./components/Auth/login/login";
import { Register } from "./components/Auth/register/register";
import { AuthPage } from "./components/Auth/auth-page/auth-page";
import { Navbar } from "./components/NavBar/navbar/navbar";
import { Auth } from './services/authService/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar,
     
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'PollingApplication';

  
}
