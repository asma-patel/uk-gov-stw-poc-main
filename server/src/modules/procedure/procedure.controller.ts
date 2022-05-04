import { Controller, Get, HttpCode, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { createReadStream, readFile, readFileSync } from 'fs';
import { join } from 'path';
import { Log } from '../../providers/utils/Log';
import readXlsxFile from 'read-excel-file/node';
import { CorrelationMatrix, Procedure, ProcedureCodes } from './dto/procedure';

@Controller()
export class ProcedureController {
    private log = new Log('ThreeCEService').api();

    @Get('/api/correlationMatrix/:id')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        type: Procedure,
        description: ''
    })
    async getProcedure(@Param('id') id: string): Promise<CorrelationMatrix[]> {
        const procedures: Procedure[] = JSON.parse(readFileSync('./CLEOJSON.json').toString())
        let correlationMatrix: CorrelationMatrix[];
        if(id.length != 4) {
            throw new HttpException('The apc id provided needs to be 4 digits long', HttpStatus.NOT_ACCEPTABLE);
        }

        let chosenProcedureCodes: ProcedureCodes[];

        for (let index = 0; index < procedures.length; index++) {
            if (procedures[index].procedure == id.substring(0, 2)) {
                chosenProcedureCodes = procedures[index].codes;
            }
        }

        for (let index = 0; chosenProcedureCodes.length; index++) {
            this.log.info(chosenProcedureCodes[index]);
            if (chosenProcedureCodes[index].prevProcedure == id.substring(2, 4)) {
                correlationMatrix = chosenProcedureCodes[index].correlationMatrix;
                break;
            }
        }
        return correlationMatrix;
    }
}
