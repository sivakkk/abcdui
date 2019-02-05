import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
declare let d3:any;

@Component({
  selector: 'app-admin-dashboard-user-chart',
  templateUrl: './admin-dashboard-user-chart.component.html',
  styleUrls: [
    '../../../node_modules/nvd3/build/nv.d3.css'
  ],
  encapsulation: ViewEncapsulation.None
})
export class AdminDashboardUserChartComponent implements OnInit {
    @Input() adminData : any;
    options;
    data;
    ngOnInit() {
      this.options = {
        chart: {
          type: 'multiBarChart',
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
          showControls: false,
          valueFormat: function(d){
            return d3.format(',.4f')(d);
          },
          stacked: true,
          duration: 500,
          xAxis: {
            axisLabel: 'Team Users'
          },
          yAxis: {
            axisLabel: 'Quantity',
            axisLabelDistance: -10
          }
        }
      }
      this.data = [
        {
          key: "Total Classified",
          values: [
          ]
        },
        {
          key: "Time Taken",
          values: [
          ]
        },

      ];

      if(this.adminData){
        this.createDataObject();
      }
    }

    createDataObject() {
      this.adminData.documents.map(user => {
        this.data[0].values.push(
          {
            x : user.NAME,
            y : user.TOTAL_IMAGES
          });
        this.data[1].values.push({
            x:  user.NAME,
           y : user.TOTAL_TIME_BY_USER / 3600
        });
      });
    }

  }
