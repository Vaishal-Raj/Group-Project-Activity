import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PollService } from '../../../../services/pollService/poll-service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-extendpoll',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './extendpoll.html',
  styleUrl: './extendpoll.css'
})
export class ExtendpollComponent implements OnInit {
  @Input() pollId!: number;
  @Input() currentEndTime!: Date;
  @Input() extensionCount: number = 0;
  @Input() maxExtensions: number = 0;

  @Output() onExtended = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  extendForm: FormGroup = new FormGroup({});
  loading = false;
  errorMessage = '';
  extensionLimitReached = false;

  constructor(private pollService: PollService) { }

  ngOnInit(): void {
    this.extensionLimitReached = this.extensionCount >= this.maxExtensions;

    this.extendForm = new FormGroup({
      newEndTime: new FormControl(null, [Validators.required])
    });
  }

  extendPoll(): void {
    if (this.extendForm.invalid || !this.pollId || this.extensionLimitReached) return;

    const newEndTime = new Date(this.extendForm.value.newEndTime);
    const oldEndTime = new Date(this.currentEndTime);

    if (newEndTime <= oldEndTime) {
      this.errorMessage = 'New end time must be greater than current end time.';
      return;
    }

    this.errorMessage = '';
    this.loading = true;

    this.pollService.extendPoll(this.pollId, newEndTime).subscribe({
      next: () => {
        this.loading = false;
        Swal.fire({
          icon: 'success',
          title: 'Poll Extended',
          text: 'Poll duration extended successfully!',
          timer: 1500,
          showConfirmButton: false,
        });
        this.onExtended.emit();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Failed to extend the poll.';
      }
    });
  }
}
