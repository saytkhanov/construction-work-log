import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate';
import { workLogsController } from './workLogs.controller';
import {
  createWorkLogSchema,
  listWorkLogsQuerySchema,
  updateWorkLogSchema,
  workLogIdParamSchema,
} from './workLogs.schemas';

const router = Router();

// GET /api/work-logs?workTypeId=&dateFrom=&dateTo=
router.get('/', validate({ query: listWorkLogsQuerySchema }), asyncHandler(workLogsController.list));

// GET /api/work-logs/:id
router.get(
  '/:id',
  validate({ params: workLogIdParamSchema }),
  asyncHandler(workLogsController.getById),
);

// POST /api/work-logs
router.post('/', validate({ body: createWorkLogSchema }), asyncHandler(workLogsController.create));

// PATCH /api/work-logs/:id
router.patch(
  '/:id',
  validate({ params: workLogIdParamSchema, body: updateWorkLogSchema }),
  asyncHandler(workLogsController.update),
);

// DELETE /api/work-logs/:id
router.delete(
  '/:id',
  validate({ params: workLogIdParamSchema }),
  asyncHandler(workLogsController.remove),
);

export { router as workLogsRouter };
