export class PaginatedProductResponseDto<T> {
    product: T[]; // Array de jugadores (o cualquier otro tipo de datos)
    total: number; // Total de elementos en la base de datos
    currentPage: number; // Página actual
    totalPages: number; // Total de páginas
    limit: number; // Límite de elementos por página
  
    constructor(
      product: T[],
      total: number,
      currentPage: number,
      totalPages: number,
      limit: number,
    ) {
      this.product = product;
      this.total = total;
      this.currentPage = currentPage;
      this.totalPages = totalPages;
      this.limit = limit;
    }
  }