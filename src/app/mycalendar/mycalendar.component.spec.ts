import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MycalendarComponent } from './mycalendar.component';

describe('MycalendarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        MycalendarComponent
      ],
    }).compileComponents();
  });
});
