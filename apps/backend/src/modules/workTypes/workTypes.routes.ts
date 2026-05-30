import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { workTypesController } from './workTypes.controller';

const router = Router();

// GET /api/work-types — справочник видов работ
router.get('/', asyncHandler(workTypesController.list));

export { router as workTypesRouter };
