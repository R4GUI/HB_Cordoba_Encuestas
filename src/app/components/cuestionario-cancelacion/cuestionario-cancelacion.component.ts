import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EncuestasService } from '../../services/encuestas.service';

@Component({
  selector: 'app-cuestionario-cancelacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cuestionario-cancelacion.component.html',
  styleUrls: ['./cuestionario-cancelacion.component.scss']
})
export class CuestionarioCancelacionComponent implements OnInit {
  propuestaAjustada: boolean | null = null;
  atencionCumplio: boolean | null = null;
  encontroAlternativa: boolean | null = null;
  motivoPrincipal = '';
  yaRespondio = false;
  codigoAcceso = '';

  constructor(
    private encuestasService: EncuestasService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit(): Promise<void> {
    // Obtener código de acceso de la URL
    this.route.queryParams.subscribe(async params => {
      this.codigoAcceso = params['codigo'] || '';
      
      if (this.codigoAcceso) {
        // Si hay código, verificar si ya fue usado
        this.yaRespondio = await this.encuestasService.codigoYaUsado(this.codigoAcceso, 'cancelacion');
      } else {
        // Si no hay código, usar el método tradicional (localStorage)
        this.yaRespondio = this.encuestasService.yaRespondoCancelacion();
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.propuestaAjustada === null || this.atencionCumplio === null || 
        this.encontroAlternativa === null || !this.motivoPrincipal) {
      alert('Por favor, responda todas las preguntas');
      return;
    }

    try {
      if (this.codigoAcceso) {
        // Guardar con código
        await this.encuestasService.guardarRespuestaCancelacionConCodigo({
          propuestaAjustada: this.propuestaAjustada,
          atencionCumplio: this.atencionCumplio,
          encontroAlternativa: this.encontroAlternativa,
          motivoPrincipal: this.motivoPrincipal
        }, this.codigoAcceso);
      } else {
        // Guardar método tradicional
        await this.encuestasService.guardarRespuestaCancelacion({
          propuestaAjustada: this.propuestaAjustada,
          atencionCumplio: this.atencionCumplio,
          encontroAlternativa: this.encontroAlternativa,
          motivoPrincipal: this.motivoPrincipal
        });
      }

      this.router.navigate(['/gracias'], { queryParams: { tipo: 'cancelacion' } });
    } catch (error) {
      alert('Error al guardar la respuesta. Por favor, intente de nuevo.');
    }
  }
}