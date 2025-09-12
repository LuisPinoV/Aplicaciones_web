import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgendamientoMedicoPage } from './agendamiento-medico.page';

describe('AgendamientoMedicoPage', () => {
  let component: AgendamientoMedicoPage;
  let fixture: ComponentFixture<AgendamientoMedicoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AgendamientoMedicoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
