import { prisma } from './prisma.js';

export async function getProjects(params?: { studentId?: string; departmentId?: string }) {
  return prisma.project.findMany(params ? { where: params } : undefined);
}

export async function getProjectById(id: string) {
  return prisma.project.findUnique({ id });
}

export async function createProject(data: {
  title: string;
  description: string;
  category: string;
  departmentId: string;
  studentId: string;
  deadline: string;
  techStack?: string;
}) {
  return prisma.project.create(data);
}
