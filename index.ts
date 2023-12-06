import { Request, Response } from "express"
const Prisma = require('@prisma/client')
const prisma = new Prisma.PrismaClient();
const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())

interface Recycle {
    id: number;
    user_id: string;
    plastic: number;
    aluminumCans: number;
    envelope: number;
    uht: number;
    glass: number;
    cardboard: number;
    otherPaper: number;
}

app.get('/recycle', async (req: Request, res: Response) => {
    try {
        const sumRecycling = await prisma.recycle.aggregate({
            _sum: {
                plastic: true,
                aluminumCans: true,
                envelope: true,
                uht: true,
                glass: true,
                cardboard: true,
                otherPaper: true,
            },
        });
        const sumResult = Object.fromEntries(
            Object.entries(sumRecycling._sum).map(([key, value]) => [key, value])
        );

        res.json({ sumResult });
    } catch (error) {
        console.error('Error fetching sum of recycling items:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/getProduct', async (req: Request, res: Response) => {
    try {
        const response = await prisma.Product.findMany();

        res.json(response);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(process.env.PORT, () => {
    console.log('Example app listening on port', process.env.PORT);
})