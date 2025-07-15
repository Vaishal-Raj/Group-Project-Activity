import { Component, OnInit } from '@angular/core';
import { UserModel } from '../../../models/userModel';
import { UserService } from '../../../services/user-service';
import { CommonModule } from '@angular/common';
import { Auth } from '../../../services/authService/auth';
import { SingleUserComponent } from "../single-user-component/single-user-component";

@Component({
  selector: 'app-user-component',
  imports: [CommonModule, SingleUserComponent],
  templateUrl: './user-component.html',
  styleUrl: './user-component.css'
})
export class UserComponent implements OnInit{
  users: UserModel[] = [];
  currentUserId :string = ''; 

  constructor(private userService: UserService,private auth:Auth) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.auth.user$.subscribe({
      next:(res:any)=>{
        this.currentUserId=res as string;
      }
    })

    this.userService.getUsers().subscribe({
      next: (res:any) => {
        console.log(res.data.$values);
        this.users = res.data.$values.map((user:any)=>UserModel.fromJson(user));
        this.users = this.users.filter(user=>user.role!=='SuperUser');
      },
      error:(err:any) => console.error('Failed to fetch users', err)
    });
  }

  
} 
