import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ConsultasCardComponent } from './consultas-card.component';

describe('ConsultasCardComponent', () => {
  let component: ConsultasCardComponent;
  let fixture: ComponentFixture<ConsultasCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ConsultasCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultasCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
