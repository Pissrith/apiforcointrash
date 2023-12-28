import { Request, Response } from "express"
const Prisma = require('@prisma/client')
const prisma = new Prisma.PrismaClient();
const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())
require('dotenv').config()
app.use(express.json()); 

app.get('/building', async (req: Request, res: Response) => {
    const building = await prisma.building.findMany(
        {
            include: {
                Restaurant: {
                include: {
                    Bill: true,
                }
            }
        }
        }
    )
    res.json({building})
})

app.get('/building/restaurant', async (req: Request, res: Response) => {
    const { id } = req.params
    const building = await prisma.restaurant.findMany(
        {
            include: {
                Bill: true
            }
        }   
    
    )
    res.json({building})
})

app.get('/building/restaurant/:id', async (req: Request, res: Response) => {
    const { id } = req.params
    const Bill = await prisma.restaurant.findMany(
        {
            where: {
                id: parseInt(id)
            },include: {
                Bill: true
            }
        }   
    
    )
    res.json({restaurant: Bill})
})

app.post('/bill', async (req: Request, res: Response) => {
    const { Restaurantid, Date, start, end ,mea,sch} = req.body;
    try {
      const newBill = await prisma.Bill.create({
        data: {
          Restaurantid,
          Date,
          start,
          end,mea,sch
        }
      });
      res.status(201).json(newBill);
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while creating the bill.' });
    }
  });

  interface Bill {
    id: number;
    Date: Date;
    start: number;
    end: number;
    sch:number;
    mea:number;
    Restaurantid: number;
  }
  app.get('/yearlybill/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const yearlybill = await prisma.Bill.findMany({
        where: {
            Restaurantid: parseInt(id)
        }
    });

    const transformedYearlybill = yearlybill.map((bill:Bill) => ({
        
        ...bill,
        Date: new Date(bill.Date).toLocaleString('en-GB', { month: 'short', year: '2-digit' }),
        คิดตามหน่วยโรงเรียน: (bill.sch * (bill.end - bill.start)).toFixed(2),
        คิดหน่วยการไฟฟ้า: ((bill.end - bill.start) * bill.mea).toFixed(2) ,
    }));

    res.json(transformedYearlybill);
});

app.get('/totalyearlybill', async (req: Request, res: Response) => {
    const yearlybill = await prisma.Bill.findMany();
    const groupedYearlybill = yearlybill.reduce((acc: any[], bill: Bill) => {
        const date = new Date(bill.Date).toLocaleString('en-GB', { month: 'short', year: '2-digit' });
        let dateIndex = acc.findIndex(item => item.date === date);
        if (dateIndex === -1) {
            acc.push({
                date,
                คิดตามหน่วยโรงเรียน: parseFloat((bill.sch * (bill.end - bill.start)).toFixed(2)),
                คิดหน่วยการไฟฟ้า: parseFloat(((bill.end - bill.start) * bill.mea).toFixed(2)),
            });
        } else {
            acc[dateIndex].คิดตามหน่วยโรงเรียน += parseFloat((bill.sch * (bill.end - bill.start)).toFixed(2));
            acc[dateIndex].คิดหน่วยการไฟฟ้า += parseFloat(((bill.end - bill.start) * bill.mea).toFixed(2));
        }
        return acc;
    }, []);
    
    res.json(groupedYearlybill);
});
app.listen(process.env.PORT || 3001, () => {
    console.log('Example app listening on port', process.env.PORT);
})