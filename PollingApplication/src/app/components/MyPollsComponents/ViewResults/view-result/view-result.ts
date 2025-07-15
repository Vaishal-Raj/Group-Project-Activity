import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { PollModel } from '../../../../models/pollModels';
import { ChartConfiguration, ChartData,ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { VoteService } from '../../../../services/voteService/vote-service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-view-result',
  imports: [BaseChartDirective,CommonModule],
  templateUrl: './view-result.html',
  styleUrl: './view-result.css'
})
export class ViewResult implements OnChanges,OnInit{
  
  @Input() poll:PollModel | null = null;

  votes:any = [];
  constructor(private voteService:VoteService){}

  ngOnInit(): void {
    if(this.poll){
      this.voteService.getVotesByPoll(this.poll?.id).subscribe({
        next:(res:any)=>{
          this.votes = res.data?.$values || [];
          console.log(res.data.$values);
        },
        error: (err) => {
        console.error('Error fetching votes:', err);
      }
      })
    }
    
  }
  getOptionText(optionId: number): string {
    const option = this.poll?.options.find(opt => opt.id === optionId);
    return option ? option.text : 'Unknown Option';
  }

  barChartData  : ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };

   barChartOptions: ChartConfiguration<'bar'>['options'] = {
  responsive: true,
  indexAxis: 'y',
  scales: {
    x: {
      beginAtZero: true,
      grid: {
        display: false   
      }
    },
    y: {
      grid: {
        display: false 
      }
    }
  }
};


public pieChartData: ChartData<'pie', number[], string | string[]> = {
  labels:[],
  datasets: []
};

public pieChartOptions: ChartOptions<'pie'> = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
  }
};

  ngOnChanges(changes: SimpleChanges): void {
    if(this.poll){
      
      this.setBarChartData();
      this.setPieChartData();
    }
  }
  setBarChartData(){
    const labels = this.poll?.options.map((opt)=>opt.text);
    const data:number[] | undefined = this.poll?.options.map((opt)=>opt.voteCount);

    this.barChartData = {
      labels,
      datasets: [
        {
          data: data as number[] ,
          label: 'Votes',
          backgroundColor: '#6eadf3'
        }
      ]
    };
  }
  showChart(): boolean {
  const data = this.pieChartData?.datasets?.[0]?.data;
  return !!this.pieChartData?.labels?.length && !!data?.some(val => val > 0);
}
  setPieChartData(){
    const labels = this.poll?.options.map(opt => opt.text);
    const data =this.poll?.options.map(opt => opt.voteCount);
    this.pieChartData = {
      labels,
      datasets:[
        {
          data:data as number[],
          backgroundColor: ['#007bff', '#28a745', '#dc3545', '#ffc107']
        }
      ]
    }
  }

}
