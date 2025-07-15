import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../../services/authService/auth';
import { debounceTime, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RegisterRequest, RegisterResponse } from '../../../models/RegisterModels';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  errorMessage:string='';
  loading:boolean=false;
  userForm:FormGroup = new FormGroup({});

  constructor(private authService :Auth){}
  ngOnInit(): void {
    this.formInit();
  }

  get username(){return this.userForm.get('username');}
  get password(){return this.userForm.get('password');}

  formInit():void{
    this.userForm=new FormGroup({
      username: new FormControl('',[Validators.required]),
      password: new FormControl('',[Validators.required,Validators.minLength(5)]),
    });
  }

  onSubmit():void{
    // console.log('clicked');
    if(this.userForm.invalid){
      Swal.fire({
              title: "Please fill all the required fields !",
              icon: "warning",
              draggable: true
            });
      return;
    }
    this.loading=true;
    const res = RegisterRequest.fromForm(this.userForm.value);
    console.log(res);
    this.authService.register(res)
    .pipe(
      debounceTime(1000)
    )
    .subscribe({
      next:(data:any)=>{
        this.loading=false;
        const response = RegisterResponse.fromForm(data);
        console.log(response);
        alert("Account created!!");

      },
      error:(err)=>{
        console.log(err);
        this.errorMessage=err.error.message;
        this.loading=false;
      }
    })
    

  }
}
