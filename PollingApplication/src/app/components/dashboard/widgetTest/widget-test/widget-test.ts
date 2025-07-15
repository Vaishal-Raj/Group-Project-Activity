import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ButtonDirective,
  ColComponent,
  DropdownComponent,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  RowComponent,
  TemplateIdDirective,
  WidgetStatAComponent
} from '@coreui/angular';
import {
  cilAccountLogout, cilArrowTop, cilList, cilNotes,
  cilOptions, cilPeople, cilPlus, cilSpeedometer,
  cilChartPie, cilTask, cilThumbUp, cilUser
} from '@coreui/icons';
import { IconDirective, IconSetService } from '@coreui/icons-angular';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../../theme';

@Component({
  selector: 'app-widget-test',
  standalone: true,
  imports: [
    RowComponent,
    ColComponent,
    WidgetStatAComponent,
    TemplateIdDirective,
    // IconDirective,
    // DropdownComponent,
    // ButtonDirective,
    // DropdownToggleDirective,
    // DropdownMenuDirective,
    // DropdownItemDirective,
    // RouterLink,
    ChartjsComponent
  ],
  templateUrl: './widget-test.html',
  styleUrl: './widget-test.css'
})
export class WidgetTest implements OnInit, OnDestroy {
  @Input() lineChartData: any;
  @Input() allPoles : any;
  @Input() myPolls: any;
  icons = { cilOptions, cilArrowTop };

  
  mode:boolean=false;
  data: any = {};
  options: any = {};

  private themeSub!: Subscription;

  constructor(
    private iconSet: IconSetService,
    private themeService: ThemeService
  ) {
    this.iconSet.icons = {
      cilChartPie, cilTask, cilThumbUp, cilUser,
      cilList, cilSpeedometer, cilAccountLogout, cilPlus, cilNotes, cilPeople
    };
  }

  ngOnInit(): void {
    this.themeSub = this.themeService.darkMode$.subscribe((isDarkMode) => {
      this.mode=isDarkMode;
      this.setupChart(isDarkMode);
    });

    this.setupChart(this.themeService.isDarkMode());
  }

  setupChart(isDark: boolean): void {
    const dataPoints = this.lineChartData.datasets[0].data;
    const yMin = Math.min(...dataPoints) - 5;
    const yMax = Math.max(...dataPoints) + 5;
    console.log('Dark theme ? ',isDark);
    const color = isDark ? '#ffffff' : '#3b82f6'; 
    const gridColor = isDark ? '#ffffff33' : '#00000033';
    const lineColor = isDark ? 'grey' : 'white'; 
    this.data = {
      labels: this.lineChartData.labels,
      datasets: [
        {
          label: 'No. of Polls',
          data: dataPoints,
          borderColor: 'white',
          pointBackgroundColor: lineColor,
          pointHoverBorderColor: 'blue',
          backgroundColor: 'transparent',
          tension: 0.4
        }
      ]
    };

    this.options = {
      plugins: {
        legend: {
          display: false,
          labels: {
            color: color
          }
        }
      },
      maintainAspectRatio: true,
      scales: {
        x: {
          grid: {
            display: false,
            drawBorder: false,
            color: gridColor
          },
          ticks: {
            display: false,
            color: color
          }
        },
        y: {
          min: yMin,
          max: yMax,
          display: false,
          grid: {
            display: false,
            color: gridColor
          },
          ticks: {
            display: false,
            color: color
          }
        }
      },
      elements: {
        line: {
          borderWidth: 1,
          tension: 0.4
        },
        point: {
          radius: 4,
          hitRadius: 10,
          hoverRadius: 4
        }
      }
    };

    console.log('Updated chart for theme:', isDark ? 'dark' : 'light');
  }

  ngOnDestroy(): void {
    if (this.themeSub) {
      this.themeSub.unsubscribe();
    }
  }
}
