import { Component, OnInit, Input, ViewEncapsulation, SimpleChanges, SimpleChange, OnChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
declare let d3: any;

@Component({
  selector: 'app-admin-dashboard-team-chart',
  templateUrl: './admin-dashboard-team-chart.component.html',
  styleUrls: [
    '../../../node_modules/nvd3/build/nv.d3.css'
  ],
  encapsulation: ViewEncapsulation.None,
})
export class AdminDashboardTeamChartComponent implements OnInit {
  config: any;
  options: any;
  data: any;
  @Input() teamDetails : any;
  constructor() { }

  ngOnInit() {
    this.config = {
      deepWatchData: true,
      deepWatchDataDepth: 1
    }

    this.options = {
      chart: {
        type: 'lineWithFocusChart',
        height : 400,
        width : 400,
        margin : {
          top: 20,
          right: 20,
          bottom: 50,
          left: 55
        },
        x: function(d){return d.x;},
        y: function(d){return d.y;},
        showValues: true,
        showLegend: false,
        duration: 500,
        xAxis: {
          axisLabel: 'Time',
          tickFormat: (d) => {
            return d3.time.format('%B %d, %Y')(new Date(d));
          }
        },
        x2Axis: {
          tickFormat: (d) => {
            return d3.time.format('%B %d, %Y')(new Date(d));
          }
        },
        yAxis: {
          axisLabel: 'Images',
          axisLabelDistance: -5,
          tickFormat: (d) => {
            return d3.format(',.0f')(d);
          }
        }
      }
    }

    this.data = [

    ]


    if(this.teamDetails){
      this.getTeamData();
    }
  }

  ngOnChanges(changes) {
    const change: SimpleChange = changes.teamDetails;

    this.teamDetails = change.currentValue;
    this.getTeamData();
  }

  getTeamData = function() {
    if(this.teamDetails) {
      this.data = new Array();
      this.data.push({});
      this.data[0]['key'] = "Users and their progress";
      this.data[0]['values'] = new Array();
      var tempCount = 0
      this.teamDetails.map(imageData => {
        this.data[0].values.push({
          x : imageData._id,
          y : tempCount + imageData.COUNT
        })
        tempCount = tempCount + imageData.COUNT;
      })
    }

  }

}
