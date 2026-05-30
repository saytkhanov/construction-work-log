import type { Request, Response } from 'express';
import { workLogsService } from './workLogs.service';
import type { CreateWorkLogInput, ListWorkLogsQuery, UpdateWorkLogInput } from './workLogs.schemas';

export const workLogsController = {
  async list(req: Request, res: Response) {
    const entries = await workLogsService.list(req.query as unknown as ListWorkLogsQuery);
    res.json(entries);
  },

  async getById(req: Request, res: Response) {
    const entry = await workLogsService.getById(Number(req.params.id));
    res.json(entry);
  },

  async create(req: Request, res: Response) {
    const entry = await workLogsService.create(req.body as CreateWorkLogInput);
    res.status(201).json(entry);
  },

  async update(req: Request, res: Response) {
    const entry = await workLogsService.update(Number(req.params.id), req.body as UpdateWorkLogInput);
    res.json(entry);
  },

  async remove(req: Request, res: Response) {
    await workLogsService.remove(Number(req.params.id));
    res.status(204).send();
  },
};
