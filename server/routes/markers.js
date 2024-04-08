const router = require('express').Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = router;

router.get('/', async (req, res, next) => {
  try {
    const markers = await prisma.marker.findMany();
    res.send(markers);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.marker.delete({
      where: {
        id,
      },
    });
    res.sendStatus(204);
  } catch (error) {
    next(erroR);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { id, lat, lng } = req.body;

    const marker = await prisma.marker.create({
      data: {
        id,
        lat,
        lng,
      },
    });

    res.send(marker);
  } catch (error) {
    next(error);
  }
});
