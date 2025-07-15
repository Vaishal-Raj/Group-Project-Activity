import { Component, OnInit } from '@angular/core';
import { Auth } from '../../../../services/authService/auth';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../services/user-service';
import { UserModel } from '../../../../models/userModel';
import { ThemeService } from '../../../../theme';
import { take } from 'rxjs';
import { VoteService } from '../../../../services/voteService/vote-service';
import { PollService } from '../../../../services/pollService/poll-service';
import { DashboardState } from '../../../../services/dashboardService/dashboard-state';

@Component({
  selector: 'app-profile-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-component.html',
  styleUrl: './profile-component.css'
})
export class ProfileComponent implements OnInit {
  username: string = '';
  signInType: string = '';
  profilePicture: string = '';
  editMode: boolean = false;
  role: string = '';
  user: UserModel | null = null;
  uploading: boolean = false;
  myPolls:number=0;
  myVotes:number=0;
  constructor(
    private authService: Auth,
    private route: Router,
    private userService: UserService,
    public theme: ThemeService,
    private dashboardService:DashboardState
  ) {}

  ngOnInit(): void {
    
    this.dashboardService.myPolls$.subscribe(res=>{
      this.myPolls=res;
    })

    this.dashboardService.votesCast$.subscribe(res=>{
      this.myVotes=res;
    })
    this.authService.user$.subscribe(res => {
      this.username = res as string;
    });
    this.authService.role$.subscribe(res => {
      this.role = res as string;
    });
    this.authService.profilePicture$.subscribe(res => {
      this.profilePicture = res as string;
    });
    this.authService.signInType$.subscribe(res => {
      this.signInType = res as string;
    });
    this.user = new UserModel(this.username, this.role, this.profilePicture);
    console.log(this.user,this.role);
  }

  logout() {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger"
      },
      buttonsStyling: false
    });
    swalWithBootstrapButtons.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, logout!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.route.navigate(['logout']);
        swalWithBootstrapButtons.fire({
          title: "Logged out!!",
          text: "You have logged out successfully.",
          icon: "success"
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        swalWithBootstrapButtons.fire({
          title: "Cancelled",
          text: "Your session continues :)",
          icon: "error"
        });
      }
    });
  }

  isGoogleSignIn(): boolean {
    return this.signInType === 'google';
  }

  onProfilePicSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      this.uploading = true;
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.profilePicture = reader.result as string;
        this.authService.setPicture(this.profilePicture);
        const updatedUser = { ...this.user, imageUrl: this.profilePicture };
        this.userService.updateUser(this.username, updatedUser).subscribe({
          next: () => {
            this.uploading = false;
            Swal.fire({
              icon: 'success',
              title: 'Profile Picture Updated',
              timer: 1500,
              showConfirmButton: false
            });
          },
          error: err => {
            this.uploading = false;
            console.error('Error updating profile picture:', err);
          }
        });
      };
      reader.readAsDataURL(file);
    }
  }

  resetProfilePicture(): void {
    const defaultPic = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
    this.profilePicture = defaultPic;
    this.authService.setPicture(defaultPic);
    const updatedUser = { ...this.user, imageUrl: defaultPic };
    this.userService.updateUser(this.username, updatedUser).subscribe({
      next: () => {
        Swal.fire('Reset!', 'Profile picture has been reset.', 'success');
      },
      error: err => {
        console.error('Error resetting profile picture:', err);
      }
    });
  }

  
}
