import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PollModel } from '../../../../models/pollModels';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CreatePollDto } from '../../../../models/create-poll.model';
import { PollService } from '../../../../services/pollService/poll-service';
import { Auth } from '../../../../services/authService/auth';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-poll',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-poll.html',
  styleUrl: './edit-poll.css',
})
export class EditPoll implements OnInit {
  @Input() poll: PollModel | null = null;
  @Output() pollUpdated = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  editForm: FormGroup = new FormGroup({});
  loading = false;
  errorMessage = '';

  constructor(private pollService: PollService, private authService: Auth) {}

  ngOnInit(): void {
    this.formInit();
  }

  formInit(): void {
    this.editForm = new FormGroup({
      question: new FormControl(this.poll?.question, [Validators.required]),
      options: new FormArray(
        this.poll?.options.map((opt) => new FormControl(opt.text, [Validators.required])) || []
      ),
      startTime: new FormControl(null),
      endTime: new FormControl(null),
    });
  }

  get options() {
    return this.editForm.get('options') as FormArray;
  }

  addOption(): void {
    this.options.push(new FormControl('', [Validators.required]));
  }

  removeOption(index: number): void {
    if (this.options.length > 2) {
      this.options.removeAt(index);
    }
  }

  isPollOngoing(): boolean {
    if (!this.poll?.startTime || !this.poll?.endTime) return false;
    const now = new Date();
    const start = new Date(this.poll.startTime);
    const end = new Date(this.poll.endTime);
    return now >= start && now <= end;
  }

  async submitUpdate(): Promise<void> {
    if (this.isPollOngoing()) {
      const confirm = await Swal.fire({
        title: 'Poll is ongoing!',
        text: 'Force editing will reset all votes. Do you want to continue?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, force edit',
        cancelButtonText: 'No, cancel',
        customClass: {
          confirmButton: 'btn btn-danger',
          cancelButton: 'btn btn-secondary',
        },
        buttonsStyling: false,
      });

      if (!confirm.isConfirmed) return;

      const { value: password } = await Swal.fire({
        title: 'Enter Moderator Password',
        input: 'password',
        inputLabel: 'Password',
        inputPlaceholder: 'Enter password',
        inputAttributes: {
          autocapitalize: 'off',
          autocorrect: 'off',
        },
        showCancelButton: true,
        confirmButtonText: 'Submit',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-secondary',
        },
        buttonsStyling: false,
      });

      if (!password) return;

      this.authService.confirmPassword(password).subscribe({
        next: (res: any) => {
          if (res === true) {
            Swal.fire({
              icon: 'success',
              title: 'Password verified',
              text: 'Proceeding with poll update',
              timer: 1500,
              showConfirmButton: false,
            });
            this.performUpdate(); 
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Incorrect password',
              text: 'Authorization failed',
            });
          }
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.error?.message || 'Something went wrong',
          });
        },
      });

      return;
    }

    this.performUpdate();
  }

  public performUpdate(): void {
    this.loading = true;
    const formData = CreatePollDto.fromForm(this.editForm.value);

    if (!this.poll) return;

    this.pollService.updatePoll(this.poll.id, formData).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.pollUpdated.emit();
        Swal.fire({
          icon: 'success',
          title: 'Poll Updated',
          text: 'Changes saved successfully',
          timer: 1500,
          showConfirmButton: false,
        });
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'There was some problem with editing the poll';
        console.error('Error updating poll', err);
      },
    });
  }
}
