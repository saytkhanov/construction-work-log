import { Router } from 'express';
import { workTypesRouter } from './modules/workTypes/workTypes.routes';
import { workLogsRouter } from './modules/workLogs/workLogs.routes';

const apiRouter = Router();

apiRouter.use('/work-types', workTypesRouter);
apiRouter.use('/work-logs', workLogsRouter);

export { apiRouter };
