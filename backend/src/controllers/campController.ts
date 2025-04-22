// camp controller
import { Request, Response } from "express";
import CampModel from "../models/Camp";
import { ICamp } from "../types/campTypes";

//adding camps
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const addCamp = async (req: Request<{}, {}, ICamp>, res: Response): Promise<void> => {
    const { type, year, location, description } = req.body;
    const camp: ICamp = { type, year, location, description };
    if (!type || !year || !location || !description) {
        res.status(400).send('camp is required');
        return;
    }

    try {
        const c = new CampModel(camp);
        await c.save();
        res.send(`Camp saved: ${c}`);
    } catch (error) {
        console.error('Error saving camp:', error);
        res.status(500).send('Error saving camp');
    }
};
