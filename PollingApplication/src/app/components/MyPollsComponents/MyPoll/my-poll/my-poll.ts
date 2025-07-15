import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PollModel } from '../../../../models/pollModels';
import { CommonModule, DatePipe } from '@angular/common';
import { EditPoll } from "../../EditPoll/edit-poll/edit-poll";
import { ViewResult } from "../../ViewResults/view-result/view-result";
import Swal from 'sweetalert2';
import { Auth } from '../../../../services/authService/auth';
@Component({
  selector: 'app-my-poll',
  imports: [DatePipe, EditPoll, ViewResult,CommonModule],
  templateUrl: './my-poll.html',
  styleUrl: './my-poll.css'
})
export class MyPoll implements OnInit{
  @Input() poll:PollModel | null= null;
  @Output() edit = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();
  @Output() viewResults = new EventEmitter<number>();
  editMode:boolean = false;
  showChart:boolean=false;
  status:string = '';

  constructor(private authService:Auth){}
  ngOnInit(): void {
    this.isPollOngoing();
  }
  onEdit() {
    this.editMode=false;
    this.edit.emit(this.poll?.id);
  }

  enableEdit(){
    this.editMode=true;
  }
  cancelEdit(){
    this.editMode=false;
  }


  // onDelete() {
  //   this.showConfirmDelete = true;
  // }

  isPollOngoing(): boolean {
    if (!this.poll?.startTime || !this.poll?.endTime) return false;
    const now = new Date();
    const start = new Date(this.poll.startTime);
    const end = new Date(this.poll.endTime);
    if (now < start) {
      this.status=  'Yet to Open';
    }
    else if(now > end) {
      this.status=  'Poll has ended';
    }
    else{
      this.status=  'Live';
    }
    return now >= start && now <= end;
  }

  async onDelete() {
    if (this.isPollOngoing()) {
      const confirm = await Swal.fire({
        title: "Poll is live!",
        text: "Deleting it now will permanently discard live results. Continue?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, force delete",
        cancelButtonText: "No, cancel",
        customClass: {
          confirmButton: "btn btn-danger",
          cancelButton: "btn btn-secondary"
        },
        buttonsStyling: false
      });

      if (!confirm.isConfirmed) return;

      const { value: password } = await Swal.fire({
        title: 'Enter Moderator Password',
        input: 'password',
        inputLabel: 'Password',
        inputPlaceholder: 'Enter password',
        inputAttributes: {
          autocapitalize: 'off',
          autocorrect: 'off'
        },
        showCancelButton: true,
        confirmButtonText: 'Submit',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-secondary'
        },
        buttonsStyling: false
      });

      if (!password) return;

      this.authService.confirmPassword(password).subscribe({
        next: (res:any) => {
          if (res === true) {
            Swal.fire({
              icon: 'success',
              title: 'Password verified',
              text: 'Proceeding with poll deletion',
              timer: 1500,
              showConfirmButton: false,
            });

            this.delete.emit(this.poll?.id); 
            Swal.fire({
              title: "Deleted!",
              text: "Your poll has been deleted.",
              icon: "success"
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Incorrect password',
              text: 'Authorization failed'
            });
          }
        },
        error: (err:any) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.error?.message || 'Something went wrong'
          });
        }
      });

    } else {
      const confirm = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        customClass: {
          confirmButton: "btn btn-success",
          cancelButton: "btn btn-danger"
        },
        buttonsStyling: false
      });

      if (confirm.isConfirmed) {
        this.delete.emit(this.poll?.id);
        Swal.fire({
          title: "Deleted!",
          text: "Your poll has been deleted.",
          icon: "success"
        });
      }
    }
  }
 



  onViewResults() {
    this.showChart=!this.showChart;
    this.viewResults.emit(this.poll?.id);
  }

  


}
