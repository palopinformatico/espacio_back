import { Injectable } from '@nestjs/common';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

@Injectable()
export class CacheService {
    private cache = new Map<string, CacheEntry<any>>();
    private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos

    /**
     * Obtiene un valor del caché
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        const now = Date.now();
        const isExpired = now - entry.timestamp > entry.ttl;

        if (isExpired) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    /**
     * Guarda un valor en el caché
     */
    set<T>(key: string, data: T, ttl?: number): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl: ttl || this.DEFAULT_TTL,
        });
    }

    /**
     * Invalida una entrada del caché
     */
    invalidate(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Invalida todas las entradas que coincidan con un patrón
     */
    invalidatePattern(pattern: string): void {
        const regex = new RegExp(pattern);
        const keysToDelete: string[] = [];

        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => this.cache.delete(key));
    }

    /**
     * Limpia todo el caché
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Limpia entradas expiradas
     */
    cleanup(): void {
        const now = Date.now();
        const keysToDelete: string[] = [];

        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => this.cache.delete(key));
    }

    /**
     * Retorna estadísticas del caché
     */
    getStats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
        };
    }
}
