// poll.ts
import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { VoteService } from '../../../services/voteService/vote-service';
import { Signalr } from '../../../services/SignalRService/signalr';
import { PollModel } from '../../../models/pollModels';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VoteDto } from '../../../models/voteModels';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-poll',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './poll.html',
  styleUrl: './poll.css'
})
export class Poll implements OnInit, OnDestroy {

  @Input() poll: PollModel | null = null;
  @Output() updatePoll = new EventEmitter<void>();
  selectedOptionId: number = 0;
  loading: boolean = false;
  errorMessage: string = '';
  voteSubscription: any | null = null;
  showOptions: boolean = false;
  totalVotes: number = 0;
  hasVoted: boolean = false;
  status: boolean = true;

  constructor(
    private voteService: VoteService,
    private signalRService: Signalr,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.status = this.pollStatus();
    if (!this.poll) return;

    this.signalRService.startConnection();
    this.signalRService.voteUpdateListener();
    this.signalRService.PollStatusListener();

    this.signalRService.PollStatus$.subscribe({
      next: (data: any) => {
        if (data != null) {
          this.updatePoll.emit();
        }
      }
    });

    this.voteSubscription = this.signalRService.voteUpdate$.subscribe({
      next: (data: any) => {
        if (this.poll?.id === data?.pollId) {
          const voteOption = this.poll?.options.find(opt => opt.id === data.optionId);
          if (voteOption) {
            voteOption.voteCount = data.updatedVoteCount;
          }
          const optionText = voteOption ? voteOption.text : `Option ${data.optionId}`;
          if (data.action) {
            this.toastr.success(`${optionText} got a vote!`, 'Vote Received', {
              progressBar: true,
              positionClass: 'toast-bottom-right',
              toastClass: 'ngx-toastr custom-toast-green',
              disableTimeOut: true,
              closeButton: true
            });
          } else {
            this.toastr.error(`${optionText} lost a vote`, 'Vote Removed', {
              progressBar: true,
              positionClass: 'toast-bottom-right',
              disableTimeOut: true,
              closeButton: true
            });
          }
        }
      }
    });

    this.voteService.getMyVote(this.poll?.id).subscribe({
      next: (res: any) => {
        if (res.success && res.data?.optionId) {
          this.selectedOptionId = res.data.optionId;
        }
      },
      error: err => {
        console.error("Error fetching user vote", err);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.poll) {
      this.signalRService.leavePollGroup(this.poll.id);
      this.signalRService.removeVoteUpdateListener();
    }
    this.voteSubscription?.unsubscribe();
  }

  pollStatus(): boolean {
    if (!this.poll || !this.poll.startTime || !this.poll.endTime) return false;
    const now = new Date();
    const start = new Date(this.poll.startTime);
    const end = new Date(this.poll.endTime);
    return now >= start && now <= end;
  }

  toggleOptions(): void {
    this.showOptions = !this.showOptions;
    if (this.showOptions && this.poll) {
      if(this.pollStatus()){
           this.signalRService.joinPollGroup(this.poll.id);
            this.toastr.success(`Joined Poll - ${this.poll.id}`, 'Poll Join Info', {
              progressBar: true,
              positionClass: 'toast-bottom-right',
              toastClass: 'ngx-toastr custom-toast-blue',
              disableTimeOut: true,
              closeButton: true
            });
      }
     
    } else if (this.poll) {
      this.signalRService.leavePollGroup(this.poll.id);
    }
  }

  castVote(optionId: number): void {
    if (!this.poll) return;

    if (!this.pollStatus()) {
      this.toastr.warning('Poll has not started yet.', 'Voting Not Allowed');
      Swal.fire({
        icon: 'info',
        title: 'Voting Not Allowed',
        text: 'You cannot vote before the poll starts.',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'btn btn-primary'
        },
        buttonsStyling: false
      });
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    const voteDto = VoteDto.fromJson(this.poll.id, optionId);

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger"
      },
      buttonsStyling: false
    });

    swalWithBootstrapButtons.fire({
      title: "Are you sure?",
      text: "Do you want to vote this option?",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Yes, cast vote!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.voteService.castVote(voteDto).subscribe({
          next: () => {
            this.loading = false;
            this.selectedOptionId = optionId;
            this.hasVoted = true;

            swalWithBootstrapButtons.fire({
              title: "Vote Successful!!",
              text: "Your vote has been submitted.",
              icon: "success"
            });
            this.showOptions=false;
          },
          error: (err) => {
            this.loading = false;
            this.errorMessage = 'You have already voted';
            this.toastr.error(this.errorMessage, 'Error', {
              toastClass: 'toast ngx-toastr custom-toast-red'
            });
            swalWithBootstrapButtons.fire({
              title: "Vote failed!",
              text: "You have already voted.",
              icon: "warning"
            });
          }
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        this.loading = false;
        swalWithBootstrapButtons.fire({
          title: "Cancelled",
          text: "You cancelled voting :)",
          icon: "error"
        });
      }
    });
  }

  removeVote(): void {
    if (!this.poll) return;
    this.loading = true;
    this.errorMessage = '';

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-danger",
        cancelButton: "btn btn-secondary"
      },
      buttonsStyling: false
    });

    swalWithBootstrapButtons.fire({
      title: "Are you sure?",
      text: "Do you want to remove your vote?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, remove it!",
      cancelButtonText: "No, keep it!",
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.voteService.removeVote(this.poll!.id).subscribe({
          next: () => {
            this.loading = false;
            this.selectedOptionId = 0;
            this.hasVoted = false;
            swalWithBootstrapButtons.fire({
              title: "Removed!",
              text: "Your vote has been removed.",
              icon: "success"
            });
            this.showOptions=false;
          },
          error: (err) => {
            this.loading = false;
            this.errorMessage = err.error?.message || 'Could not remove vote';
            this.toastr.error(this.errorMessage, 'Error', {
              toastClass: 'toast ngx-toastr custom-toast-red'
            });
            swalWithBootstrapButtons.fire({
              title: "Error",
              text: "Your vote was not found in this poll :)",
              icon: "error"
            });
          }
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        this.loading = false;
        swalWithBootstrapButtons.fire({
          title: "Cancelled",
          text: "Your vote is safe :)",
          icon: "error"
        });
      }
    });
  }

  getTimeLeft(): string {
    if (!this.poll?.endTime) return '';
    const endTime = new Date(this.poll.endTime).getTime();
    const now = Date.now();
    const diffMs = endTime - now;
    if (diffMs <= 0) return 'Poll has ended';
    const minutes = Math.floor(diffMs / 60000) % 60;
    const hours = Math.floor(diffMs / 3600000) % 24;
    const days = Math.floor(diffMs / 86400000);
    let timeStr = '';
    if (days > 0) timeStr += `${days}d `;
    if (hours > 0 || days > 0) timeStr += `${hours}h `;
    timeStr += `${minutes}m left`;
    return timeStr;
  }

  getTimeUntilStart(): string {
    if (!this.poll?.startTime) return '';
    const startTime = new Date(this.poll.startTime).getTime();
    const now = Date.now();
    const diffMs = startTime - now;
    if (diffMs <= 0) return '';
    const minutes = Math.floor(diffMs / 60000) % 60;
    const hours = Math.floor(diffMs / 3600000) % 24;
    const days = Math.floor(diffMs / 86400000);
    let timeStr = '';
    if (days > 0) timeStr += `${days}d `;
    if (hours > 0 || days > 0) timeStr += `${hours}h `;
    timeStr += `${minutes}m`;
    return timeStr;
  }

  formatDate(dateStr: string | Date | undefined): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString();
  }

  getVotePercentage(voteCount: number): number {
    if (!this.poll || !this.poll.options) return 0;
    this.totalVotes = this.poll.options.reduce((sum, o) => sum + o.voteCount, 0);
    if (this.totalVotes === 0) return 0;
    return Math.round((voteCount / this.totalVotes) * 100);
  }

}
