import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const path = request.route.path;

    // Rutas públicas que cualquiera puede acceder
    const publicRoutes = [
      '/user',
      '/home',
      '/menu',
      '/about',
      '/contact'
    ];
    if (publicRoutes.includes(path)) return true;

    // Admin solo /admin
    if (path.startsWith('/admin')) return user?.role === 'admin';

    // Garzon o admin solo /garzon
    if (path.startsWith('/garzon') || path.startsWith('/mesa')) {
      return user && ['garzon', 'admin'].includes(user.role);
    }

    // Resto de rutas protegidas: solo usuarios logueados
    return !!user;
  }
}
