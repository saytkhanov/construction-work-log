import type { Request, Response } from 'express';
import { workTypesService } from './workTypes.service';

export const workTypesController = {
  async list(_req: Request, res: Response) {
    const workTypes = await workTypesService.list();
    res.json(workTypes);
  },
};
