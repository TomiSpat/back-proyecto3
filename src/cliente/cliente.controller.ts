import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Controller('cliente')
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createClienteDto: CreateClienteDto) {
    return this.clienteService.create(createClienteDto);
  }

  @Get()
  findAll(@Query() filter?: any) {
    return this.clienteService.findAllSimplified(filter);
  }

  @Get('search')
  findBy(@Query() filter: any) {
    return this.clienteService.findBy(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clienteService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClienteDto: UpdateClienteDto) {
    return this.clienteService.update(id, updateClienteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  softDelete(@Param('id') id: string) {
    return this.clienteService.softDelete(id);
  }
}
