import { Component, OnInit } from '@angular/core';
import { PollService } from '../../../services/pollService/poll-service';
import { PollModel } from '../../../models/pollModels';
import { Poll } from "../poll/poll";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-all-polls',
  standalone: true,
  templateUrl: './all-polls.html',
  styleUrl: './all-polls.css',
  imports: [Poll,CommonModule,FormsModule],
})
export class AllPolls implements OnInit {
  polls: PollModel[] = [];
  filteredPolls: PollModel[] = [];

  searchTerm: string = '';
  selectedFilter: 'all' | 'active' | 'inactive' | 'recent' = 'all';

  constructor(private pollService: PollService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.pollService.getAllPoles().subscribe({
      next: (res: any) => {
        const resPolls = res?.data?.$values;
        this.polls = resPolls
          .map((poll: any) => PollModel.fromJson(poll))
          .sort((a: PollModel, b: PollModel) => {
            const dateA = new Date(a.createdAt ?? a.startTime ?? 0).getTime();
            const dateB = new Date(b.createdAt ?? b.startTime ?? 0).getTime();
            return dateB - dateA;
          });

        this.filterPolls(); 
      },
      error: (err) => {
        console.error('Failed to load polls:', err);
      }
    });
  }

  filterPolls(): void {
    const now = new Date().getTime();

    this.filteredPolls = this.polls.filter(poll => {
      const matchesSearch = poll.question.toLowerCase().includes(this.searchTerm.toLowerCase());
      const creatorMatch = poll.createdByUsername.toLowerCase().includes(this.searchTerm.toLowerCase());

      const start = new Date(poll.startTime ?? 0).getTime();
      const end = new Date(poll.endTime ?? 0).getTime();


      const isActive = now >= start && now <= end;
      const isInactive = now > end;
      const isRecent = now - start < 2 * 24 * 60 * 60 * 1000; 
      const filterMatch =
        this.selectedFilter === 'all' ||
        (this.selectedFilter === 'active' && isActive) ||
        (this.selectedFilter === 'inactive' && isInactive) ||
        (this.selectedFilter === 'recent' && isRecent);

      return (matchesSearch || creatorMatch) && filterMatch;
    });
  }
}
