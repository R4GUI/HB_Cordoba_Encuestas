import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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

  constructor(
    private encuestasService: EncuestasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.yaRespondio = this.encuestasService.yaRespondoCancelacion();
  }

  onSubmit(): void {
    if (this.propuestaAjustada === null || this.atencionCumplio === null || 
        this.encontroAlternativa === null || !this.motivoPrincipal) {
      alert('Por favor, responda todas las preguntas');
      return;
    }

    this.encuestasService.guardarRespuestaCancelacion({
      propuestaAjustada: this.propuestaAjustada,
      atencionCumplio: this.atencionCumplio,
      encontroAlternativa: this.encontroAlternativa,
      motivoPrincipal: this.motivoPrincipal
    });

    this.router.navigate(['/gracias'], { queryParams: { tipo: 'cancelacion' } });
  }
}
