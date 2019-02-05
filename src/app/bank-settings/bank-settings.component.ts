import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-bank-settings',
  templateUrl: './bank-settings.component.html',
  styleUrls: ['./bank-settings.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BankSettingsComponent implements OnInit {
    @Input() tab:string;
    @Input() user;

  constructor() { }

  ngOnInit() {
  }

}
