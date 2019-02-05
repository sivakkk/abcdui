import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDashboardUserChartComponent } from './admin-dashboard-user-chart.component';

describe('AdminDashboardUserChartComponent', () => {
  let component: AdminDashboardUserChartComponent;
  let fixture: ComponentFixture<AdminDashboardUserChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminDashboardUserChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDashboardUserChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
