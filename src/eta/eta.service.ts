import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios, { AxiosResponse } from 'axios';
import { Eta } from './entities/eta.entity';

@Injectable()
export class EtaService {
  private readonly logger = new Logger(EtaService.name);

  // Variables de configuración
  private readonly apiKey: string;
  private readonly velocidadKmh: number;
  private readonly minutosColchon: number;

  // Coordenadas del Local (Linares, Chile)
  private readonly localLat = -35.847041661085925;
  private readonly localLon = -71.5922484;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Eta)
    private readonly etaRepository: Repository<Eta>,
  ) {
    // Carga de variables de entorno con valores por defecto seguros
    this.apiKey = this.configService.get<string>('ORS_API_KEY', '');
    this.velocidadKmh = parseFloat(this.configService.get<string>('VELOCIDAD_KMH', '25.0'));
    this.minutosColchon = parseInt(this.configService.get<string>('MINUTOS_COLCHON', '10'));
  }

  /**
   * Log publico para errores capturados en el controller o capas superiores.
   */
  logError(message: string, error?: any) {
    if (error) {
      this.logger.error(`${message}: ${error.message || error}`, error.stack);
    } else {
      this.logger.error(message);
    }
  }

  /**
   * Método principal para calcular el ETA.
   * - Normaliza la dirección.
   * - Geocodifica.
   * - Calcula ruta (API o cálculo matemático).
   * - Guarda log en BD.
   * - Retorna el resultado simplificado.
   */
  async calculateEta(direccionUsuario: string, orderId?: number, customerId?: number): Promise<any> {

    // 1. Normalización de dirección
    let direccionNormalizada = direccionUsuario;
    if (!direccionNormalizada.toLowerCase().includes('linares')) direccionNormalizada += ', Linares';
    if (!direccionNormalizada.toLowerCase().includes('chile')) direccionNormalizada += ', Chile';

    this.logger.debug(`Calculando ETA para: ${direccionNormalizada}`);

    // Variables de estado
    let errorGeocode = null;
    let coordsCliente = null;
    let success = false;

    // 2. Geocodificación (Nominatim)
    try {
      coordsCliente = await this.geocodeAddress(direccionNormalizada);
      if (!coordsCliente) {
        errorGeocode = 'no_results';
      } else {
        success = true;
      }
    } catch (e) {
      errorGeocode = 'network_error';
      this.logger.error(`Error geocodificando: ${e.message}`);
    }

    // Variables de resultado
    let distKm = 0;
    let tiempoMin = 0;
    let motorRuta = 'none';
    let details: any = {};

    // 3. Cálculo de Ruta
    if (success && coordsCliente) {
      const { lat, lon } = coordsCliente;
      details = coordsCliente.details || {}; // Datos de ciudad/comuna

      // Intentar ruta real con OpenRouteService
      const rutaReal = await this.calcularRutaReal(this.localLat, this.localLon, lat, lon);

      if (rutaReal) {
        distKm = rutaReal.dist_km;
        tiempoMin = rutaReal.dur_min + this.minutosColchon;
        motorRuta = 'openrouteservice';
      } else {
        // Fallback: Haversine
        distKm = this.haversineDistanceKm(this.localLat, this.localLon, lat, lon);
        tiempoMin = this.estimarTiempoMinutos(distKm);
        motorRuta = 'haversine';
      }
    }

    // 4. Persistencia (Guardar log en DB)
    // Se ejecuta en segundo plano (sin await estricto que bloquee si falla la DB)
    this.saveLogToDb({
      address_raw: direccionUsuario,
      address_normalized: coordsCliente?.normalizedAddress || direccionNormalizada,
      lat: coordsCliente?.lat || null,
      lon: coordsCliente?.lon || null,
      distance_km: distKm,
      eta_min: tiempoMin,
      motor: motorRuta,
      geocode_success: success,
      geocode_error_code: errorGeocode,

      // Detalles extraídos de Nominatim
      city: details.city,
      state_region: details.state,
      country: details.country,
      postcode: details.postcode,
      barrio_sector: details.suburb,

      // Configuración usada
      velocidad_kmh: this.velocidadKmh,
      colchon_min: this.minutosColchon,

      // Referencias
      order_id: orderId || null,
      customer_id: customerId || null,

      // Metadatos (puedes pasarlos como argumentos si los necesitas exactos)
      client_ip: 'SYSTEM',
      user_agent: 'NestJS-Service'
    }).catch(err => this.logger.error('Error guardando log ETA en DB', err.message));

    // 5. Retorno de resultados
    if (!success) {
      // Retornamos un objeto indicando error pero sin lanzar excepción para no romper la venta
      return { error: 'No se pudo geocodificar la dirección' };
    }

    return {
      tiempo_min: tiempoMin,
      distancia_km: distKm,
      motor: motorRuta,
      direccion_normalizada: coordsCliente?.normalizedAddress || direccionNormalizada
    };
  }

  // ==========================================
  // MÉTODOS PRIVADOS (HELPERS)
  // ==========================================

  private async geocodeAddress(address: string): Promise<any | null> {
    const url = 'https://nominatim.openstreetmap.org/search';
    try {
      const response: AxiosResponse = await axios.get(url, {
        params: {
          q: address,
          format: 'json',
          limit: 1,
          addressdetails: 1, // Importante para obtener ciudad, comuna, etc.
        },
        headers: {
          'User-Agent': 'EBL-Delivery-System/1.0 (NestJS)',
        },
        timeout: 5000, // Timeout de 5s para no colgar el servidor
      });

      const data = response.data;
      if (!data || data.length === 0) return null;

      const result = data[0];
      const addr = result.address || {};

      return {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
        raw: result,
        normalizedAddress: result.display_name,
        details: {
          city: addr.city || addr.town || addr.village || null,
          state: addr.state || null,
          country: addr.country || null,
          postcode: addr.postcode || null,
          suburb: addr.suburb || addr.neighbourhood || null,
        }
      };
    } catch (e) {
      throw e; // Relanzamos para manejar el código de error arriba
    }
  }

  private async calcularRutaReal(lat1: number, lon1: number, lat2: number, lon2: number): Promise<{ dist_km: number, dur_min: number } | null> {
    if (!this.apiKey) {
      this.logger.debug('Ruta: ORS_API_KEY no configurada o vacía, usando Haversine.');
      return null;
    }

    const url = `https://api.openrouteservice.org/v2/directions/driving-car`;

    try {
      const response: AxiosResponse = await axios.get(url, {
        params: {
          api_key: this.apiKey,
          start: `${lon1},${lat1}`,
          end: `${lon2},${lat2}`,
        },
        headers: {
          'Accept': 'application/geo+json;charset=UTF-8',
        },
        timeout: 8000,
      });

      const data = response.data;
      const summary = data?.features?.[0]?.properties?.summary;

      if (!summary || summary.distance === undefined || summary.duration === undefined) {
        return null;
      }

      const distKm = summary.distance / 1000; // metros a km
      const durMin = Math.ceil(summary.duration / 60); // segundos a minutos

      return { dist_km: distKm, dur_min: durMin };

    } catch (e) {
      this.logger.warn(`Fallo al consultar OpenRouteService: ${e.message}`);
      return null;
    }
  }

  private haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const earthRadius = 6371; // km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadius * c;
  }

  private estimarTiempoMinutos(km: number): number {
    // Evitar división por cero
    const velocidad = this.velocidadKmh > 0 ? this.velocidadKmh : 25;
    const horas = km / velocidad;
    const min = horas * 60;
    return Math.ceil(min + this.minutosColchon);
  }

  private async saveLogToDb(data: Partial<Eta>): Promise<void> {
    try {
      const logEntry = this.etaRepository.create(data);
      await this.etaRepository.save(logEntry);
    } catch (error) {
      // Solo logueamos el error, no lanzamos excepción para no interrumpir el flujo principal
      this.logger.error(`Error guardando log en base de datos: ${error.message}`);
    }
  }
}