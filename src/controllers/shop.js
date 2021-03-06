const { Router } = require('express');
const shopService = require('../services/shop');
const { createShopFormSchema } = require('../moulds/ShopForm');
const cc = require('../utils/cc');

class ShopController {
  constructor() {
    this.shopService = null;
  }

  async init() {
    this.shopService = await shopService();

    const router = Router();
    router.get('/', this.getAll);
    router.get('/:shopId', this.getOne);
    router.post('/', this.post);
    router.put('/:shopId', this.put);
    router.delete('/:shopId', this.delete);
    return router;
  }

  getAll = cc(async (req, res) => {
    const { pageIndex, pageSize } = req.query;
    const shopList = await this.shopService.find({ pageIndex, pageSize });

    res.send({
      success: true,
      data: shopList,
    });
  });

  getOne = cc(async (req, res) => {
    const { shopId } = req.params;
    const shopList = await this.shopService.find({ id, shopId });

    if (shopList.length) {
      res.send({
        success: true,
        data: shopList[0],
      });
    } else {
      res.status(404).send({
        success: false,
        data: null,
      });
    }
  });

  post = cc(async (req, res) => {
    const { name } = req.body;

    try {
      await createShopFormSchema().validate({ name });
    } catch (e) {
      res.status(400).send({
        success: false,
        message: e.message,
      });
    }

    const shopInfo = await this.shopService.create({
      values: { name },
    });

    res.send({
      success: true,
      data: shopInfo,
    });
  });

  put = cc(async (req, res) => {
    const { shopId } = req.params;
    const { name } = req.query;

    // 校验输入字符
    try {
      await createShopFormSchema().validate({ name });
    } catch (e) {
      res.status(400).send({
        success: false,
        message: e.message,
      });
      return;
    }

    const shopInfo = await this.shopService.modify({
      id: shopId,
      values: { name },
    });

    if (shopInfo) {
      res.send({
        success: true,
        data: shopInfo,
      });
    } else {
      res.status(404).send({
        success: false,
        data: null,
      });
    }
  });

  delete = cc(async (req, res) => {
    const { shopId } = req.params;
    const success = await this.shopService.remove({
      id: shopId,
    });

    if (!success) {
      res.status(404);
    }

    res.send({
      success,
    });
  });
}

module.exports = async () => {
  const controller = new ShopController();
  return await controller.init();
};
