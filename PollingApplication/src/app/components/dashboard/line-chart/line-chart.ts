import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-line-chart',
  imports: [BaseChartDirective],
  templateUrl: './line-chart.html',
  styleUrl: './line-chart.css'
})
export class LineChart {
  @Input() lineChartData:any;
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
