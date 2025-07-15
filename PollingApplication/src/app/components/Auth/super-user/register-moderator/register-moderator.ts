import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../../../services/authService/auth';
import { CommonModule } from '@angular/common';
import { RegisterRequest, RegisterResponse } from '../../../../models/RegisterModels';
import { debounceTime } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register-moderator',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './register-moderator.html',
  styleUrl: './register-moderator.css'
})
export class RegisterModerator implements OnInit{
  loading:boolean=false;
  registerForm :FormGroup = new FormGroup({});

  successMessage = '';
  errorMessage = '';

  constructor(private auth: Auth,private route:Router) {}

  ngOnInit(): void {
    this.registerForm = new FormGroup(
      {
        username: new FormControl('', Validators.required),
        password: new FormControl('', [Validators.required,Validators.minLength(5)]),
      }
    )
  }

  get username(){return this.registerForm.get('username');}
  get password(){return this.registerForm.get('password');}
  register() {
    if(this.registerForm.invalid){
      Swal.fire({
                  title: "Please fill all the required fields !",
                  icon: "warning",
                  draggable: true
                });
          return;
    }
    const data = {
      ...this.registerForm.value,
      role: 'Moderator'
    };

    console.log(`moderator sign in ${data}`);
    this.loading=true;
        const res = RegisterRequest.fromForm(data);
        console.log(res);
        this.auth.register(res)
        .pipe(
          debounceTime(1000)
        )
        .subscribe({
          next:(data:any)=>{
            this.successMessage = 'Moderator registered successfully';
            this.registerForm.reset();
            this.loading=false;
            const response = RegisterResponse.fromForm(data);
            console.log(response);
            alert("Account created!!");
            this.route.navigate(['dashboard']);
    
          },
          error:(err)=>{
            console.log(err);
            this.errorMessage = 'Registration failed';
            this.loading=false;
            Swal.fire({
                  title: "The entered moderator already exists",
                  icon: "error",
                  draggable: true
                });
          return;
          }
        });
  }
}
