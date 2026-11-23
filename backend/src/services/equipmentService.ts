import { prisma } from './prisma.js';

export interface EquipmentFilterParams {
  search?: string;
  departmentId?: string;
  categoryId?: string;
  laboratoryId?: string;
  status?: string;
  sortBy?: 'name' | 'availability' | 'department' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export async function getEquipmentList(params: EquipmentFilterParams = {}) {
  const {
    search,
    departmentId,
    categoryId,
    laboratoryId,
    status,
    sortBy = 'name',
    sortOrder = 'asc',
  } = params;

  const whereClause: any = {};

  if (departmentId) whereClause.departmentId = departmentId;
  if (categoryId) whereClause.categoryId = categoryId;
  if (laboratoryId) whereClause.laboratoryId = laboratoryId;
  if (status) whereClause.status = status;
  if (search) whereClause.search = search;

  return prisma.equipment.findMany({
    where: whereClause,
    orderBy: { [sortBy]: sortOrder },
  });
}

export async function getEquipmentById(id: string) {
  return prisma.equipment.findUnique({ id });
}
