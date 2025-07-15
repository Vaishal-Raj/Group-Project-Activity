import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../../services/authService/auth';

@Component({
  selector: 'app-log-out',
  imports: [],
  templateUrl: './log-out.html',
  styleUrl: './log-out.css'
})
export class LogOut implements OnInit{
  constructor(private route:Router,private authService:Auth){}
  session : string = '';

  ngOnInit(): void {
    this.authService.signInType$.subscribe(data=>{
      this.session=data as string;
      console.log('sessiontype = ',this.session);
    })
    this.authService.setPicture(null);
    this.authService.logout();
    // this.authService.setUser('');
    this.route.navigate(['']);
    


    // this.authService.logout();
    // if(this.session==='google'){
    //   window.location.href = 'https://accounts.google.com/logout';
    //   this.route.navigate(['']);
    // }
    // else
    //   this.route.navigate(['']);
  }


}
