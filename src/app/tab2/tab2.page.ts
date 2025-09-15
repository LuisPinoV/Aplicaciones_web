import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/angular/standalone';
import { IonAccordion, IonAccordionGroup, IonItem} from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, 
    IonItem, IonAccordion, IonAccordionGroup,IonButton],
})
export class Tab2Page {

  constructor(private router: Router) {}

  goToAgendamientoMedico() {
  this.router.navigate(['/agendamiento-medico']);
  }

  goToAgendamientoNoMedico() {
  this.router.navigate(['/agendamiento-no-medico']);
  }

}
export class ExampleComponent {}