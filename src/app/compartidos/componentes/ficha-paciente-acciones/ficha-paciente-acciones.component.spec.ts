import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FichaPacienteAccionesComponent } from './ficha-paciente-acciones.component';

describe('FichaPacienteAccionesComponent', () => {
  let component: FichaPacienteAccionesComponent;
  let fixture: ComponentFixture<FichaPacienteAccionesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FichaPacienteAccionesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FichaPacienteAccionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
