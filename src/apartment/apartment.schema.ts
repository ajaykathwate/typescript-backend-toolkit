import validator from 'validator';
import z from 'zod';
import { cancellationPoliciesEnums } from '../drizzle/enums';

export const apartmentIdSchema = z.object({
  id: z
    .string({ required_error: 'ID is required' })
    .min(1)
    .refine((value) => validator.isAlphanumeric(value), 'ID must be valid')
    .transform(Number),
});

export const apartmentCreateOrUpdateSchema = z.object({
  name: z.string().max(255),
  coverPhotoUrl: z.string().nullable().optional(),
  video_url: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  address: z.string().max(255),
  city: z.string().max(100),
  state: z.string().max(100),
  zipCode: z.string().max(20),
  country: z.string().max(100),
  propertyPrice: z.number().positive().nonnegative().transform(String),
  numberOfRooms: z.number().int().positive().nonnegative(),
  numberOfBathrooms: z.number().int().positive().nonnegative(),
  numberOfBedrooms: z.number().int().positive().nonnegative(),
  numberOfPets: z.number().int().positive().nonnegative(),
  numberOfPersonsAllowed: z.number().int().positive().nonnegative(),
  petHosting: z.number().positive().nonnegative().transform(String),
  areaInSqft: z.number().int().positive().nonnegative(),
  bookingTypeId: z.number().int().positive().nonnegative(),
  discountTypeId: z
    .number()
    .int()
    .positive()
    .nonnegative()
    .nullable()
    .optional(),
  cancellationPolicies: z.array(z.enum(cancellationPoliciesEnums)).optional(),
  amenities: z.object({}).passthrough(),
  discountId: z.number().int().positive().nonnegative().nullable().optional(),
  updatedAt: z.string().optional(),
  createdAt: z.string().optional(),
});

export type ApartmentIdSchemaType = z.infer<typeof apartmentIdSchema>;
export type ApartmentCreateOrUpdateSchemaType = z.infer<
  typeof apartmentCreateOrUpdateSchema
>;
