import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-bar-chart',
  imports: [BaseChartDirective],
  templateUrl: './bar-chart.html',
  styleUrl: './bar-chart.css'
})
export class BarChart {
  @Input() barChartData: any;
  chartOptions = {
  responsive: true,
  scales: {
    x: {
      grid: {
        display: false,     // removes X grid lines
        drawBorder: false   // removes axis line
      },
      ticks: {
        display: true       // set to false to remove labels
      }
    },
    y: {
      grid: {
        display: false,     // removes Y grid lines
        drawBorder: false
      },
      ticks: {
        display: true
      }
    }
  },
  plugins: {
    legend: {
      display: false        // hide legend if needed
    }
  }
};

 
}
