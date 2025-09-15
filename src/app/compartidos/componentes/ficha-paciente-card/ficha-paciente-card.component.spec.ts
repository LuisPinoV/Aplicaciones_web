import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FichaPacienteCardComponent } from './ficha-paciente-card.component';

describe('FichaPacienteCardComponent', () => {
  let component: FichaPacienteCardComponent;
  let fixture: ComponentFixture<FichaPacienteCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FichaPacienteCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FichaPacienteCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
