import { Component, OnInit } from '@angular/core';
import { Auth } from '../../../services/authService/auth';
import { CommonModule } from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { LoginRequest, LoginResponse } from '../../../models/LoginModels';
import { debounceTime, tap } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit{
  errorMessage='';
  loading=false;
  userForm:FormGroup = new FormGroup({});

  constructor(private authService :Auth,private route:Router){}
  ngOnInit(): void {
    this.formInit();
  }

  get username(){return this.userForm.get('username');}
  get password(){return this.userForm.get('password');}
  get role(){return this.userForm.get('role');}

  formInit():void{
    this.userForm=new FormGroup({
      username: new FormControl('',[Validators.required]),
      password: new FormControl('',[Validators.required,Validators.minLength(5)])    
    });
  }

  onSubmit():void{
    console.log('clicked');
    if(this.userForm.invalid){
      Swal.fire({
        title: "Please fill all the required fields !",
        icon: "warning",
        draggable: true
      });
      return;
      // alert('Please fill all required fields');
      // return;
    }
    this.loading=true;
    this.authService.login(this.userForm.value)
    .pipe(
      debounceTime(300),
      tap((res:any)=>{
        sessionStorage.setItem('signInType','custom');
        console.log(res.imageUrl);
        if(res.imageUrl){
          this.authService.setPicture(res.imageUrl);
          sessionStorage.setItem('picture',res.imageUrl);
        }else{
          this.authService.setPicture('https://cdn-icons-png.flaticon.com/512/3135/3135715.png');
          sessionStorage.setItem('picture','https://cdn-icons-png.flaticon.com/512/3135/3135715.png');
        }
        
      
        // this.authService.setPicture(picture);
        sessionStorage.setItem('accessToken',res.token);
        sessionStorage.setItem('refreshToken',res.refreshToken);
        const expiry = res.expiry*60*1000;
        console.log(`Token will expire in '${res.expiry} min ,${expiry}`);
        const expiresAt = Date.now()+expiry;
        sessionStorage.setItem('tokenExpiry',expiresAt.toString());
        this.authService.setUser(res.username);
        console.log('Setting role from login to auth service ',res.role);
        this.authService.setRole(res.role);
        this.authService.startTokenTimer(expiry);
      })
    )
    .subscribe({
      next:(data:any)=>{
        console.log(data);
        this.loading=false;
        this.errorMessage='';
        //then i'll navigate to dashboard
        console.log('navigating to dashboard');
        this.route.navigate(['dashboard']);

      },
      error:(err)=>{
        this.loading=false;
        console.log('error = ',err);
        this.errorMessage='Incorrect username or password, Try again !!';
        console.log(err);
        Swal.fire({
        title: "Incorrect username or password, Try again !!",
        icon: "error",
        draggable: true
      });
      },
      complete:()=>{
        console.log('completed');
      }
    })

  }
}
