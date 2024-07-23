import { Router } from 'express';
import { canAccess } from '../middlewares/can-access.middleware';
import { validateZodSchema } from '../middlewares/validate-zod-schema.middleware';
import {
  handleCreateApartment,
  handleDeleteApartment,
  handleGetApartments,
  handleUpdateApartment,
} from './apartment.controller';
import {
  apartmentCreateOrUpdateSchema,
  apartmentIdSchema,
} from './apartment.schema';

export const APARTMENT_ROUTER_ROOT = '/apartment';

const apartmentRouter = Router();

apartmentRouter.get('/', handleGetApartments);

apartmentRouter.post(
  '/',
  canAccess('roles', ['VENDOR', 'SUPER_ADMIN']),
  validateZodSchema({ body: apartmentCreateOrUpdateSchema }),
  handleCreateApartment,
);

apartmentRouter.patch(
  '/:id',
  canAccess('roles', ['VENDOR', 'SUPER_ADMIN']),
  validateZodSchema({
    body: apartmentCreateOrUpdateSchema,
    params: apartmentIdSchema,
  }),
  handleUpdateApartment,
);

apartmentRouter.delete(
  '/:id',
  canAccess('roles', ['VENDOR', 'SUPER_ADMIN']),
  validateZodSchema({
    params: apartmentIdSchema,
  }),
  handleDeleteApartment,
);

export default apartmentRouter;