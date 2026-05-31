// src/eta/eta.controller.ts

import { Body, Controller, Post } from '@nestjs/common';
import { EtaService } from './eta.service';

// DTO para tipar la entrada de datos
class EtaRequestDto {
  direccion: string;
  order_id?: number;      // Opcional, como en el PHP
  customer_id?: number;   // Opcional
}

// Interfaz para la respuesta que se envía al Frontend
interface EtaResponse {
  direccion: string;
  direccion_normalizada: string;
  lat: number;
  lon: number;
  distancia_km: number;
  tiempo_min: number;
  motor: 'openrouteservice' | 'haversine';
  display_name: string | null;
}

@Controller('eta')
export class EtaController {
  constructor(private readonly etaService: EtaService) {}

  @Post('calculate')
  async calculateEta(@Body() body: EtaRequestDto): Promise<EtaResponse | { error: string }> {
    const { direccion, order_id, customer_id } = body;

    if (!direccion || direccion.trim() === '') {
      return { error: 'Por favor, ingresa una dirección (calle, número, comuna).' };
    }
    
    // El servicio maneja toda la lógica (geocodificación, ruta, fallback, persistencia)
    try {
        const result = await this.etaService.calculateEta(direccion, order_id, customer_id);
        
        // Si el resultado incluye un error (ej. no_results), lo retornamos.
        if (result.error) {
            return { error: result.error };
        }
        
        // Retornamos el resultado de ETA (similar al $resultado del PHP)
        return result as EtaResponse;

    } catch (e) {
        // Manejo de errores de red o servidor no controlados
        this.etaService.logError('Error general en calculateEta', e);
        return { error: 'Ocurrió un error inesperado en el servidor.' };
    }
  }
}