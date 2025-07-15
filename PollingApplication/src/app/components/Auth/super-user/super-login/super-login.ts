import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../../../services/authService/auth';

@Component({
  selector: 'app-super-login',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './super-login.html',
  styleUrl: './super-login.css'
})
export class SuperLogin implements OnInit{
  loginForm  : FormGroup = new FormGroup({});
  errorMessgae='';
  constructor(private auth:Auth,private router:Router){}
  

  initForm():void{
    this.loginForm = new FormGroup({
      username : new FormControl('',[Validators.required]),
      password : new FormControl('',[Validators.required])
    });
  }
  ngOnInit(): void {
    this.initForm();
  }

  login(){
    const formData = this.loginForm.value;
    this.auth.login(formData).subscribe({
      next:((res:any)=>{
        const role = res.role;
        if(role==='SuperUser'){
          sessionStorage.setItem('accessToken',res.token);
          sessionStorage.setItem('refreshToken',res.refreshToken)
          sessionStorage.setItem('Role',res.role);
          this.auth.setUser(res.username);
          this.router.navigate(['/register-moderator']);
        }else{
          this.errorMessgae= 'Access denied : Not a SuperUser';
        }
      }),
      error:(err)=>{
        this.errorMessgae = 'Invalid credentials';
      }
    })
  }

}
