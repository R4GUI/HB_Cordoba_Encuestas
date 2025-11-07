import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EncuestasService } from '../../services/encuestas.service';

@Component({
  selector: 'app-cuestionario-seguimiento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cuestionario-seguimiento.component.html',
  styleUrls: ['./cuestionario-seguimiento.component.scss']
})
export class CuestionarioSeguimientoComponent implements OnInit {
  aspectoDetiene = '';
  ajustarPropuesta: boolean | null = null;
  atencionEquipo = '';
  visitaLlamada: boolean | null = null;
  contacto24h: boolean | null = null;
  yaRespondio = false;

  // Formulario de contacto
  mostrarFormularioContacto = false;
  nombreCliente = '';
  telefonoCliente = '';

  constructor(
    private encuestasService: EncuestasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.yaRespondio = this.encuestasService.yaRespondioSeguimiento();
  }

  // Detectar cuando quiere que lo contacten
  onVisitaLlamadaChange(): void {
    this.mostrarFormularioContacto = this.visitaLlamada === true || this.contacto24h === true;
  }

  onContacto24hChange(): void {
    this.mostrarFormularioContacto = this.visitaLlamada === true || this.contacto24h === true;
  }

async onSubmit(): Promise<void> {
  if (!this.aspectoDetiene || this.ajustarPropuesta === null || 
      !this.atencionEquipo || this.visitaLlamada === null || this.contacto24h === null) {
    alert('Por favor, responda todas las preguntas');
    return;
  }

  if (this.mostrarFormularioContacto) {
    if (!this.nombreCliente.trim() || !this.telefonoCliente.trim()) {
      alert('Por favor, ingrese su nombre y teléfono para que podamos contactarle');
      return;
    }
    this.enviarWhatsApp();
  }

  try {
    await this.encuestasService.guardarRespuestaSeguimiento({
      aspectoDetiene: this.aspectoDetiene,
      ajustarPropuesta: this.ajustarPropuesta,
      atencionEquipo: this.atencionEquipo,
      visitaLlamada: this.visitaLlamada,
      contacto24h: this.contacto24h,
      nombreCliente: this.nombreCliente || undefined,
      telefonoCliente: this.telefonoCliente || undefined
    });

    this.router.navigate(['/gracias'], { queryParams: { tipo: 'seguimiento' } });
  } catch (error) {
    alert('Error al guardar la respuesta. Por favor, intente de nuevo.');
  }
}

  enviarWhatsApp(): void {
    const numeroEmpresa = '5212713977168'; // +52 271 3977168
    
    let mensaje = `*Solicitud de Contacto - Cuestionario de Seguimiento*\n\n`;
    mensaje += `👤 *Nombre:* ${this.nombreCliente}\n`;
    mensaje += `📱 *Teléfono:* ${this.telefonoCliente}\n\n`;
    mensaje += `*Respuestas del cuestionario:*\n`;
    mensaje += `• Aspecto que detiene: ${this.aspectoDetiene}\n`;
    mensaje += `• Ajustar propuesta: ${this.ajustarPropuesta ? 'Sí' : 'No'}\n`;
    mensaje += `• Atención del equipo: ${this.atencionEquipo}\n`;
    mensaje += `• Desea visita/llamada: ${this.visitaLlamada ? 'Sí' : 'No'}\n`;
    mensaje += `• Contacto en 24h: ${this.contacto24h ? 'Sí' : 'No'}\n`;

    const mensajeCodificado = encodeURIComponent(mensaje);
    const urlWhatsApp = `https://wa.me/${numeroEmpresa}?text=${mensajeCodificado}`;
    
    // Abrir WhatsApp en nueva pestaña
    window.open(urlWhatsApp, '_blank');
  }
}