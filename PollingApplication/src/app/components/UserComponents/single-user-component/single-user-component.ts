import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { UserService } from '../../../services/user-service';
import { Auth } from '../../../services/authService/auth';
import { UserModel } from '../../../models/userModel';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-single-user-component',
  imports: [],
  templateUrl: './single-user-component.html',
  styleUrl: './single-user-component.css'
})
export class SingleUserComponent implements OnInit {
  @Input() user: UserModel | null = null;
  @Output() userUpdated = new EventEmitter<void>();

  currentUserId: string = '';

  constructor(private userService: UserService, private auth: Auth,private router:Router) {}

  ngOnInit(): void {
    this.auth.user$.subscribe({
      next: (res: any) => {
        this.currentUserId = res as string;
      }
    });
  }

  deleteUser(id: string) {
    if (id === this.currentUserId) {
      Swal.fire("You cannot delete yourself!!");
      return;
    }

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger"
      },
      buttonsStyling: false
    });

    swalWithBootstrapButtons.fire({
      title: "Are you sure?",
      text: "Are you sure you want to delete this user?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(id).subscribe({
          next: () => {
            swalWithBootstrapButtons.fire("Deleted!", "User has been deleted.", "success");
            this.userUpdated.emit();
          },
          error: () => {
            swalWithBootstrapButtons.fire("Error", "Couldn't delete user", "error");
          }
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        swalWithBootstrapButtons.fire("Cancelled", "User account is safe :)", "error");
      }
    });
  }

  promoteUser(user: UserModel) {
    const updatedUser = { ...user, role: 'Moderator' };
    this.userService.updateUser(user.username, updatedUser).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Promoted!',
          text: `${user.username} is now a Moderator.`,
          confirmButtonColor: '#28a745'
        });
       
        // this.router.navigate(['dashboard']);
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: 'Unable to promote user.',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  demoteUser(user: UserModel) {
    const updatedUser = { ...user, role: 'Voter' };
    this.userService.updateUser(user.username, updatedUser).subscribe({
      next: () => {
        Swal.fire({
          icon: 'info',
          title: 'Demoted!',
          text: `${user.username} is now a Voter.`,
          confirmButtonColor: '#ffc107'
        });
      
        // this.router.navigate(['dashboard']);
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: 'Unable to demote user.',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }
}
