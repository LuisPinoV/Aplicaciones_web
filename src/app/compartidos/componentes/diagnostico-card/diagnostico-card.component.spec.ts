import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DiagnosticoCardComponent } from './diagnostico-card.component';

describe('DiagnosticoCardComponent', () => {
  let component: DiagnosticoCardComponent;
  let fixture: ComponentFixture<DiagnosticoCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [DiagnosticoCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DiagnosticoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
