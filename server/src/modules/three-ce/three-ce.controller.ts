import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ThreeCEDataDto } from './dto/threeCEdataDto.dto';
import { ThreeCEDto } from './dto/threeCEDto.dto';
import { ThreeCeService } from './three-ce.service';

@Controller('three-ce')
export class ThreeCeController {

    constructor(
        private threeCEService: ThreeCeService
    ) {}

    @Get('/api/three')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
      status: HttpStatus.OK,
      type: ThreeCEDto,
      description: 'Get Watson session Id',
    })
    async getThreeCEData(): Promise<ThreeCEDataDto> {
      return await this.threeCEService.postDescribeProduct('cow goes moo');
    }
    
}
