import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { PollService } from '../../services/pollService/poll-service';
import { DashboardState } from '../../services/dashboardService/dashboard-state';
import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { Auth } from '../../services/authService/auth';
import { LineChart } from "./line-chart/line-chart";
import { BarChart } from "./bar-chart/bar-chart";
import { AvatarComponent, WidgetModule } from '@coreui/angular';
import { VoteService } from '../../services/voteService/vote-service';
import { IconModule, IconSetService } from '@coreui/icons-angular';
import {
  cilChartPie,
  cilThumbUp,
  cilTask,
  cilUserFollow
} from '@coreui/icons';
import { WidgetTest } from "./widgetTest/widget-test/widget-test";
import { ThemeService } from '../../theme';
import { CountUp } from 'countup.js';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, LineChart, BarChart, AvatarComponent,
    CommonModule, WidgetModule, IconModule, WidgetTest],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  dataLoaded=false;
  loggedInUsername: string = "";
  totalPolls:number=0;
  myPolls:number=0;
  totalVotes:number=0;
  recentPolls:any[]=[];
  allMyVotes:number=0;
  profile_pic:string|null=null;
  mode:boolean=false;
  
  constructor(
    private pollService: PollService,
    public state: DashboardState,
    private authService:Auth,
    private voteService : VoteService,
    private iconSet:IconSetService,
    private themeService:ThemeService,
    private router:Router
  ) {
    this.iconSet.icons = {
    cilChartPie,
    cilThumbUp,
    cilTask,
    cilUserFollow
  };
  }

lineChartData = {
  labels: [] as string[],
  datasets: [
    {
      label: 'Polls Created Per Day',
      data: [] as number[],
      fill: true,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      tension: 0.3
    }
  ]
};
  barChartData = {
    labels:['Total Polls', 'My Polls', 'Total Votes','My Votes'],
    datasets: [{
      label: 'Poll Statistics',
      data: [0,0,0],
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b','#10b981'],
      borderColor: [
        'rgb(255, 99, 132)',
        'rgb(255, 159, 64)',
        'rgb(255, 205, 86)',
        'rgb(255, 159, 64)'
      ],
      borderWidth: 1
    }]
  };
  animateCounts() {
    const elements = [
      { id: 'totalPollsEl', value: this.totalPolls },
      { id: 'myPollsEl', value: this.myPolls },
      { id: 'totalVotesEl', value: this.totalVotes },
      { id: 'myVotesEl', value: this.allMyVotes }
    ];

    for (const item of elements) {
      const countUp = new CountUp(item.id, item.value);
      if (!countUp.error) {
        countUp.start();
      } else {
        console.error(`CountUp error for ${item.id}:`, countUp.error);
      }
    }
  }
  
  goToPoll() {
    this.router.navigate(['/all-polls']);
  }
  ngOnInit(): void {
    this.themeService.darkMode$.subscribe((isDarkMode) => {
      this.mode=isDarkMode;
      
    });
    this.authService.user$.subscribe({
      next:(data:any)=>{
          this.loggedInUsername=data as string;
      }
    });

    this.authService.profilePicture$.subscribe({
      next:(data:any)=>{
        this.profile_pic=data as string;
      }
    })
    console.log(`Logged in user = ${this.loggedInUsername}`);

    this.voteService.getAllVotes().subscribe({
      next:(res:any)=>{
        const voteList = res.data.$values;
        this.state.setTotalVotes(voteList.length);
        this.state.totalVotes$.subscribe(res=>{
          this.totalVotes=res;
        })
      }
    })
    this.voteService.getAllMyVotes().subscribe({
      next:(res:any)=>{
        console.log('Votes List',res.data.$values);
        const voteList = res.data.$values; 
        this.state.setVotesCast(voteList.length);
        this.state.votesCast$.subscribe(res=>{
          console.log(res);
          this.allMyVotes=res;
        })
      }
    })
    this.pollService.getAllPoles().subscribe({
      next: (res: any) => {
        console.log('Polls list dashboard-------',res.data?.$values);
        const polls = res.data?.$values || [];

        // Total Polls
        this.state.setTotalPolls(polls.length);

        // My Polls Count
        const myPolls = polls.filter(
          (poll: any) => poll.createdByUsername?.toLowerCase() === this.loggedInUsername.toLowerCase()
        );
        this.state.setMyPolls(myPolls.length);

        

        // Recent Polls (sorted by createdAt descending)
        const recent = [...polls]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        this.state.setRecentPolls(recent);

        //polls per day
        const pollsPerDay:{[date:string]:number}={};
        polls.forEach((poll:any) => {
            const date = new Date(poll.createdAt).toLocaleDateString();
            pollsPerDay[date] = (pollsPerDay[date] || 0)+1;
        });

        const sortedDates = Object.keys(pollsPerDay).sort(
            (a, b) => new Date(a).getTime() - new Date(b).getTime()
          );
        console.log(`sorted dates = ${sortedDates}`)
        
        this.state.totalPolls$.subscribe({
          next:(data:any)=>{
            this.totalPolls=data;
          }
        })
        this.state.myPolls$.subscribe({
          next:(data:any)=>{
            this.myPolls=data;
          }
        });
        this.state.totalVotes$.subscribe({
          next:(data:any)=>{
            this.totalVotes=data;
          }
        });
        this.state.recentPolls$.subscribe({
          next:(data:any)=>{
            this.recentPolls=data;
          }
        });

        console.log(`${this.totalPolls}, ${this.myPolls}`)
        this.barChartData.datasets[0].data=[this.totalPolls, this.myPolls, this.totalVotes,this.allMyVotes];
        
        this.lineChartData.labels=sortedDates;
        this.lineChartData.datasets[0].data = sortedDates.map(date=>pollsPerDay[date]);
        this.dataLoaded=true;
        setTimeout(() => {
          this.animateCounts();
        }, 0);

      },
      error: (err) => {
        console.error('Failed to fetch polls:', err);
      }
    });
  }
}
