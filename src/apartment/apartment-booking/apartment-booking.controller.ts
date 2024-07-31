import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../../utils/api.utils';
import {
  ApartmentBookingCreateOrUpdateSchemaType,
  ApartmentBookingIdSchemaType,
  ConfirmApartmentBookingSchema,
} from './apartment-booking.schema';
import {
  createApartmentBooking,
  deleteApartmentBooking,
  getApartmentBooking,
  getApartmentBookingSummary,
} from './apartment-booking.service';

export const handleGetApartmentBookings = async (_: Request, res: Response) => {
  try {
    const result = await getApartmentBooking();

    return successResponse(res, undefined, result);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleCreateApartmentBooking = async (
  req: Request<never, never, ConfirmApartmentBookingSchema>,
  res: Response,
) => {
  try {
    const newApartmentBooking = await createApartmentBooking(req.body);

    return successResponse(
      res,
      'ApartmentBooking created successfully',
      newApartmentBooking,
    );
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleDeleteApartmentBooking = async (
  req: Request<ApartmentBookingIdSchemaType, never, never>,
  res: Response,
) => {
  try {
    await deleteApartmentBooking({ id: req.params.id });

    return successResponse(res, 'ApartmentBooking deleted successfully');
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleGetApartmentBookingSummary = async (
  req: Request<never, never, ApartmentBookingCreateOrUpdateSchemaType>,
  res: Response,
) => {
  try {
    const newApartmentBooking = await getApartmentBookingSummary(req.body);

    return successResponse(
      res,
      'Apartment Booking created successfully',
      newApartmentBooking,
    );
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};