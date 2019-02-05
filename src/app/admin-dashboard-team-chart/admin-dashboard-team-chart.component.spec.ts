import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDashboardTeamChartComponent } from './admin-dashboard-team-chart.component';

describe('AdminDashboardTeamChartComponent', () => {
  let component: AdminDashboardTeamChartComponent;
  let fixture: ComponentFixture<AdminDashboardTeamChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminDashboardTeamChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDashboardTeamChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
