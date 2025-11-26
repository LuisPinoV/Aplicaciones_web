import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgendamientoNoMedicoPage } from './agendamiento-no-medico.page';

describe('AgendamientoNoMedicoPage', () => {
  let component: AgendamientoNoMedicoPage;
  let fixture: ComponentFixture<AgendamientoNoMedicoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AgendamientoNoMedicoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
