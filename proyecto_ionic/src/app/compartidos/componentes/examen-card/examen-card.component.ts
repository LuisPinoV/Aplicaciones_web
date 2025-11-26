import { Component, Input, OnInit, ChangeDetectorRef, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ActionSheetController, AlertController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ApiService, Examen } from 'src/app/services/api';

@Component({
  selector: 'app-examen-card',
  templateUrl: './examen-card.component.html',
  styleUrls: ['./examen-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExamenCardComponent implements OnInit {
  @Input() examen?: Examen;
  @Input() index?: number;
  @Output() onDelete = new EventEmitter<number>();
  @Output() onEdit = new EventEmitter<void>();
  
  examenesDisponibles: any[] = [];
  mostrarResultados = false;

  editando = false;
  editable: any = {};
  resultadosEditables: any[] = [];
  examenEliminado = false;
  private examenesDisponiblesCargados = false;

  constructor(
    private api: ApiService,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private cdRef: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    if (!this.examenesDisponiblesCargados) {
      this.examenesDisponibles = await this.api.obtenerExamenesDisponibles();
      this.examenesDisponiblesCargados = true;
    }
    
    if (!this.examen) {
      console.error('Examen no recibido');
      return;
    }

    if (this.examen?.idFichaMedicaExamen) {
      this.api.obtenerExamenPorId(this.examen.idFichaMedicaExamen).then((examenCompleto) => {
        if (examenCompleto?.resultadosObtenidos) {
          this.examen!.resultadosObtenidos = examenCompleto.resultadosObtenidos;
          this.cdRef.detectChanges();
        }
      });
    }

    if (this.examen?.fechaExamen) {
      this.examen.fechaExamen = new Date(this.examen.fechaExamen).toISOString();
    }
    
    this.cdRef.markForCheck();
  }

  getTiempoTranscurrido(): string {
    if (!this.examen?.fechaExamen) return '';
    const fecha = new Date(this.examen.fechaExamen);
    const hoy = new Date();
    const diff = hoy.getTime() - fecha.getTime();
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const meses = Math.floor(dias / 30);
    const años = Math.floor(dias / 365);
    if (años > 0) return `Hace ${años} año${años > 1 ? 's' : ''}`;
    if (meses > 0) return `Hace ${meses} mes${meses > 1 ? 'es' : ''}`;
    if (dias > 0) return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
    return 'Hoy';
  }

  formatDateForInput(date: string): string {
    const formattedDate = new Date(date);
    return formattedDate.toISOString().split('T')[0];
  }

  toggleResultados() {
    this.mostrarResultados = !this.mostrarResultados;
    this.cdRef.markForCheck();
  }

  getResultadoEsperado(resultadoObtenido: any) {
    if (!this.examen?.resultadosEsperados) return null;
    return this.examen.resultadosEsperados.find(
      esperado => esperado.nombre === resultadoObtenido.nombre && 
                  esperado.formato === resultadoObtenido.formato
    );
  }

  calcularDesviacion(resultadoObtenido: any): number {
    const esperado = this.getResultadoEsperado(resultadoObtenido);
    if (!esperado || esperado.valor === 0) return 0;
    
    const desviacion = Math.abs(resultadoObtenido.valor - esperado.valor);
    const porcentaje = (desviacion / esperado.valor) * 100;
    return porcentaje;
  }

  getColorByDeviation(resultado: any): string {
    const desviacion = this.calcularDesviacion(resultado);
    
    if (desviacion === 0) return '#10b981';
    if (desviacion <= 5) return '#34d399';
    if (desviacion <= 10) return '#84cc16';
    if (desviacion <= 15) return '#fbbf24';
    if (desviacion <= 25) return '#fb923c';
    if (desviacion <= 35) return '#f97316';
    if (desviacion <= 50) return '#ef4444';
    return '#dc2626';
  }

  getBarWidth(resultado: any): number {
    const esperado = this.getResultadoEsperado(resultado);
    if (!esperado) return 0;
    
    const desviacion = this.calcularDesviacion(resultado);
    const perfeccion = Math.max(0, 100 - desviacion);
    return perfeccion;
  }

  isValorMayorQueEsperado(resultado: any): boolean {
    const esperado = this.getResultadoEsperado(resultado);
    if (!esperado) return false;
    return resultado.valor > esperado.valor;
  }

  getComparacionTexto(resultado: any): string {
    const esperado = this.getResultadoEsperado(resultado);
    if (!esperado) return '';
    
    if (resultado.valor === esperado.valor) return 'Valor exacto';
    
    const diferencia = Math.abs(resultado.valor - esperado.valor);
    const direccion = resultado.valor > esperado.valor ? 'mayor' : 'menor';
    
    return `${diferencia.toFixed(1)} ${direccion}`;
  }

  getResultadoStatus(resultado: any): string {
    const desviacion = this.calcularDesviacion(resultado);
    
    if (desviacion === 0) return 'perfect';
    if (desviacion <= 10) return 'good';
    if (desviacion <= 25) return 'warning';
    return 'critical';
  }

  getStatusIcon(resultado: any): string {
    const status = this.getResultadoStatus(resultado);
    
    switch(status) {
      case 'perfect': return 'checkmark-circle';
      case 'good': return 'checkmark-circle-outline';
      case 'warning': return 'warning-outline';
      case 'critical': return 'alert-circle';
      default: return 'help-circle-outline';
    }
  }

  getStatusText(resultado: any): string {
    const desviacion = this.calcularDesviacion(resultado);
    
    if (desviacion === 0) return 'Perfecto';
    if (desviacion <= 5) return 'Excelente';
    if (desviacion <= 10) return 'Bueno';
    if (desviacion <= 15) return 'Aceptable';
    if (desviacion <= 25) return 'Atención';
    if (desviacion <= 35) return 'Precaución';
    if (desviacion <= 50) return 'Alerta';
    return 'Crítico';
  }

  async abrirOpciones() {
    const sheet = await this.actionSheetCtrl.create({
      header: 'Opciones',
      buttons: [
        {
          text: 'Editar examen',
          icon: 'create-outline',
          handler: () => this.iniciarEdicion(),
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          icon: 'trash-outline',
          handler: () => this.confirmarEliminacion(),
        },
        {
          text: 'Cancelar',
          role: 'cancel',
        },
      ],
    });
    await sheet.present();
  }

  iniciarEdicion() {
    if (!this.examen) return;

    this.editable = {
      idExamen: this.examen?.idExamen,
      descripcionFicha: this.examen?.descripcionFicha || '',
      fechaExamen: this.examen?.fechaExamen
        ? this.formatDateForInput(this.examen.fechaExamen)
        : new Date().toISOString().split('T')[0],
    };

    this.resultadosEditables =
      this.examen?.resultadosObtenidos?.map((r) => ({
        ...r,
        valor: r.valor ?? 0,
      })) || [];

    this.editando = true;

    setTimeout(() => {
      this.cdRef.detectChanges();
    }, 50);
  }

  async onExamenChange() {
    if (!this.editable.idExamen) return;

    try {
      const resultadosEsperados = await this.api.getResultadosEsperadosByExamen(this.editable.idExamen);
      
      this.resultadosEditables = resultadosEsperados?.map((esperado: any) => ({
        idResultadoEsperado: esperado.idResultadoEsperado,
        nombre: esperado.nombre,
        formato: esperado.formato,
        valor: 0
      })) || [];

      this.cdRef.markForCheck();
    } catch (error) {
      console.error('Error al cargar resultados esperados del examen:', error);
      this.resultadosEditables = [];
      this.cdRef.markForCheck();
    }
  }

  cancelarEdicion() {
    this.editando = false;
    this.resultadosEditables = [];
    this.cdRef.markForCheck();
  }

  async guardarCambios() {
    if (!this.examen?.idFichaMedicaExamen) return;

    try {
      const datosActualizados = {
        ...this.editable,
        resultadosObtenidos: this.resultadosEditables.filter(
          (r) => r.valor !== null && r.valor !== undefined
        ),
      };

      await this.api.actualizarFichaExamen(this.examen.idFichaMedicaExamen, datosActualizados);

      const examenActualizado = await this.api.obtenerExamenPorId(this.examen.idFichaMedicaExamen);
      this.examen = { ...examenActualizado };

      this.resultadosEditables = this.examen.resultadosObtenidos || [];

      const toast = await this.toastCtrl.create({
        message: 'Examen actualizado correctamente',
        duration: 2000,
        color: 'success',
      });
      await toast.present();

      this.onEdit.emit();

      this.editando = false;
      this.cdRef.detectChanges();
    } catch (err) {
      console.error('Error al guardar cambios:', err);
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo actualizar el examen.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  async confirmarEliminacion() {
    if (!this.examen) {
      console.error('El examen no está disponible para eliminar');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Eliminar examen',
      message: '¿Seguro que deseas eliminar este examen?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              if (!this.examen!.idFichaMedicaExamen) return;

              this.examenEliminado = true;
              this.cdRef.markForCheck();

              setTimeout(async () => {
                await this.api.eliminarFichaExamen(this.examen!.idFichaMedicaExamen);
                
                this.onDelete.emit(this.examen!.idFichaMedicaExamen);
                
                const event = new CustomEvent('examenEliminado', { 
                  detail: this.examen!.idFichaMedicaExamen 
                });
                window.dispatchEvent(event);
              }, 0);
            } catch (err) {
              console.error('Error al eliminar examen:', err);
              this.examenEliminado = false;
              this.cdRef.markForCheck();
            }
          },
        },
      ],
    });
    await alert.present();
  }
}