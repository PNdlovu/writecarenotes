import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ResidentService } from '../../services/residentService';
import { handleError } from '@/lib/errors';
import { ResidentCreateDTO, ResidentUpdateDTO } from '../../types';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const residentService = new ResidentService();

export const getResidentsHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const residents = await residentService.getResidents(req.query);
    return res.status(200).json(residents);
  } catch (error) {
    return handleError(error, res);
  }
};

export const getResidentHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { id } = req.query;
    const resident = await residentService.getResident(id as string);
    return res.status(200).json(resident);
  } catch (error) {
    return handleError(error, res);
  }
};

export const createResidentHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const data = req.body as ResidentCreateDTO;
    const resident = await residentService.createResident(data);
    return res.status(201).json(resident);
  } catch (error) {
    return handleError(error, res);
  }
};

export const updateResidentHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { id } = req.query;
    const data = req.body as ResidentUpdateDTO;
    const resident = await residentService.updateResident(id as string, data);
    return res.status(200).json(resident);
  } catch (error) {
    return handleError(error, res);
  }
};


