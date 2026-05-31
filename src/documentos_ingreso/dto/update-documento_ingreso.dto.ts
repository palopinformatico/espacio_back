import { PartialType } from '@nestjs/mapped-types';
import { CreateDocumentoIngresoDto } from './create-documento_ingreso.dto';

export class UpdateDocumentoIngresoDto extends PartialType(CreateDocumentoIngresoDto) { }
